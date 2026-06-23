// ============================================================
// levels.js — Level data, distance tracking, win conditions
// ============================================================

const Levels = {
    totalLevels: 6,
    currentLevelData: null,
    renderMilkShop: false,

    levels: [
        {
            name: "Mama's Doodh Run",
            city: 'Lahore',
            distance: 15000,
            startWallet: 500,
            footOnly: true,
            scrollSpeed: 100,
            obstacleDensity: 0.6,
            winCondition: 'reachDistanceAndWallet',
            minWallet: 500,
            dogChaseDuration: 3,
            dogAccelRate: 0.8,
        },
        {
            name: 'Liberty Market Rush',
            city: 'Lahore',
            distance: 16500,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 110,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            bikeKeyAt: 5000,
            isChaseModeActive: true,
            chalaanStart: 6000,
            chalaanInterval: 8000,
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
        },
        {
            name: 'Truck Art Gauntlet',
            city: 'GT Road',
            distance: 18000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 120,
            obstacleDensity: 1.0,
            winCondition: 'reachDistance',
            loadSheddingAt: 6000,
            loadSheddingInterval: 7000,
            dogChaseDuration: 5,
            dogAccelRate: 1.2,
        },
        {
            name: 'Jhelum Toll Plaza',
            city: 'GT Road',
            distance: 18000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 110,
            obstacleDensity: 0.9,
            winCondition: 'reachDistance',
            hasTollBarrier: true,
            tollDistance: 14000,
            tollCost: 1000,
            dogChaseDuration: 4,
            dogAccelRate: 1.0,
        },
        {
            name: 'Signal Sprint',
            city: 'Islamabad',
            distance: 18000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 110,
            obstacleDensity: 0.7,
            winCondition: 'reachDistance',
            dogChaseDuration: 5,
            dogAccelRate: 1.3,
        },
        {
            name: 'Final Climb to Monal',
            city: 'Islamabad',
            distance: 16200,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 90,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            uphill: true,
            uphillForce: -40,
            dogChaseDuration: 6,
            dogAccelRate: 1.5,
        },
    ],

    init() {},

    loadLevel(index) {
        if (index < 0 || index >= this.levels.length) return;
        this.currentLevelData = this.levels[index];
        Game.currentLevel = index;
        Game.targetScrollSpeed = this.currentLevelData.scrollSpeed;
        this.renderMilkShop = false;
        if (this.currentLevelData.startWallet > 0) Player.wallet = this.currentLevelData.startWallet;
        const levelNameEl = document.getElementById('levelName');
        if (levelNameEl) levelNameEl.textContent = this.currentLevelData.city + ' - ' + this.currentLevelData.name;
        Obstacles.obstacleSpawnInterval = Math.max(60, 120 / this.currentLevelData.obstacleDensity);
        Obstacles.coinSpawnInterval = Math.max(30, 60 / this.currentLevelData.obstacleDensity);
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
            if (Game.currentLevel < this.totalLevels - 1) {
                Game.levelComplete();
            } else {
                Game.gameWon();
            }
        }
    },

    renderDecorations(ctx) {
        if (!this.currentLevelData) return;
        const city = this.currentLevelData.city;
        const dist = Game.distance;
        const levelIdx = Game.currentLevel;

        // Monal Restaurant at end of final level
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
        if (this.renderMilkShop && city === 'Lahore') {
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
