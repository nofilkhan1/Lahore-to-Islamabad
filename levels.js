// ============================================================
// levels.js — Level data, distance tracking, win conditions
// ============================================================

const Levels = {
    totalLevels: 6,
    currentLevelData: null,
    renderMilkShop: false,

    levels: [
        { name: "Mama's Doodh Run", city: 'Lahore', distance: 3000, startWallet: 500, footOnly: true, scrollSpeed: 200, obstacleDensity: 0.6, winCondition: 'reachDistanceAndWallet', minWallet: 500 },
        { name: 'Liberty Market Rush', city: 'Lahore', distance: 3000, startWallet: 0, footOnly: false, scrollSpeed: 220, obstacleDensity: 0.8, winCondition: 'reachDistance' },
        { name: 'Truck Art Gauntlet', city: 'GT Road', distance: 3000, startWallet: 0, footOnly: false, scrollSpeed: 300, obstacleDensity: 1.0, winCondition: 'reachDistance' },
        { name: 'Jhelum Toll Plaza', city: 'GT Road', distance: 3500, startWallet: 0, footOnly: false, scrollSpeed: 280, obstacleDensity: 0.9, winCondition: 'reachDistance', hasTollBarrier: true, tollDistance: 2800, tollCost: 1000 },
        { name: 'Signal Sprint', city: 'Islamabad', distance: 3000, startWallet: 0, footOnly: false, scrollSpeed: 250, obstacleDensity: 0.7, winCondition: 'reachDistance' },
        { name: 'Final Climb to Monal', city: 'Islamabad', distance: 4000, startWallet: 0, footOnly: false, scrollSpeed: 200, obstacleDensity: 0.8, winCondition: 'reachDistance', uphill: true, uphillForce: -50 },
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
        Obstacles.obstacleSpawnInterval = Math.max(40, 90 / this.currentLevelData.obstacleDensity);
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
            if (dist >= level.distance - 200) this.renderMilkShop = true;
        }
        if (complete) {
            if (Game.currentLevel < this.totalLevels - 1) {
                Game.startBonusStage();
            } else {
                Game.gameWon();
            }
        }
    },

    renderDecorations(ctx) {
        if (!this.currentLevelData) return;
        const city = this.currentLevelData.city;
        const dist = Game.distance;
        if (city === 'GT Road') {
            const milestone = Math.floor(dist / 1000);
            const milestoneX = 800 - ((dist % 1000) / 1000) * 800;
            if (milestoneX > 0 && milestoneX < 800) {
                // Try image first
                if (!AssetLoader.draw(ctx, 'milestone', milestoneX, 280, 40, 48)) {
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(milestoneX, 280, 40, 48);
                    ctx.fillStyle = '#fff';
                    ctx.font = '8px monospace';
                    ctx.fillText('ISB', milestoneX + 6, 300);
                    ctx.fillText(Math.max(0, 200 - milestone * 50) + 'km', milestoneX + 2, 312);
                }
            }
        }
        if (this.renderMilkShop && city === 'Lahore') {
            const shopX = 650, shopY = 300;
            // Try image first
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
    },
};
