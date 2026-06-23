// ============================================================
// game.js — Core game loop, deltaTime, pause/play, state manager
// ============================================================

const Game = {
    canvas: null,
    ctx: null,
    scale: 1,
    state: 'loading',
    currentLevel: 0,
    currentSubLevel: '1.1',
    lastTimestamp: 0,
    deltaTime: 0,
    FPS: 0,
    frameCount: 0,
    fpsTimer: 0,
    distance: 0,
    scrollSpeed: 200,
    targetScrollSpeed: 200,
    muted: false,
    tollBarrierSpawned: false,
    bikeKeySpawned: false,
    smsActive: false,
    smsTimer: 0,
    lastSmsDistance: 0,
    SMS_MESSAGES: [
        { sender: 'Ammi', text: 'Doodh le aana, jaldi karo!' },
        { sender: 'Abbu', text: 'GT Road pe dhyan se, speed mat karo' },
        { sender: 'Dost', text: 'Kahan ho yar? Party hai aaj!' },
        { sender: 'Ammi', text: 'Khana kha liya?' },
        { sender: 'Abbu', text: 'Phone charge kar lena' },
        { sender: 'Bhen', text: 'Mere liye chaye le aana' },
        { sender: 'Dost', text: 'Late ho rahe ho, jaldi aao!' },
        { sender: 'Ammi', text: 'Raat ko jaldi so jana' },
    ],

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        Utils.init();
        Input.init(this.canvas);
        Audio.init();
        Camera.init(this.canvas);
        Player.init();
        Obstacles.init();
        Levels.init();
        Modes.init();
        HUD.init(this.canvas);
        Particles.init();

        // Load assets (non-blocking, falls back to vector if missing)
        AssetLoader.init(() => {
            console.log('[Game] Assets loaded or fallback ready');
        });

        this.setupMenuListeners();

        setTimeout(() => {
            this.state = 'menu';
            document.getElementById('loadingScreen').style.display = 'none';
        }, 800);

        this.lastTimestamp = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const targetRatio = 16 / 9;
        let canvasW, canvasH;
        if (containerW / containerH > targetRatio) {
            canvasH = containerH;
            canvasW = canvasH * targetRatio;
        } else {
            canvasW = containerW;
            canvasH = canvasW / targetRatio;
        }
        this.canvas.style.width = canvasW + 'px';
        this.canvas.style.height = canvasH + 'px';
        this.scale = this.canvas.width / canvasW;
    },

    loop(timestamp) {
        const rawDelta = (timestamp - this.lastTimestamp) / 16.667;
        this.deltaTime = Math.min(rawDelta, 3);
        this.lastTimestamp = timestamp;

        this.fpsTimer += this.deltaTime / 60;
        if (this.fpsTimer >= 1) {
            this.FPS = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        this.frameCount++;

        if (this.state === 'playing' || this.state === 'bonusStage') {
            this.update(this.deltaTime);
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    },

    update(dt) {
        this.scrollSpeed = Utils.lerp(this.scrollSpeed, this.targetScrollSpeed, 0.05);
        this.distance += (this.scrollSpeed * dt) / 60;

        // Check for mode triggers based on distance
        const levelData = Levels.currentLevelData;
        if (levelData) {
            // Load shedding trigger
            if (levelData.loadSheddingAt && !Modes.loadShedding.active && this.distance >= levelData.loadSheddingAt) {
                Modes.activateLoadShedding();
            }
            // Chalaan chase trigger
            if (levelData.isChaseModeActive && !Modes.chalaan.active && this.distance >= (levelData.chalaanStart || 2000)) {
                Modes.activateChalaan();
            }
            // Toll barrier spawn at exact distance
            if (levelData.hasTollBarrier && !this.tollBarrierSpawned && this.distance >= levelData.tollDistance) {
                this.tollBarrierSpawned = true;
                Obstacles.spawnTollBarrier();
            }
            // Bike key spawn at exact distance
            if (levelData.bikeKeyAt && !this.bikeKeySpawned && this.distance >= levelData.bikeKeyAt && Player.mode === 'foot') {
                this.bikeKeySpawned = true;
                Obstacles.spawnBikeKeyAtDistance(levelData.bikeKeyAt);
            }
        }

        Input.update();
        Player.update(dt);
        Obstacles.update(dt);
        Camera.update(dt, this.scrollSpeed);
        Particles.update(dt);
        Modes.update(dt);
        HUD.update(dt);
        Utils.updateScreenShake(dt);

        this.checkCollisions();
        Levels.checkCompletion();
        this.updateSMS();

        if (Player.hearts <= 0) {
            this.gameOver();
        }

        if (Input.isPause()) {
            this.pause();
        }
        if (Input.isMute()) {
            this.toggleMute();
        }
    },

    checkCollisions() {
        const playerBox = Player.getHitbox();
        const activeObs = Obstacles.getActive();
        for (let i = 0; i < activeObs.length; i++) {
            const obs = activeObs[i];
            if (!obs.active) continue;
            if (Utils.checkAABB(playerBox, { x: obs.x, y: obs.y, w: obs.w, h: obs.h })) {
                this.handleCollision(obs);
                break;
            }
        }
        const activeCoins = Obstacles.getActiveCoins();
        for (let i = 0; i < activeCoins.length; i++) {
            const coin = activeCoins[i];
            if (!coin.active) continue;
            if (Utils.checkAABB(playerBox, { x: coin.x, y: coin.y, w: coin.w, h: coin.h })) {
                this.collectItem(coin);
            }
        }
    },

    handleCollision(obstacle) {
        if (Player.invincible) return;
        if (obstacle.type === 'speedCamera') {
            if (Player.mode === 'bike' && Player.velX > 400) {
                Player.wallet = Math.max(0, Player.wallet - 500);
                Audio.play('cameraFlash');
                Utils.triggerScreenShake(3, 0.3);
                HUD.showMessage('Rs. 500 FINE!', '#ff4444');
            }
            return;
        }
        if (obstacle.type === 'tollBarrier') {
            Player.velX = 0;
            this.targetScrollSpeed = 0;
            this.scrollSpeed = 0;
            Modes.showTollChoice();
            return;
        }
        if (obstacle.type === 'overheadWires') {
            if (Player.mode === 'bike') {
                Player.demoteToFoot();
                Obstacles.recycle(obstacle);
            }
            return;
        }
        if (Player.mode === 'bike') {
            if (Player.shieldCount > 0) {
                Player.shieldCount--;
                HUD.showMessage('SHIELD USED!', '#4CAF50');
                Obstacles.recycle(obstacle);
                Utils.triggerScreenShake(2, 0.15);
            } else {
                Player.demoteToFoot();
                Obstacles.recycle(obstacle);
                Utils.triggerScreenShake(4, 0.3);
            }
        } else {
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 1.5;
            Player.flashTimer = 1.5;
            Obstacles.recycle(obstacle);
            Audio.play('heartLoss');
            Utils.triggerScreenShake(3, 0.2);
        }
    },

    collectItem(coin) {
        switch (coin.type) {
            case 'cash10': Player.wallet += 10; Audio.play('collectCash'); HUD.showMessage('+Rs. 10', '#FFD700'); break;
            case 'cash50': Player.wallet += 50; Audio.play('collectCash'); HUD.showMessage('+Rs. 50', '#FFD700'); break;
            case 'cash100': Player.wallet += 100; Audio.play('collectCash'); HUD.showMessage('+Rs. 100', '#FFD700'); break;
            case 'bikeKey': Player.promoteToBike(); Audio.play('collectKey'); HUD.showMessage('BIKE UNLOCKED!', '#4CAF50'); break;
            case 'petrol': Player.fuel = Math.min(Player.maxFuel, Player.fuel + 25); Audio.play('collectPetrol'); HUD.showMessage('+FUEL', '#4CAF50'); break;
            case 'chai': Player.activateChaiPower(); Audio.play('chaiPower'); HUD.showMessage('CHAI POWER!', '#FF9800'); break;
            case 'jugaadRepair':
                if (Player.wallet >= 200) {
                    Player.wallet -= 200;
                    Player.promoteToBike();
                    Audio.play('collectKey');
                    HUD.showMessage('JUGAAD REPAIR! -Rs.200', '#4CAF50');
                } else {
                    HUD.showMessage('Need Rs. 200 for repair!', '#ff4444');
                }
                break;
            case 'parchi':
                Player.parchiCount++;
                Audio.play('collectParchi');
                if (Player.parchiCount >= 3) {
                    Player.parchiCount = 0;
                    const prize = [200, 500, 1000][Utils.randomInt(0, 2)];
                    Player.wallet += prize;
                    HUD.showMessage('PARCHI LOTTERY! +Rs.' + prize, '#FFD700');
                } else {
                    HUD.showMessage('Parchi (' + Player.parchiCount + '/3)', '#ccc');
                }
                break;
        }
        Obstacles.recycleCoin(coin);
        Particles.burst(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, '#FFD700');
    },

    updateSMS() {
        if (this.state !== 'playing') return;
        if (this.smsActive) {
            this.smsTimer -= this.deltaTime / 60;
            if (this.smsTimer <= 0) {
                this.smsActive = false;
                document.getElementById('smsNotification').classList.remove('show');
            }
            return;
        }
        if (this.distance - this.lastSmsDistance > Utils.random(500, 1000)) {
            const msg = this.SMS_MESSAGES[Utils.randomInt(0, this.SMS_MESSAGES.length - 1)];
            const el = document.getElementById('smsNotification');
            el.querySelector('.sender').textContent = msg.sender;
            el.querySelector('.message').textContent = msg.text;
            el.classList.add('show');
            this.smsActive = true;
            this.smsTimer = 2;
            this.lastSmsDistance = this.distance;
        }
    },

    startGame() {
        Audio.resume();
        this.state = 'playing';
        this.currentLevel = 0;
        this.distance = 0;
        this.scrollSpeed = 200;
        this.targetScrollSpeed = 200;
        this.lastSmsDistance = 0;
        this.tollBarrierSpawned = false;
        this.bikeKeySpawned = false;
        Player.reset();
        Obstacles.reset();
        Levels.loadLevel(0);
        Camera.reset();
        Particles.reset();
        Modes.reset();
        this.hideAllScreens();
        HUD.show();
    },

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.showScreen('pauseScreen');
        }
    },

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.hideAllScreens();
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        Audio.setMuted(this.muted);
        const label = this.muted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
        document.getElementById('btnMuteStart').textContent = label;
        document.getElementById('btnMutePause').textContent = label;
    },

    gameOver() {
        if (this.state === 'gameOver') return;
        this.state = 'gameOver';
        this.scrollSpeed = 0;
        this.targetScrollSpeed = 0;
        Audio.play('gameOver');
        const finalScore = Math.floor(this.distance) + Player.wallet;
        SaveData.addScore(finalScore, this.distance, Player.wallet);
        SaveData.saveGameState();
        document.getElementById('gameOverStats').innerHTML =
            'Distance: ' + Math.floor(this.distance) + ' m<br>' +
            'Wallet: Rs. ' + Utils.formatRupees(Player.wallet) + '<br>' +
            'Level: ' + this.getLevelName() + '<br>' +
            'Score: ' + Utils.formatRupees(finalScore);
        this.showScreen('gameOverScreen');
        HUD.hide();
    },

    levelComplete() {
        if (this.state === 'levelComplete') return;
        this.state = 'levelComplete';
        this.scrollSpeed = 0;
        this.targetScrollSpeed = 0;
        Audio.play('levelComplete');
        SaveData.saveGameState();
        document.getElementById('levelCompleteStats').innerHTML =
            'Distance: ' + Math.floor(this.distance) + ' m<br>' +
            'Wallet: Rs. ' + Utils.formatRupees(Player.wallet);
        this.showScreen('levelCompleteScreen');
        HUD.hide();
    },

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel >= Levels.totalLevels) {
            this.gameWon();
            return;
        }
        this.distance = 0;
        this.scrollSpeed = 200;
        this.targetScrollSpeed = 200;
        Player.resetForNewLevel();
        Obstacles.reset();
        Levels.loadLevel(this.currentLevel);
        Camera.reset();
        Particles.reset();
        Modes.reset();
        this.hideAllScreens();
        this.state = 'playing';
        HUD.show();
    },

    openGarageOrNext() {
        // Open garage every 2 levels (after level 2 and 4)
        if (this.currentLevel > 0 && this.currentLevel % 2 === 1 && this.currentLevel < Levels.totalLevels - 1) {
            Modes.openGarage();
        } else {
            this.nextLevel();
        }
    },

    continueAfterLevel() {
        this.hideAllScreens();
        this.nextLevel();
    },

    gameWon() {
        if (this.state === 'gameOver') return;
        this.state = 'gameOver';
        this.scrollSpeed = 0;
        // Celebration particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                Particles.burst(
                    Utils.random(100, 700),
                    Utils.random(100, 350),
                    5,
                    ['#FFD700', '#FF6F00', '#4CAF50', '#E91E63', '#2196F3'][Utils.randomInt(0, 4)]
                );
            }, i * 50);
        }
        const finalScore = Math.floor(this.distance) + Player.wallet;
        SaveData.addScore(finalScore, this.distance, Player.wallet);
        SaveData.saveGameState();
        document.getElementById('gameOverStats').innerHTML =
            'YOU REACHED THE MONAL!<br><br>' +
            'Total Distance: ' + Math.floor(this.distance) + ' m<br>' +
            'Final Wallet: Rs. ' + Utils.formatRupees(Player.wallet) + '<br>' +
            'Score: ' + Utils.formatRupees(finalScore) + '<br><br>' +
            'BOHAT HARD!';
        document.querySelector('#gameOverScreen .screen-title').textContent = 'VICTORY!';
        this.showScreen('gameOverScreen');
        HUD.hide();
    },

    startBonusStage() {
        this.state = 'bonusStage';
        Modes.startBonusStage();
    },

    getLevelName() {
        const names = ["Lahore - Doodh Run", 'Lahore - Liberty Market', 'GT Road - Truck Art', 'GT Road - Toll Plaza', 'Islamabad - Signal Sprint', 'Islamabad - Monal Climb'];
        return names[this.currentLevel] || 'Unknown';
    },

    hideAllScreens() {
        document.querySelectorAll('.screen-overlay').forEach(s => s.classList.remove('active'));
    },

    showScreen(id) {
        this.hideAllScreens();
        document.getElementById(id).classList.add('active');
    },

    setupMenuListeners() {
        document.getElementById('btnStart').onclick = () => { Audio.resume(); this.startGame(); };
        document.getElementById('btnResume').onclick = () => this.resume();
        document.getElementById('btnRetry').onclick = () => { Audio.resume(); this.startGame(); };
        document.getElementById('btnMenu').onclick = () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            HUD.hide();
        };
        document.getElementById('btnNextLevel').onclick = () => this.openGarageOrNext();
        document.getElementById('btnGarageSkip').onclick = () => Modes.closeGarage();
        document.getElementById('btnPause').onclick = () => { if (this.state === 'playing') this.pause(); else if (this.state === 'paused') this.resume(); };
        document.getElementById('btnQuit').onclick = () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            HUD.hide();
        };
        document.getElementById('btnMuteStart').onclick = () => this.toggleMute();
        document.getElementById('btnMutePause').onclick = () => this.toggleMute();
    },

    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(Utils.screenShake.offsetX, Utils.screenShake.offsetY);
        ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);

        if (this.state === 'menu') {
            Camera.render(ctx);
        } else if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameOver' || this.state === 'levelComplete') {
            Camera.render(ctx);
            Obstacles.render(ctx);
            Levels.renderDecorations(ctx);
            Player.render(ctx);
            Particles.render(ctx);
            HUD.renderMessages(ctx);
            Modes.renderOverlay(ctx);
        } else if (this.state === 'bonusStage') {
            Camera.render(ctx);
            Obstacles.render(ctx);
            Player.render(ctx);
            Particles.render(ctx);
            Modes.renderBonusStage(ctx);
            Modes.renderOverlay(ctx);
        }

        ctx.restore();
    },
};

window.addEventListener('load', () => { Game.init(); });
