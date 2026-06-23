// ============================================================
// levels.js — Level data, distance tracking, win conditions
// ============================================================

const Levels = {
    totalLevels: 6,
    currentLevelData: null,

    levels: [
        // Level 0: 1.1 — Mama's Doodh Run
        {
            name: "Mama's Doodh Run",
            city: 'Lahore',
            distance: 3000,
            startWallet: 500,
            footOnly: true,
            scrollSpeed: 200,
            obstacleDensity: 0.6,
            winCondition: 'reachDistanceAndWallet',
            minWallet: 500,
            hasBikeKey: false,
        },
        // Level 1: 1.2 — Liberty Market Rush
        {
            name: 'Liberty Market Rush',
            city: 'Lahore',
            distance: 3000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 220,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            hasBikeKey: true,
            bikeKeyDistance: 1500,
        },
        // Level 2: 2.1 — Truck Art Gauntlet
        {
            name: 'Truck Art Gauntlet',
            city: 'GT Road',
            distance: 3000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 300,
            obstacleDensity: 1.0,
            winCondition: 'reachDistance',
            hasBikeKey: false,
        },
        // Level 3: 2.2 — Jhelum Toll Plaza
        {
            name: 'Jhelum Toll Plaza',
            city: 'GT Road',
            distance: 3500,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 280,
            obstacleDensity: 0.9,
            winCondition: 'reachDistance',
            hasBikeKey: false,
            hasTollBarrier: true,
            tollDistance: 2800,
            tollCost: 1000,
        },
        // Level 4: 3.1 — Safe City Signal Sprint
        {
            name: 'Signal Sprint',
            city: 'Islamabad',
            distance: 3000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 250,
            obstacleDensity: 0.7,
            winCondition: 'reachDistance',
            hasBikeKey: false,
        },
        // Level 5: 3.2 — Final Climb to Monal
        {
            name: 'Final Climb to Monal',
            city: 'Islamabad',
            distance: 4000,
            startWallet: 0,
            footOnly: false,
            scrollSpeed: 200,
            obstacleDensity: 0.8,
            winCondition: 'reachDistance',
            hasBikeKey: false,
            uphill: true,
            uphillForce: -50,
        },
    ],

    init() {},

    loadLevel(index) {
        if (index < 0 || index >= this.levels.length) return;

        this.currentLevelData = this.levels[index];
        Game.currentLevel = index;
        Game.currentSubLevel = (index < 2 ? '1.' : index < 4 ? '2.' : '3.') + ((index % 2) + 1);
        Game.targetScrollSpeed = this.currentLevelData.scrollSpeed;

        // Set starting wallet
        if (this.currentLevelData.startWallet > 0) {
            Player.wallet = this.currentLevelData.startWallet;
        }

        // Update level name display
        const levelNameEl = document.getElementById('levelName');
        levelNameEl.textContent = this.currentLevelData.city + ' — ' + this.currentLevelData.name;

        // Adjust spawn rates based on density
        Obstacles.obstacleSpawnInterval = Math.max(40, 90 / this.currentLevelData.obstacleDensity);
    },

    checkCompletion() {
        if (!this.currentLevelData) return;

        const dist = Game.distance;
        const level = this.currentLevelData;

        let complete = false;

        switch (level.winCondition) {
            case 'reachDistance':
                complete = dist >= level.distance;
                break;

            case 'reachDistanceAndWallet':
                complete = dist >= level.distance && Player.wallet >= level.minWallet;
                // Show milk shop at end
                if (dist >= level.distance - 200) {
                    this.renderMilkShop = true;
                }
                break;
        }

        if (complete) {
            // Check if bonus stage should trigger
            if (Game.currentLevel < this.totalLevels - 1) {
                Game.startBonusStage();
            } else {
                Game.gameWon();
            }
        }
    },

    // Render level-specific decorations
    renderDecorations(ctx) {
        if (!this.currentLevelData) return;

        const city = this.currentLevelData.city;
        const dist = Game.distance;

        // Milestone signs
        if (city === 'GT Road') {
            // Highway milestone every 1000 units
            const milestone = Math.floor(dist / 1000);
            const milestoneX = 800 - ((dist % 1000) / 1000) * 800;
            if (milestoneX > 0 && milestoneX < 800) {
                ctx.fillStyle = '#228B22';
                ctx.fillRect(milestoneX, 280, 40, 48);
                ctx.fillStyle = '#fff';
                ctx.font = '8px monospace';
                ctx.fillText('ISB', milestoneX + 6, 300);
                ctx.fillText((200 - milestone * 50) + 'km', milestoneX + 2, 312);
            }
        }

        // Milk shop at end of Level 1.1
        if (this.renderMilkShop && city === 'Lahore') {
            const shopX = 650;
            const shopY = 300;
            // Shop structure
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(shopX, shopY, 64, 56);
            ctx.fillStyle = '#C4956A';
            ctx.fillRect(shopX + 4, shopY + 4, 56, 48);
            // Sign
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(shopX + 8, shopY + 8, 48, 14);
            ctx.fillStyle = '#333';
            ctx.font = '7px monospace';
            ctx.fillText('DOODH WALA', shopX + 10, shopY + 18);
            // Clay pots
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(shopX + 12, shopY + 30, 10, 16);
            ctx.fillRect(shopX + 26, shopY + 32, 8, 14);
            ctx.fillRect(shopX + 38, shopY + 28, 12, 18);
        }
    },
};
