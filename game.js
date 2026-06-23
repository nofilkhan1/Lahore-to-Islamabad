// ============================================================
// game.js — Core game loop, deltaTime, pause/play, state manager
// ============================================================

const Game = {
    // --- Canvas & Context ---
    canvas: null,
    ctx: null,
    scale: 1,

    // --- Game State ---
    state: 'loading', // loading | menu | playing | paused | gameOver | levelComplete | bonusStage
    currentLevel: 0,  // 0 = Level 1.1, 1 = Level 1.2, etc.
    currentSubLevel: '1.1',

    // --- Timing ---
    lastTimestamp: 0,
    deltaTime: 0,
    FPS: 0,
    frameCount: 0,
    fpsTimer: 0,

    // --- Game Data (shared across modules) ---
    distance: 0,
    scrollSpeed: 200,
    targetScrollSpeed: 200,

    // --- Mute State ---
    muted: false,

    // --- SMS Notification ---
    smsQueue: [],
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

    // --- Initialization ---
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize all modules
        Utils.init && Utils.init();
        Input.init(this.canvas);
        Audio.init();
        Camera.init(this.canvas);
        Player.init();
        Obstacles.init();
        Levels.init();
        Modes.init();
        HUD.init(this.canvas);
        Particles.init();

        // Hide loading screen after brief delay
        setTimeout(() => {
            this.state = 'menu';
            document.getElementById('loadingScreen').style.display = 'none';
            this.setupMenuListeners();
        }, 500);

        // Start the loop
        this.lastTimestamp = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    // --- Canvas Resize (maintains 16:9) ---
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

    // --- Main Game Loop ---
    loop(timestamp) {
        // Calculate deltaTime in frames (1.0 = one frame at 60fps)
        const rawDelta = (timestamp - this.lastTimestamp) / 16.667;
        this.deltaTime = Math.min(rawDelta, 3); // Cap at 3 frames to prevent spiral
        this.lastTimestamp = timestamp;

        // FPS counter
        this.frameCount++;
        this.fpsTimer += this.deltaTime / 60;
        if (this.fpsTimer >= 1) {
            this.FPS = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

        // UPDATE
        if (this.state === 'playing' || this.state === 'bonusStage') {
            this.update(this.deltaTime);
        }

        // RENDER (always, so menu/pause overlays render on top)
        this.render();

        // Next frame
        requestAnimationFrame((t) => this.loop(t));
    },

    // --- Update (called every frame when playing) ---
    update(dt) {
        // Smooth scroll speed transition
        this.scrollSpeed = Utils.lerp(this.scrollSpeed, this.targetScrollSpeed, 0.05);

        // Update distance
        this.distance += (this.scrollSpeed * dt) / 60;

        // Update all systems
        Input.update();
        Player.update(dt);
        Obstacles.update(dt);
        Camera.update(dt, this.scrollSpeed);
        Particles.update(dt);
        Modes.update(dt);
        HUD.update(dt);
        Utils.updateScreenShake(dt);

        // Check collisions
        this.checkCollisions();

        // Check level completion
        Levels.checkCompletion();

        // SMS notifications
        this.updateSMS();

        // Check game over
        if (Player.hearts <= 0) {
            this.gameOver();
        }
    },

    // --- Collision Detection ---
    checkCollisions() {
        const playerBox = Player.getHitbox();
        const activeObstacles = Obstacles.getActive();

        for (let i = 0; i < activeObstacles.length; i++) {
            const obs = activeObstacles[i];
            if (!obs.active) continue;

            const obsBox = {
                x: obs.x,
                y: obs.y,
                w: obs.w,
                h: obs.h,
            };

            if (Utils.checkAABB(playerBox, obsBox)) {
                this.handleCollision(obs);
                break; // One collision per frame
            }
        }

        // Check collectibles
        const activeCoins = Obstacles.getActiveCoins();
        for (let i = 0; i < activeCoins.length; i++) {
            const coin = activeCoins[i];
            if (!coin.active) continue;

            const coinBox = {
                x: coin.x,
                y: coin.y,
                w: coin.w,
                h: coin.h,
            };

            if (Utils.checkAABB(playerBox, coinBox)) {
                this.collectItem(coin);
            }
        }
    },

    // --- Handle Obstacle Collision ---
    handleCollision(obstacle) {
        if (Player.invincible) return;

        // Speed camera: only penalize in bike mode + speeding
        if (obstacle.type === 'speedCamera') {
            if (Player.mode === 'bike' && Player.velX > 400) {
                Player.wallet = Math.max(0, Player.wallet - 500);
                Audio.play('cameraFlash');
                Utils.triggerScreenShake(3, 0.3);
                HUD.showMessage('Rs. 500 FINE!', '#ff4444');
                // Brief flash effect
                Player.flashTimer = 0.3;
            }
            return; // Camera doesn't physically stop you
        }

        // Toll barrier: stop player
        if (obstacle.type === 'tollBarrier') {
            Player.velX = 0;
            this.targetScrollSpeed = 0;
            Modes.showTollChoice();
            return;
        }

        // Overhead wires: only hit bike mode
        if (obstacle.type === 'overheadWires') {
            if (Player.mode === 'bike') {
                Player.demoteToFoot();
                Obstacles.recycle(obstacle);
            }
            return;
        }

        // Normal hazard collision
        if (Player.mode === 'bike') {
            // Bike crash — demote to foot, no heart loss
            Player.demoteToFoot();
            Obstacles.recycle(obstacle);
            Audio.play('bikeCrash');
            Utils.triggerScreenShake(4, 0.3);
        } else {
            // Foot mode — lose a heart
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 1.5;
            Player.flashTimer = 1.5;
            Obstacles.recycle(obstacle);
            Audio.play('heartLoss');
            Utils.triggerScreenShake(3, 0.2);
            HUD.showMessage('-1 ❤️', '#ff4444');
        }
    },

    // --- Collect Item ---
    collectItem(coin) {
        switch (coin.type) {
            case 'cash10':
                Player.wallet += 10;
                Audio.play('collectCash');
                HUD.showMessage('+Rs. 10', '#FFD700');
                break;
            case 'cash50':
                Player.wallet += 50;
                Audio.play('collectCash');
                HUD.showMessage('+Rs. 50', '#FFD700');
                break;
            case 'cash100':
                Player.wallet += 100;
                Audio.play('collectCash');
                HUD.showMessage('+Rs. 100', '#FFD700');
                break;
            case 'bikeKey':
                Player.promoteToBike();
                Audio.play('collectKey');
                HUD.showMessage('🏍️ BIKE UNLOCKED!', '#4CAF50');
                break;
            case 'petrol':
                Player.fuel = Math.min(100, Player.fuel + 25);
                Audio.play('collectPetrol');
                HUD.showMessage('+⛽ FUEL', '#4CAF50');
                break;
            case 'chai':
                Player.activateChaiPower();
                Audio.play('chaiPower');
                HUD.showMessage('☕ CHAI POWER!', '#FF9800');
                break;
            case 'parchi':
                Player.parchiCount++;
                Audio.play('collectParchi');
                if (Player.parchiCount >= 3) {
                    Player.parchiCount = 0;
                    const prize = [200, 500, 1000][Utils.randomInt(0, 2)];
                    Player.wallet += prize;
                    HUD.showMessage('🎰 PARCHI LOTTERY! +' + 'Rs. ' + prize, '#FFD700');
                } else {
                    HUD.showMessage('🎫 Parchi (' + Player.parchiCount + '/3)', '#ccc');
                }
                break;
        }
        Obstacles.recycleCoin(coin);
        Particles.burst(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, Utils.COLORS.SPARK);
    },

    // --- SMS Notifications ---
    updateSMS() {
        if (this.smsActive) {
            this.smsTimer -= this.deltaTime / 60;
            if (this.smsTimer <= 0) {
                this.smsActive = false;
                document.getElementById('smsNotification').classList.remove('show');
            }
            return;
        }

        // Send SMS every 500-1000 units
        if (this.distance - this.lastSmsDistance > Utils.random(500, 1000)) {
            this.sendRandomSMS();
            this.lastSmsDistance = this.distance;
        }
    },

    sendRandomSMS() {
        const msg = this.SMS_MESSAGES[Utils.randomInt(0, this.SMS_MESSAGES.length - 1)];
        const el = document.getElementById('smsNotification');
        el.querySelector('.sender').textContent = msg.sender;
        el.querySelector('.message').textContent = msg.text;
        el.classList.add('show');
        this.smsActive = true;
        this.smsTimer = 2;
    },

    // --- State Transitions ---
    startGame() {
        this.state = 'playing';
        this.currentLevel = 0;
        this.currentSubLevel = '1.1';
        this.distance = 0;
        this.scrollSpeed = 200;
        this.targetScrollSpeed = 200;
        this.lastSmsDistance = 0;

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

    gameOver() {
        this.state = 'gameOver';
        this.scrollSpeed = 0;
        this.targetScrollSpeed = 0;
        Audio.play('gameOver');

        // Update stats
        const stats = document.getElementById('gameOverStats');
        stats.innerHTML =
            'Distance: ' + Math.floor(this.distance) + ' m<br>' +
            'Wallet: Rs. ' + Utils.formatRupees(Player.wallet) + '<br>' +
            'Level: ' + this.getLevelName();

        this.showScreen('gameOverScreen');
        HUD.hide();
    },

    levelComplete() {
        this.state = 'levelComplete';
        this.scrollSpeed = 0;
        this.targetScrollSpeed = 0;
        Audio.play('levelComplete');

        const stats = document.getElementById('levelCompleteStats');
        stats.innerHTML =
            'Distance: ' + Math.floor(this.distance) + ' m<br>' +
            'Wallet: Rs. ' + Utils.formatRupees(Player.wallet);

        this.showScreen('levelCompleteScreen');
    },

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel >= Levels.totalLevels) {
            // Game won!
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

    gameWon() {
        this.state = 'gameOver';
        const stats = document.getElementById('gameOverStats');
        stats.innerHTML =
            '🎉 YOU REACHED THE MONAL!<br><br>' +
            'Total Distance: ' + Math.floor(this.distance) + ' m<br>' +
            'Final Wallet: Rs. ' + Utils.formatRupees(Player.wallet) + '<br><br>' +
            'BOHAT HARD! 🔥';

        document.querySelector('#gameOverScreen .screen-title').textContent = '🏆 VICTORY!';
        this.showScreen('gameOverScreen');
    },

    startBonusStage() {
        this.state = 'bonusStage';
        Modes.startBonusStage();
    },

    getLevelName() {
        const names = [
            "Lahore — Mama's Doodh Run",
            'Lahore — Liberty Market Rush',
            'GT Road — Truck Art Gauntlet',
            'GT Road — Jhelum Toll Plaza',
            'Islamabad — Signal Sprint',
            'Islamabad — Final Climb to Monal',
        ];
        return names[this.currentLevel] || 'Unknown';
    },

    // --- Screen Management ---
    hideAllScreens() {
        document.querySelectorAll('.screen-overlay').forEach(s => s.classList.remove('active'));
    },

    showScreen(id) {
        this.hideAllScreens();
        document.getElementById(id).classList.add('active');
    },

    setupMenuListeners() {
        document.getElementById('btnStart').addEventListener('click', () => this.startGame());
        document.getElementById('btnResume').addEventListener('click', () => this.resume());
        document.getElementById('btnRetry').addEventListener('click', () => this.startGame());
        document.getElementById('btnMenu').addEventListener('click', () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            HUD.hide();
        });
        document.getElementById('btnNextLevel').addEventListener('click', () => this.nextLevel());
        document.getElementById('btnPause').addEventListener('click', () => this.pause());
        document.getElementById('btnQuit').addEventListener('click', () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            HUD.hide();
        });

        // Mute buttons
        const muteHandler = () => {
            this.muted = !this.muted;
            Audio.setMuted(this.muted);
            const label = this.muted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
            document.getElementById('btnMuteStart').textContent = label;
            document.getElementById('btnMutePause').textContent = label;
        };
        document.getElementById('btnMuteStart').addEventListener('click', muteHandler);
        document.getElementById('btnMutePause').addEventListener('click', muteHandler);
    },

    // --- Render ---
    render() {
        const ctx = this.ctx;
        ctx.save();

        // Apply screen shake
        ctx.translate(Utils.screenShake.offsetX, Utils.screenShake.offsetY);

        // Clear
        ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);

        // Draw layers (back to front)
        Camera.render(ctx);

        if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameOver' || this.state === 'levelComplete') {
            Obstacles.render(ctx);
            Player.render(ctx);
            Particles.render(ctx);
        }

        if (this.state === 'bonusStage') {
            Modes.renderBonusStage(ctx);
        }

        // Mode overlays (load shedding darkness, etc.)
        Modes.renderOverlay(ctx);

        ctx.restore();
    },
};

// --- Start the game when page loads ---
window.addEventListener('load', () => {
    Game.init();
});
