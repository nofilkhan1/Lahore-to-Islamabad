// ============================================================
// game.js — Core game loop, state manager, chapter machine
// ============================================================

const Game = {
    canvas: null,
    ctx: null,
    scale: 1,
    state: 'loading',
    currentLevel: 0,
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
    chalaanCompleted: false,
    loadSheddingCompleted: false,
    nearMissCombo: 0,
    nearMissTimer: 0,
    levelIntroTimer: 0,
    levelIntroText: '',
    levelIntroSubtext: '',
    fadeAlpha: 1,
    fadeDirection: -1,

    // Chapter state machine
    chapterState: 'CH1_PROLOGUE',
    chapterStates: [
        'CH1_PROLOGUE',
        'CH1_MAMA_HOME',
        'CH1_PLAYING',
        'CH1_GARAGE',
        'CH2_PROLOGUE',
        'CH2_PLAYING',
        'CH2_GARAGE',
        'CH2_NARAN_PROLOGUE',
        'CH2_NARAN_PLAYING',
        'CH2_NARAN_GARAGE',
        'CH3_PROLOGUE',
        'CH3_PLAYING',
        'CH3_GARAGE',
        'CH4_PROLOGUE',
        'CH4_PLAYING',
        'CH4_GARAGE',
        'CH4_NARAN_PROLOGUE',
        'CH4_NARAN_PLAYING',
        'CH4_NARAN_GARAGE',
        'CH5_PROLOGUE',
        'CH5_PLAYING',
        'CH5_GARAGE',
        'CH5_NARAN_PROLOGUE',
        'CH5_NARAN_PLAYING',
        'CH5_NARAN_GARAGE',
        'GAME_ENDING',
    ],

    chapterData: [
        { chapter: 0, name: 'Lahore', color: '#FF8F00', levels: [0, 1] },
        { chapter: 1, name: 'GT Road', color: '#F57F17', levels: [2, 3] },
        { chapter: 2, name: 'Islamabad', color: '#2E7D32', levels: [4, 5] },
        { chapter: 3, name: 'Murree', color: '#1565C0', levels: [6, 7] },
        { chapter: 4, name: 'Naran Valley', color: '#4A148C', levels: [8, 9] },
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
        Story.init();
        Economy.init();

        const totalAssets = Object.keys(AssetLoader.manifest).length;
        let loadedAssets = 0;
        AssetLoader.init(() => {
            loadedAssets = totalAssets;
            this.updateLoadingBar(loadedAssets, totalAssets);
        });
        const loadInterval = setInterval(() => {
            loadedAssets = Object.keys(AssetLoader.images).length;
            this.updateLoadingBar(loadedAssets, totalAssets);
            if (loadedAssets >= totalAssets) clearInterval(loadInterval);
        }, 100);

        this.setupMenuListeners();

        setTimeout(() => {
            this.state = 'menu';
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1200);

        this.lastTimestamp = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    updateLoadingBar(loaded, total) {
        const pct = Math.min(100, Math.round((loaded / total) * 100));
        const fill = document.getElementById('loadingBarFill');
        const text = document.getElementById('loadingText');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = 'Loading assets... ' + pct + '%';
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
        } else if (this.state === 'levelIntro') {
            this.levelIntroTimer -= this.deltaTime / 60;
            if (this.levelIntroTimer <= 0) {
                this.state = 'playing';
                this.fadeAlpha = 1;
                this.fadeDirection = -1;
            }
        } else if (this.state === 'chapterIntro') {
            this.levelIntroTimer -= this.deltaTime / 60;
            if (this.levelIntroTimer <= 0) {
                Story.startChapterIntro(this.currentChapter);
                this.state = 'dialogue';
            }
        } else if (this.state === 'homeScene') {
            Story.updateHomeScene(this.deltaTime);
        } else if (this.state === 'dialogue') {
            Story.update(this.deltaTime);
        } else if (this.state === 'chapterComplete') {
            // Just waiting for user to click NEXT LEVEL button
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    },

    update(dt) {
        this.scrollSpeed = Utils.lerp(this.scrollSpeed, this.targetScrollSpeed, 0.05);
        this.distance += (this.scrollSpeed * dt) / 60;

        const levelData = Levels.currentLevelData;
        if (levelData) {
            if (levelData.loadSheddingAt && !Modes.loadShedding.active) {
                if (!this.nextLoadSheddingAt) this.nextLoadSheddingAt = levelData.loadSheddingAt;
                if (this.distance >= this.nextLoadSheddingAt) {
                    Modes.activateLoadShedding();
                    this.nextLoadSheddingAt = this.distance + (levelData.loadSheddingInterval || 8000);
                }
            }
            if (levelData.isChaseModeActive && !Modes.chalaan.active) {
                if (!this.nextChalaanAt) this.nextChalaanAt = levelData.chalaanStart || 3000;
                if (this.distance >= this.nextChalaanAt) {
                    Modes.activateChalaan();
                    this.nextChalaanAt = this.distance + (levelData.chalaanInterval || 8000);
                }
            }
            if (levelData.hasTollBarrier && !this.tollBarrierSpawned && this.distance >= levelData.tollDistance) {
                this.tollBarrierSpawned = true;
                Obstacles.spawnTollBarrier();
            }
            if (levelData.bikeKeyAt && !this.bikeKeySpawned && this.distance >= levelData.bikeKeyAt && Player.mode === 'foot') {
                this.bikeKeySpawned = true;
                Obstacles.spawnBikeKeyAtDistance(levelData.bikeKeyAt);
            }
            if (levelData.loadSheddingAlways && !Modes.loadShedding.active) {
                Modes.activateLoadShedding();
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
        Economy.check(this.currentLevel);

        this.checkCollisions();
        this.checkNearMisses();
        Levels.checkCompletion();
        Story.checkDistanceBeats();
        Story.checkSms();

        if (this.nearMissTimer > 0) {
            this.nearMissTimer -= dt / 60;
            if (this.nearMissTimer <= 0) this.nearMissCombo = 0;
        }

        if (Player.hearts <= 0) this.gameOver();
        if (Input.isPause()) this.pause();
        if (Input.isMute()) this.toggleMute();
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

    checkNearMisses() {
        const playerBox = Player.getHitbox();
        const margin = 20;
        const expanded = { x: playerBox.x - margin, y: playerBox.y - margin, w: playerBox.w + margin * 2, h: playerBox.h + margin * 2 };
        const activeObs = Obstacles.getActive();
        for (let i = 0; i < activeObs.length; i++) {
            const obs = activeObs[i];
            if (!obs.active || obs.nearMissed) continue;
            if (obs.type === 'tollBarrier' || obs.type === 'overheadWires') continue;
            if (Utils.checkAABB(expanded, { x: obs.x, y: obs.y, w: obs.w, h: obs.h })) {
                if (!Utils.checkAABB(playerBox, { x: obs.x, y: obs.y, w: obs.w, h: obs.h })) {
                    obs.nearMissed = true;
                    this.nearMissCombo++;
                    this.nearMissTimer = 2;
                    const bonus = this.nearMissCombo * 10;
                    Player.wallet += bonus;
                    const msg = this.nearMissCombo > 1
                        ? 'CLOSE CALL x' + this.nearMissCombo + '! +Rs.' + bonus
                        : 'CLOSE CALL! +Rs.' + bonus;
                    HUD.showMessage(msg, '#00E5FF');
                    Utils.triggerScreenShake(1, 0.1);
                }
            }
        }
    },

    handleCollision(obstacle) {
        if (Player.invincible) return;
        if (obstacle.type === 'speedCamera') {
            if (Player.mode === 'bike') {
                Player.wallet = Math.max(0, Player.wallet - 500);
                Audio.play('cameraFlash');
                Utils.triggerScreenShake(3, 0.3);
                HUD.showMessage('-Rs. 500 FINE!', '#ff4444');
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
        if (obstacle.type === 'monkey') {
            if (Player.fuel > 0) Player.fuel = Math.min(Player.maxFuel, Player.fuel - 20);
            Obstacles.recycle(obstacle);
            HUD.showMessage('Monkey stole fuel!', '#FF5722');
            return;
        }
        if (obstacle.type === 'tourist') {
            Utils.triggerScreenShake(2, 0.2);
            HUD.showMessage('Tourist selfie stick!', '#FF9800');
            Obstacles.recycle(obstacle);
            return;
        }
        if (obstacle.type === 'flashFlood') {
            Player.velX = -300;
            Player.velY = -100;
            Utils.triggerScreenShake(5, 0.4);
            HUD.showMessage('Flash flood!', '#1565C0');
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 1.5;
            Obstacles.recycle(obstacle);
            Audio.play('heartLoss');
            return;
        }
        if (obstacle.type === 'rollingRock') {
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 1.5;
            Utils.triggerScreenShake(4, 0.3);
            HUD.showMessage('Rock hit!', '#FF5722');
            Obstacles.recycle(obstacle);
            Audio.play('heartLoss');
            return;
        }
        if (obstacle.type === 'mountainGoat') {
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 1.5;
            Utils.triggerScreenShake(3, 0.2);
            HUD.showMessage('Goat attack!', '#8D6E63');
            Obstacles.recycle(obstacle);
            Audio.play('heartLoss');
            return;
        }
        if (obstacle.type === 'icePatch') {
            Player.velX = -150;
            Utils.triggerScreenShake(2, 0.15);
            HUD.showMessage('Ice! Sliding...', '#81D4FA');
            Obstacles.recycle(obstacle);
            return;
        }
        if (obstacle.type === 'narrowBridge') {
            if (Player.mode === 'bike') {
                Player.demoteToFoot();
                Obstacles.recycle(obstacle);
                HUD.showMessage('Bridge too narrow!', '#FF9800');
            }
            return;
        }
        if (obstacle.type === 'lightningZone') {
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 2;
            Utils.triggerScreenShake(6, 0.5);
            HUD.showMessage('Lightning!', '#FFD700');
            Obstacles.recycle(obstacle);
            Audio.play('heartLoss');
            return;
        }
        if (Player.mode === 'bike') {
            if (Player.shieldCount > 0) {
                Player.shieldCount--;
                HUD.showMessage('SHIELD!', '#4CAF50');
                Obstacles.recycle(obstacle);
                Utils.triggerScreenShake(2, 0.15);
            } else {
                Player.demoteToFoot();
                Obstacles.recycle(obstacle);
                Player.hitFlashTimer = 0.3;
                Utils.triggerScreenShake(4, 0.3);
            }
        } else {
            Player.hearts--;
            Player.invincible = true;
            Player.invincibleTimer = 1.5;
            Player.flashTimer = 1.5;
            Player.hitFlashTimer = 0.3;
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
            case 'cash500': Player.wallet += 500; Audio.play('collectCash'); HUD.showMessage('+Rs. 500!', '#FFD700'); break;
            case 'bikeKey': Player.promoteToBike(); Audio.play('collectKey'); HUD.showMessage('BIKE UNLOCKED!', '#4CAF50'); break;
            case 'petrol': Player.fuel = Math.min(Player.maxFuel, Player.fuel + 25); Audio.play('collectPetrol'); HUD.showMessage('+FUEL', '#4CAF50'); break;
            case 'chai': Player.activateChaiPower(); Audio.play('chaiPower'); HUD.showMessage('CHAI POWER!', '#FF9800'); break;
            case 'hotChai': Player.activateChaiPower(); Audio.play('chaiPower'); HUD.showMessage('HOT CHAI! +Warmth', '#FF9800'); break;
            case 'jugaadRepair':
                if (Player.wallet >= 200) {
                    Player.wallet -= 200;
                    Player.promoteToBike();
                    Audio.play('collectKey');
                    HUD.showMessage('REPAIR -Rs.200', '#4CAF50');
                } else {
                    HUD.showMessage('Need Rs. 200!', '#ff4444');
                }
                break;
            case 'parchi':
                Player.parchiCount++;
                Audio.play('collectParchi');
                if (Player.parchiCount >= 3) {
                    Player.parchiCount = 0;
                    const prize = [200, 500, 1000][Utils.randomInt(0, 2)];
                    Player.wallet += prize;
                    HUD.showMessage('BONUS +Rs.' + prize, '#FFD700');
                } else {
                    HUD.showMessage('Parchi ' + Player.parchiCount + '/3', '#ccc');
                }
                break;
            case 'bhutta':
                Player.hearts = Math.min(Player.maxHearts, Player.hearts + 1);
                Audio.play('collectCash');
                HUD.showMessage('Bhutta! +1 Heart', '#4CAF50');
                Particles.burst(coin.x + coin.w / 2, coin.y + coin.h / 2, 10, '#4CAF50');
                break;
            case 'shawl':
                Player.shieldCount++;
                Audio.play('collectCash');
                HUD.showMessage('Shawl! +Shield', '#9C27B0');
                Particles.burst(coin.x + coin.w / 2, coin.y + coin.h / 2, 10, '#9C27B0');
                break;
            case 'guava':
                Player.wallet += 25;
                Audio.play('collectCash');
                HUD.showMessage('Guava! +Rs.25', '#4CAF50');
                break;
            case 'jeepToken':
                Player.fuel = Player.maxFuel;
                Player.wallet += 100;
                Audio.play('collectKey');
                HUD.showMessage('Jeep ride! +Fuel +Rs.100', '#FF9800');
                Particles.burst(coin.x + coin.w / 2, coin.y + coin.h / 2, 15, '#FF9800');
                break;
            case 'delivery':
                Player.wallet += 75;
                Audio.play('collectCash');
                HUD.showMessage('Delivery! +Rs.75', '#FFD700');
                break;
        }
        Obstacles.recycleCoin(coin);
        Particles.burst(coin.x + coin.w / 2, coin.y + coin.h / 2, 8, '#FFD700');
    },

    startGame() {
        Audio.resume();
        this.state = 'playing';
        this.currentLevel = 0;
        this.currentChapter = 0;
        this.distance = 0;
        const levelData = Levels.levels[0];
        this.scrollSpeed = levelData ? levelData.scrollSpeed : 110;
        this.targetScrollSpeed = this.scrollSpeed;
        this.nearMissCombo = 0;
        this.nearMissTimer = 0;
        this.tollBarrierSpawned = false;
        this.bikeKeySpawned = false;
        this.chalaanCompleted = false;
        this.loadSheddingCompleted = false;
        this.nextLoadSheddingAt = 0;
        this.nextChalaanAt = 0;
        Player.reset();
        Obstacles.reset();
        Levels.loadLevel(0, 0);
        Camera.reset();
        Particles.reset();
        Modes.reset();
        HUD.init();
        Economy.init();
        this.hideAllScreens();
        HUD.show();
        this.showLevelIntro();
    },

    startLevel(levelIndex, chapter) {
        this.state = 'playing';
        this.currentLevel = levelIndex;
        this.currentChapter = chapter !== undefined ? chapter : Math.floor(levelIndex / 2);
        this.distance = 0;
        this.scrollSpeed = 100;
        this.targetScrollSpeed = 100;
        this.nearMissCombo = 0;
        this.nearMissTimer = 0;
        this.tollBarrierSpawned = false;
        this.bikeKeySpawned = false;
        this.chalaanCompleted = false;
        this.loadSheddingCompleted = false;
        this.nextLoadSheddingAt = 0;
        this.nextChalaanAt = 0;
        Player.resetForNewLevel();
        Obstacles.reset();
        // Determine levelInChapter from levelIndex
        const levelInChapter = levelIndex % 2;
        Levels.loadLevel(this.currentChapter, levelInChapter);
        Camera.reset();
        Particles.reset();
        Modes.reset();
        HUD.init();
        this.hideAllScreens();
        HUD.show();
        this.showLevelIntro();
    },

    showChapterComplete(nextChapter) {
        this.state = 'chapterComplete';
        this.scrollSpeed = 0;
        this.targetScrollSpeed = 0;
        Audio.play('levelComplete');
        SaveData.saveGameState();
        document.getElementById('levelCompleteStats').innerHTML =
            'Chapter ' + this.currentChapter + ' Complete!<br>' +
            'Wallet: Rs. ' + Utils.formatRupees(Player.wallet);
        this.showScreen('levelCompleteScreen');
        HUD.hide();
    },

    showLevelIntro() {
        const levelData = Levels.currentLevelData;
        if (!levelData) return;
        this.levelIntroText = levelData.city + ' — ' + levelData.name;
        this.levelIntroSubtext = 'Survive ' + levelData.distance + 'm';
        this.state = 'levelIntro';
        this.levelIntroTimer = 2.5;
        this.fadeAlpha = 1;
        this.fadeDirection = 1;
    },

    getChapterIntroText(chapter) {
        const texts = [
            'Ali ghar se nikalta hai.',
            'GT Road ka safar shuru.',
            'Islamabad — sheher-e-quwwat.',
            'Murree — pahaadon ki godi.',
            'Naran — jahan road khatam hoti hai.',
        ];
        return texts[chapter] || '';
    },

    showChapterIntro(chapter) {
        const chapterInfo = this.chapterData[chapter];
        if (!chapterInfo) return;
        this.currentChapter = chapter;
        this.levelIntroText = 'Chapter ' + (chapter + 1) + ': ' + chapterInfo.name;
        this.levelIntroSubtext = this.getChapterIntroText(chapter);
        this.state = 'chapterIntro';
        this.levelIntroTimer = 3;
        this.fadeAlpha = 1;
        this.fadeDirection = 1;
        this.hideAllScreens();
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
        const label = this.muted ? 'Sound: OFF' : 'Sound: ON';
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
        this.scrollSpeed = 100;
        this.targetScrollSpeed = 100;
        this.tollBarrierSpawned = false;
        this.bikeKeySpawned = false;
        this.chalaanCompleted = false;
        this.loadSheddingCompleted = false;
        this.nearMissCombo = 0;
        this.nearMissTimer = 0;
        this.nextLoadSheddingAt = 0;
        this.nextChalaanAt = 0;
        Player.resetForNewLevel();
        Obstacles.reset();
        this.currentChapter = Math.floor(this.currentLevel / 2);
        const levelInChapter = this.currentLevel % 2;
        Levels.loadLevel(this.currentChapter, levelInChapter);
        Camera.reset();
        Particles.reset();
        Modes.reset();
        HUD.init();
        this.hideAllScreens();
        HUD.show();
        this.showLevelIntro();
    },

    openGarageOrNext() {
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
        this.state = 'ending';
        this.scrollSpeed = 0;
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                Particles.burst(
                    Utils.random(100, 700), Utils.random(100, 350), 5,
                    ['#FFD700', '#FF6F00', '#4CAF50', '#E91E63', '#2196F3'][Utils.randomInt(0, 4)]
                );
            }, i * 50);
        }
    },

    startBonusStage() {
        this.state = 'bonusStage';
        this.hideAllScreens();
        Modes.startBonusStage();
    },

    getLevelName() {
        if (Levels.currentLevelData) {
            return Levels.currentLevelData.city + ' - ' + Levels.currentLevelData.name;
        }
        return 'Unknown';
    },

    hideAllScreens() {
        document.querySelectorAll('.screen-overlay').forEach(s => s.classList.remove('active'));
    },

    showScreen(id) {
        this.hideAllScreens();
        document.getElementById(id).classList.add('active');
    },

    setupMenuListeners() {
        document.getElementById('btnStart').onclick = () => { Audio.resume(); this.hideAllScreens(); this.state = 'homeScene'; Story.startHomeScene(() => { this.showChapterIntro(0); }); };
        document.getElementById('btnResume').onclick = () => this.resume();
        document.getElementById('btnRetry').onclick = () => { Audio.resume(); this.startGame(); };
        document.getElementById('btnMenu').onclick = () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            this.populateHighscore();
            HUD.hide();
        };
        document.getElementById('btnNextLevel').onclick = () => {
            if (this.state === 'chapterComplete') {
                // Go to next chapter
                this.showChapterIntro(this.currentChapter + 1);
            } else {
                this.startBonusStage();
            }
        };
        document.getElementById('btnGarageContinue').onclick = () => Modes.closeGarage();
        document.getElementById('btnPause').onclick = () => { if (this.state === 'playing') this.pause(); else if (this.state === 'paused') this.resume(); };
        document.getElementById('btnQuit').onclick = () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            this.populateHighscore();
            HUD.hide();
        };
        document.getElementById('btnMuteStart').onclick = () => this.toggleMute();
        document.getElementById('btnMutePause').onclick = () => this.toggleMute();
        document.getElementById('btnVictoryRetry').onclick = () => { Audio.resume(); this.startGame(); };
        document.getElementById('btnVictoryMenu').onclick = () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            this.populateHighscore();
            HUD.hide();
        };
        document.getElementById('btnEndingRetry').onclick = () => { Audio.resume(); this.startGame(); };
        document.getElementById('btnEndingMenu').onclick = () => {
            this.state = 'menu';
            this.hideAllScreens();
            this.showScreen('startScreen');
            this.populateHighscore();
            HUD.hide();
        };
        // Dialogue advancement on click/tap
        this.canvas.addEventListener('click', () => {
            if (this.state === 'dialogue') {
                Story.advanceDialogue();
            }
        });
        this.populateHighscore();
    },

    populateHighscore() {
        const hs = SaveData.getHighScore();
        const el = document.getElementById('highscoreDisplay');
        if (el) el.textContent = hs > 0 ? 'Best Score: Rs. ' + Utils.formatRupees(hs) : 'Best Score: --';
    },

    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(Utils.screenShake.offsetX, Utils.screenShake.offsetY);
        ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);
        if (this.state === 'homeScene') { Story.renderHomeScene(ctx); ctx.restore(); return; }

        if (this.state === 'menu') {
            Camera.render(ctx);
        } else if (this.state === 'chapterIntro') {
            Camera.render(ctx);
            Obstacles.render(ctx);
            Player.render(ctx);
            this.renderChapterIntro(ctx);
        } else if (this.state === 'levelIntro') {
            Camera.render(ctx);
            Obstacles.render(ctx);
            Player.render(ctx);
            this.renderLevelIntro(ctx);
        } else if (this.state === 'dialogue') {
            Camera.render(ctx);
            Obstacles.render(ctx);
            Player.render(ctx);
            Story.renderDialogue(ctx);
        } else if (this.state === 'ending') {
            Story.renderGameEnding(ctx);
            Particles.render(ctx);
        } else if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameOver' || this.state === 'levelComplete' || this.state === 'chapterComplete') {
            Camera.render(ctx);
            Obstacles.render(ctx);
            Levels.renderDecorations(ctx);
            Player.render(ctx);
            // Atmospheric depth gradient
            const topGrad = ctx.createLinearGradient(0, 0, 0, 120);
            topGrad.addColorStop(0, 'rgba(0,0,0,0.25)');
            topGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = topGrad;
            ctx.fillRect(0, 0, 800, 120);
            const bottomGrad = ctx.createLinearGradient(0, 380, 0, 450);
            bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
            bottomGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = bottomGrad;
            ctx.fillRect(0, 380, 800, 70);
            Particles.render(ctx);
            HUD.renderProgress(ctx);
            HUD.renderMessages(ctx);
            Modes.renderOverlay(ctx);
            HUD.renderSMS(ctx);
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

    renderLevelIntro(ctx) {
        if (this.fadeDirection > 0) {
            this.fadeAlpha = Math.min(0.85, this.fadeAlpha + 0.03);
        } else if (this.fadeDirection < 0) {
            this.fadeAlpha = Math.max(0, this.fadeAlpha - 0.02);
        }
        ctx.fillStyle = 'rgba(0, 0, 0, ' + this.fadeAlpha + ')';
        ctx.fillRect(0, 0, 800, 450);

        if (this.fadeAlpha > 0.3) {
            const alpha = Math.min(1, (this.fadeAlpha - 0.3) / 0.55);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.levelIntroText, 400, 190);

            ctx.fillStyle = '#fff';
            ctx.font = '14px monospace';
            ctx.fillText(this.levelIntroSubtext, 400, 230);

            ctx.fillStyle = '#888';
            ctx.font = '11px monospace';
            ctx.fillText('Level ' + (this.currentLevel + 1) + ' of ' + Levels.totalLevels, 400, 260);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }
    },

    renderChapterIntro(ctx) {
        if (this.fadeDirection > 0) {
            this.fadeAlpha = Math.min(0.9, this.fadeAlpha + 0.02);
        } else if (this.fadeDirection < 0) {
            this.fadeAlpha = Math.max(0, this.fadeAlpha - 0.02);
        }
        ctx.fillStyle = 'rgba(0, 0, 0, ' + this.fadeAlpha + ')';
        ctx.fillRect(0, 0, 800, 450);

        if (this.fadeAlpha > 0.3) {
            const alpha = Math.min(1, (this.fadeAlpha - 0.3) / 0.6);
            ctx.globalAlpha = alpha;

            const chapterInfo = this.chapterData[this.currentChapter];
            ctx.fillStyle = chapterInfo ? chapterInfo.color : '#FFD700';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Chapter ' + (this.currentChapter + 1), 400, 170);

            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 32px monospace';
            ctx.fillText(chapterInfo ? chapterInfo.name : '', 400, 210);

            ctx.fillStyle = '#fff';
            ctx.font = '13px monospace';
            ctx.fillText(this.levelIntroSubtext, 400, 260);

            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }
    },
};

window.addEventListener('load', () => { Game.init(); });
