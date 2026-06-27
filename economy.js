// ============================================================
// economy.js — Wallet tracking, toll guarantee, deficit detection
// ============================================================

const Economy = {
    // Per-level minimum cash guarantees
    guarantees: [
        { level: [0, 0], minCash: 200, message: 'Tutorial bonus' },
        { level: [0, 1], minCash: 800, message: 'Chapter 2 prep' },
        { level: [1, 0], minCash: 1200, triggerAt: 12000, message: 'Toll prep' },
        { level: [1, 1], minCash: 500, message: 'Toll safety net' },
        { level: [2, 0], minCash: 600, message: 'Garage funding' },
        { level: [2, 1], minCash: 300, message: 'Chapter 4 rent' },
        { level: [3, 0], minCash: 400, message: 'Bazaar spending' },
        { level: [3, 1], minCash: 600, message: 'Chapter 5 prep' },
        { level: [4, 0], minCash: 200, message: 'Final stretch' },
        { level: [4, 1], minCash: 200, message: 'Final reward' },
    ],

    sheedaTriggered: false,
    guaranteeSpawned: {},

    init() {
        this.sheedaTriggered = false;
        this.guaranteeSpawned = {};
    },

    // Called each frame during gameplay
    check(levelIndex) {
        const chapter = Levels.currentChapter;
        const level = Levels.currentLevelIndex;

        // Toll guarantee — Level 2.1 at 5,000m
        if (chapter === 1 && level === 0 && Game.distance >= 5000) {
            if (Player.wallet < 1200 && !this.guaranteeSpawned['toll_prep']) {
                this.guaranteeSpawned['toll_prep'] = true;
                this.spawnGuaranteeCash(300, 'Toll prep: Rs. 300');
            }
        }

        // Sheeda fallback — Level 2.2 at toll barrier
        if (chapter === 1 && level === 1 && Game.tollBarrierSpawned && !this.sheedaTriggered) {
            if (Player.wallet < 1000) {
                this.sheedaTriggered = true;
                this.triggerSheedaEvent();
            }
        }
    },

    // Spawn guaranteed cash (fills screen, can't be missed)
    spawnGuaranteeCash(amount, msg) {
        Player.wallet += amount;
        HUD.showMessage('+' + amount + ' ' + msg, '#4CAF50');
        Particles.burst(400, 200, 15, '#FFD700');
    },

    // Sheeda Ki Madad — friend throws money
    triggerSheedaEvent() {
        Player.wallet += 500;
        HUD.showMessage('Sheeda ne bachaa liya! +Rs.500', '#4FC3F7');
        HUD.showMessage('Toll ab sirf Rs.500 hai!', '#FFD700');

        // Reduce toll cost temporarily
        const tollObs = Obstacles.getActive().find(o => o.type === 'tollBarrier');
        if (tollObs) {
            tollObs.tollReduced = true;
        }
    },

    // Get the actual toll cost (reduced by Sheeda)
    getTollCost() {
        return 500; // Reduced from 1000 after Sheeda event
    },
};
