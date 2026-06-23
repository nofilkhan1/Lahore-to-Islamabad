// ============================================================
// utils.js — Helper functions for Lahore to Islamabad
// ============================================================

const Utils = {
    init() {},

    // --- AABB Collision Detection ---
    checkAABB(a, b) {
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    },

    // --- Math Helpers ---
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // --- Format Currency ---
    formatRupees(amount) {
        return Math.floor(amount).toLocaleString('en-PK');
    },

    // --- Spend from wallet (enforce floor at 0) ---
    spendWallet(amount) {
        if (Player.wallet >= amount) {
            Player.wallet -= amount;
            return true;
        }
        return false;
    },

    // --- Pakistani Color Palette (16-bit style) ---
    COLORS: {
        // Player
        SKIN: '#E8B89D',
        HAIR: '#2C1810',
        SHALWAR_KAMEEZ: '#F5F5DC',
        SANDAL: '#8B4513',

        // Bike
        BIKE_FRAME: '#333333',
        BIKE_WHEEL: '#222222',
        BIKE_CHROME: '#C0C0C0',
        BIKE_SEAT: '#5C3317',

        // Environment — Lahore
        LAHORE_SKY: '#FF8C42',
        LAHORE_BUILDING: '#C4956A',
        LAHORE_SHOP: '#8B6914',
        LAHORE_WIRE: '#333333',

        // Environment — GT Road
        GT_SKY: '#87CEEB',
        GT_FIELD: '#4CAF50',
        GT_ROAD: '#555555',
        GT_SAND: '#D2B48C',

        // Environment — Islamabad
        ISB_SKY: '#5B86E5',
        ISB_GREEN: '#2E8B57',
        ISB_BUILDING: '#708090',
        ISB_HILL: '#2F4F4F',

        // Ground
        GROUND: '#8B7355',
        PAVEMENT: '#A0A0A0',

        // UI
        HEART_RED: '#FF0000',
        HEART_EMPTY: '#333333',
        GOLD: '#FFD700',
        FUEL_GREEN: '#4CAF50',
        FUEL_YELLOW: '#FFC107',
        FUEL_RED: '#F44336',

        // Obstacles
        DOG_BROWN: '#8B6914',
        DOG_DARK: '#5C4033',
        GUTTER_DARK: '#1A1A1A',
        RICKSHAW_GREEN: '#228B22',
        RICKSHAW_YELLOW: '#FFD700',
        CAMERA_WHITE: '#F0F0F0',
        BARRIER_RED: '#CC0000',
        BARRIER_YELLOW: '#FFD700',

        // Particles
        SPARK: '#FFFF00',
        DUST: '#C4A882',
        RAIN: '#87CEEB',
    },

    // --- Canvas Scaling ---
    getCanvasScale(canvas) {
        return canvas.width / canvas.clientWidth;
    },

    // --- Screen Shake Data ---
    screenShake: {
        active: false,
        intensity: 0,
        duration: 0,
        elapsed: 0,
        offsetX: 0,
        offsetY: 0,
    },

    triggerScreenShake(intensity, duration) {
        this.screenShake.active = true;
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.elapsed = 0;
    },

    updateScreenShake(dt) {
        if (!this.screenShake.active) {
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
            return;
        }
        this.screenShake.elapsed += dt / 60;
        if (this.screenShake.elapsed >= this.screenShake.duration) {
            this.screenShake.active = false;
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
            return;
        }
        const decay = 1 - (this.screenShake.elapsed / this.screenShake.duration);
        const currentIntensity = this.screenShake.intensity * decay;
        this.screenShake.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        this.screenShake.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    },
};

// ============================================================
// SaveData — localStorage persistence
// ============================================================
const SaveData = {
    KEY: 'lahore_to_islamabad_save',
    LEADERBOARD_KEY: 'lahore_to_islamabad_scores',

    save(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (e) { /* storage full or private mode */ }
    },

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    },

    clear() {
        localStorage.removeItem(this.KEY);
    },

    // Save game state on level complete or game over
    saveGameState() {
        this.save({
            currentLevel: Game.currentLevel,
            wallet: Player.wallet,
            upgrades: Player.upgrades || {},
            highScore: this.getHighScore(),
            totalDistance: (this.load()?.totalDistance || 0) + Game.distance,
        });
    },

    // Load saved progress (for continue button)
    loadGameState() {
        return this.load();
    },

    // High score / leaderboard
    getHighScore() {
        const data = this.load();
        return data?.highScore || 0;
    },

    addScore(score, distance, wallet) {
        let scores = this.getScores();
        scores.push({
            score,
            distance: Math.floor(distance),
            wallet,
            date: new Date().toISOString().split('T')[0],
            level: Game.currentLevel,
        });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10); // Keep top 10
        try {
            localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(scores));
        } catch (e) { /* storage full */ }
        return scores;
    },

    getScores() {
        try {
            const raw = localStorage.getItem(this.LEADERBOARD_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    },
};
