// ============================================================
// levels.js — 10 levels across 5 chapters
// ============================================================

const Levels = {
    totalLevels: 10,
    currentLevelData: null,
    currentChapter: 0,
    currentLevelIndex: 0,
    renderMilkShop: false,

    chapters: [
        { name: 'Lahore', color: '#FF8F00' },
        { name: 'GT Road', color: '#F57F17' },
        { name: 'Islamabad', color: '#2E7D32' },
        { name: 'Murree', color: '#1565C0' },
        { name: 'Naran Valley', color: '#4A148C' },
    ],

    levels: [
        // === CHAPTER 1: LAHORE ===
        {
            name: "Mama's Doodh Run",
            chapter: 0,
            levelInChapter: 0,
            city: 'Lahore',
            distance: 15000,
            startWallet: 500,
            footOnly: true,
            scrollSpeed: 80,
            obstacleDensity: 0.4,
            winCondition: 'reachDistanceAndWallet',
            minWallet: 500,
            dogChaseDuration: 3,
            dogAccelRate: 0.6,
            hazards: ['dog_idle', 'gutter', 'neighborKid'],
            collectibles: ['cash10', 'cash20', 'guava'],
        },
        {
            name: 'Liberty Market Rush',
            chapter: 0,
            levelInChapter: 1,
            city: 'Lahore',
            distance: 16500,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 100,
            obstacleDensity: 0.7,
            winCondition: 'reachDistanceAndWallet',
            minWallet: 800,
            bikeKeyAt: 5000,
            isChaseModeActive: true,
            chalaanStart: 6000,
            chalaanInterval: 8000,
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
            hazards: ['dog', 'gutter', 'rickshaw', 'carelessBike', 'constructionCone'],
            collectibles: ['cash10', 'cash50', 'cash100', 'chai', 'parchi', 'delivery'],
        },

        // === CHAPTER 2: GT ROAD ===
        {
            name: 'Truck Art Gauntlet',
            chapter: 1,
            levelInChapter: 0,
            city: 'GT Road',
            distance: 18000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 120,
            obstacleDensity: 0.9,
            winCondition: 'reachDistance',
            loadSheddingAt: 6000,
            loadSheddingInterval: 7000,
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
            hazards: ['dog', 'gutter', 'rickshaw', 'carelessBike', 'speedCamera', 'constructionCone', 'truck'],
            collectibles: ['cash10', 'cash50', 'cash100', 'petrol', 'chai'],
        },
        {
            name: 'Jhelum Toll Plaza',
            chapter: 1,
            levelInChapter: 1,
            city: 'GT Road',
            distance: 18000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 110,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            hasTollBarrier: true,
            tollDistance: 14000,
            tollCost: 1000,
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
            hazards: ['dog', 'gutter', 'rickshaw', 'carelessBike', 'speedCamera', 'constructionCone'],
            collectibles: ['cash50', 'cash100', 'petrol', 'chai'],
        },

        // === CHAPTER 3: ISLAMABAD ===
        {
            name: 'Safe City Signal Sprint',
            chapter: 2,
            levelInChapter: 0,
            city: 'Islamabad',
            distance: 18000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 110,
            obstacleDensity: 0.7,
            winCondition: 'reachDistance',
            dogChaseDuration: 5,
            dogAccelRate: 1.2,
            hazards: ['dog', 'gutter', 'speedCamera', 'trafficSignal'],
            collectibles: ['cash50', 'cash100', 'chai', 'parchi'],
        },
        {
            name: 'Final Climb to Monal',
            chapter: 2,
            levelInChapter: 1,
            city: 'Islamabad',
            distance: 16200,
            startWallet: 0,
            footOnly: true,
            scrollSpeed: 80,
            obstacleDensity: 0.7,
            winCondition: 'reachDistance',
            uphill: true,
            uphillForce: -40,
            forcedDismountAt: 500,
            dogChaseDuration: 5,
            dogAccelRate: 1.2,
            hazards: ['dog', 'gutter', 'fallingRock', 'mountainGoat'],
            collectibles: ['cash50', 'cash100'],
        },

        // === CHAPTER 4: MURREE ===
        {
            name: 'Margalla Pass Night Ride',
            chapter: 3,
            levelInChapter: 0,
            city: 'Murree',
            distance: 20000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 90,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            loadSheddingAlways: true,
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
            hazards: ['dog', 'fallingRock', 'mountainGoat', 'snowPatch'],
            collectibles: ['cash50', 'hotChai', 'shawl'],
        },
        {
            name: 'Murree Bazaar Rush',
            chapter: 3,
            levelInChapter: 1,
            city: 'Murree',
            distance: 15000,
            startWallet: 0,
            footOnly: true,
            scrollSpeed: 100,
            obstacleDensity: 0.7,
            winCondition: 'reachDistance',
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
            hazards: ['dog', 'gutter', 'selfieStick', 'icePatch', 'monkey'],
            collectibles: ['cash50', 'cash100', 'bhutta'],
        },

        // === CHAPTER 5: NARAN VALLEY ===
        {
            name: 'Kaghan Valley River Road',
            chapter: 4,
            levelInChapter: 0,
            city: 'Naran',
            distance: 22000,
            startWallet: 0,
            footOnly: true,
            scrollSpeed: 75,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            monsoonFlood: true,
            dogChaseDuration: 6,
            dogAccelRate: 1.5,
            hazards: ['dog', 'fallingRock', 'flashFlood', 'rollingRock', 'narrowBridge', 'jeep'],
            collectibles: ['cash50', 'cash100', 'jeepToken'],
        },
        {
            name: 'Saif-ul-Malook Final Ascent',
            chapter: 4,
            levelInChapter: 1,
            city: 'Naran',
            distance: 18000,
            startWallet: 0,
            footOnly: true,
            scrollSpeed: 60,
            obstacleDensity: 0.7,
            winCondition: 'reachDistance',
            uphill: true,
            uphillForce: -60,
            dogChaseDuration: 6,
            dogAccelRate: 1.5,
            hazards: ['dog', 'fallingRock', 'flashFlood', 'lightningZone'],
            collectibles: ['cash50', 'cash100'],
        },
    ],

    init() {},

    loadLevel(chapter, levelIndex) {
        const levelNum = this.getLevelNumber(chapter, levelIndex);
        if (levelNum < 0 || levelNum >= this.levels.length) return;
        this.currentLevelData = this.levels[levelNum];
        this.currentChapter = chapter;
        this.currentLevelIndex = levelIndex;
        Game.currentLevel = levelNum;
        Game.targetScrollSpeed = this.currentLevelData.scrollSpeed;
        this.renderMilkShop = false;
        if (this.currentLevelData.startWallet > 0) Player.wallet = this.currentLevelData.startWallet;
        const levelNameEl = document.getElementById('levelName');
        if (levelNameEl) levelNameEl.textContent = this.currentLevelData.city + ' - ' + this.currentLevelData.name;
        Obstacles.obstacleSpawnInterval = Math.max(60, 120 / this.currentLevelData.obstacleDensity);
        Obstacles.coinSpawnInterval = Math.max(30, 60 / this.currentLevelData.obstacleDensity);
    },

    getLevelNumber(chapter, levelIndex) {
        let count = 0;
        for (let i = 0; i < this.levels.length; i++) {
            if (this.levels[i].chapter === chapter && this.levels[i].levelInChapter === levelIndex) {
                return i;
            }
        }
        return -1;
    },

    getLevelNumberByIndex(globalIndex) {
        return globalIndex;
    },

    checkCompletion() {
        if (!this.currentLevelData || Game.state !== 'playing') return;
        const dist = Game.distance;
        const level = this.currentLevelData;
        let complete = false;
        if (level.winCondition === 'reachDistance') {
            complete = dist >= level.distance;
        } else if (level.winCondition === 'reachDistanceAndWallet') {
            complete = dist >= level.distance && Player.wallet >= level.minWallet;
            if (dist >= level.distance - 500) this.renderMilkShop = true;
        }
        if (complete) {
            Story.startLevelEndBeat(Game.currentLevel);
        }
    },

    renderDecorations(ctx) {
        if (!this.currentLevelData) return;
        const city = this.currentLevelData.city;
        const dist = Game.distance;
        const levelIdx = Game.currentLevel;

        // Monal Restaurant at end of Level 3.2
        if (levelIdx === 5 && dist >= 14000) {
            const monalX = 650;
            const monalY = 280;
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(monalX, monalY, 80, 50);
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(monalX + 4, monalY + 4, 72, 42);
            ctx.fillStyle = '#CC0000';
            ctx.fillRect(monalX - 5, monalY - 8, 90, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(monalX + 10, monalY + 6, 60, 12);
            ctx.fillStyle = '#333';
            ctx.font = '8px monospace';
            ctx.fillText('THE MONAL', monalX + 14, monalY + 15);
            ctx.fillStyle = '#006400';
            ctx.fillRect(monalX + 70, monalY - 20, 3, 14);
            ctx.fillStyle = '#fff';
            ctx.fillRect(monalX + 73, monalY - 18, 8, 5);
            ctx.fillStyle = '#006400';
            ctx.fillRect(monalX + 73, monalY - 13, 8, 5);
        }

        // Lake at end of Level 5.2
        if (levelIdx === 9 && dist >= 16000) {
            ctx.fillStyle = '#1565C0';
            ctx.fillRect(0, 320, 800, 130);
            ctx.fillStyle = 'rgba(25, 118, 210, 0.3)';
            for (let i = 0; i < 5; i++) {
                const waveX = (Date.now() * 0.02 + i * 160) % 900 - 50;
                ctx.fillRect(waveX, 330 + i * 8, 120, 3);
            }
        }

        // Murree snow patches
        if (city === 'Murree' && dist > 3000) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            for (let i = 0; i < 8; i++) {
                const sx = (i * 200 + 50) % 800;
                ctx.fillRect(sx, 380, 40 + (i % 3) * 20, 6);
            }
        }

        // Naran river
        if (city === 'Naran') {
            ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
            ctx.fillRect(0, 400, 800, 50);
            for (let i = 0; i < 3; i++) {
                const wx = (Date.now() * 0.03 + i * 250) % 850 - 25;
                ctx.fillStyle = 'rgba(100, 181, 246, 0.4)';
                ctx.fillRect(wx, 410 + i * 10, 60, 3);
            }
        }

        // GT Road milestones
        if (city === 'GT Road') {
            const milestone = Math.floor(dist / 5000);
            const milestoneX = 800 - ((dist % 5000) / 5000) * 800;
            if (milestoneX > 0 && milestoneX < 800) {
                if (!AssetLoader.draw(ctx, 'milestone', milestoneX, 280, 40, 48)) {
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(milestoneX, 280, 40, 48);
                    ctx.fillStyle = '#fff';
                    ctx.font = '8px monospace';
                    ctx.fillText('ISB', milestoneX + 6, 300);
                    ctx.fillText(Math.max(0, 200 - milestone * 25) + 'km', milestoneX + 2, 312);
                }
            }
        }

        // Milk shop at end of Level 1.1
        if (levelIdx === 0 && this.renderMilkShop) {
            const shopX = 650, shopY = 300;
            if (!AssetLoader.draw(ctx, 'milk_shop', shopX, shopY, 64, 56)) {
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(shopX, shopY, 64, 56);
                ctx.fillStyle = '#C4956A';
                ctx.fillRect(shopX + 4, shopY + 4, 56, 48);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(shopX + 8, shopY + 8, 48, 14);
                ctx.fillStyle = '#333';
                ctx.font = '7px monospace';
                ctx.fillText('DOODH WALA', shopX + 10, shopY + 18);
                ctx.fillStyle = '#CD853F';
                ctx.fillRect(shopX + 12, shopY + 30, 10, 16);
                ctx.fillRect(shopX + 26, shopY + 32, 8, 14);
            }
        }
    },
};
