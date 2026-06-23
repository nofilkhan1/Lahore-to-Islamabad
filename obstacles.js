// ============================================================
// obstacles.js — Object pool, hazard types, AABB collision
// ============================================================

const Obstacles = {
    // --- Object Pools ---
    obstacles: [],
    coins: [],

    POOL_OBSTACLES: 10,
    POOL_COINS: 20,

    // --- Spawn Timers ---
    obstacleSpawnTimer: 0,
    coinSpawnTimer: 0,
    obstacleSpawnInterval: 90, // frames between spawns (~1.5s at 60fps)
    coinSpawnInterval: 50,

    // --- Ground Level ---
    groundY: 370, // 450 - 64 player - 16 ground

    init() {
        this.groundY = 450 - 64 - 16;

        // Pre-allocate obstacle pool
        for (let i = 0; i < this.POOL_OBSTACLES; i++) {
            this.obstacles.push({
                active: false,
                type: '',
                x: 0, y: 0, w: 0, h: 0,
                velX: 0,
                speed: 0,
                triggered: false, // for dogs that activate on proximity
            });
        }

        // Pre-allocate coin pool
        for (let i = 0; i < this.POOL_COINS; i++) {
            this.coins.push({
                active: false,
                type: '',
                x: 0, y: 0, w: 0, h: 0,
                bobTimer: 0,
            });
        }
    },

    reset() {
        this.obstacles.forEach(o => o.active = false);
        this.coins.forEach(c => c.active = false);
        this.obstacleSpawnTimer = 0;
        this.coinSpawnTimer = 0;
    },

    update(dt) {
        const scrollSpeed = Game.scrollSpeed;

        // --- Spawn Obstacles ---
        this.obstacleSpawnTimer += dt;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }

        // --- Spawn Coins ---
        this.coinSpawnTimer += dt;
        if (this.coinSpawnTimer >= this.coinSpawnInterval) {
            this.coinSpawnTimer = 0;
            this.spawnCoin();
        }

        // --- Update Active Obstacles ---
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (!obs.active) continue;

            // Move with scroll
            obs.x -= (scrollSpeed + obs.speed) * (dt / 60);

            // Dog behavior: sprint when player is near
            if (obs.type === 'dog' && !obs.triggered) {
                if (Player.x > obs.x - 150) {
                    obs.triggered = true;
                    obs.speed = 300;
                    Audio.play('dogBark');
                }
            }

            // Recycle if off-screen left
            if (obs.x + obs.w < -50) {
                obs.active = false;
            }
        }

        // --- Update Active Coins ---
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            if (!coin.active) continue;

            // Move with scroll
            coin.x -= scrollSpeed * (dt / 60);

            // Bob up and down
            coin.bobTimer += dt / 60;
            coin.y += Math.sin(coin.bobTimer * 3) * 0.5;

            // Recycle if off-screen
            if (coin.x + coin.w < -20) {
                coin.active = false;
            }
        }
    },

    // --- Spawn Obstacle ---
    spawnObstacle() {
        const obs = this.getInactiveObstacle();
        if (!obs) return;

        const level = Game.currentLevel;
        const types = this.getObstacleTypesForLevel(level);
        const type = types[Utils.randomInt(0, types.length - 1)];

        obs.type = type;
        obs.triggered = false;

        switch (type) {
            case 'dog':
                obs.w = 40;
                obs.h = 28;
                obs.y = this.groundY + 36;
                obs.speed = 0; // starts idle
                break;

            case 'gutter':
                obs.w = 48;
                obs.h = 16;
                obs.y = this.groundY + 48;
                obs.speed = 0;
                break;

            case 'rickshaw':
                obs.w = 56;
                obs.h = 44;
                obs.y = this.groundY + 20;
                obs.speed = Utils.random(50, 150);
                break;

            case 'carelessBike':
                obs.w = 40;
                obs.h = 36;
                obs.y = this.groundY + 28;
                obs.speed = Utils.random(80, 200);
                break;

            case 'speedCamera':
                obs.w = 24;
                obs.h = 36;
                obs.y = this.groundY - 20;
                obs.speed = 0;
                break;

            case 'tollBarrier':
                obs.w = 200;
                obs.h = 40;
                obs.y = this.groundY + 24;
                obs.speed = 0;
                break;

            case 'overheadWires':
                obs.w = 200;
                obs.h = 8;
                obs.y = this.groundY - 30;
                obs.speed = 0;
                break;
        }

        obs.x = 850; // spawn just off-screen right
        obs.active = true;
    },

    getObstacleTypesForLevel(level) {
        switch (level) {
            case 0: // Level 1.1 — Dogs, gutters only
                return ['dog', 'gutter', 'dog', 'gutter'];
            case 1: // Level 1.2 — Add rickshaws, bikes
                return ['dog', 'gutter', 'rickshaw', 'carelessBike'];
            case 2: // Level 2.1 — All types + cameras
                return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'speedCamera'];
            case 3: // Level 2.2 — Toll barrier + all
                return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'tollBarrier'];
            case 4: // Level 3.1 — Cameras + all
                return ['rickshaw', 'carelessBike', 'speedCamera', 'gutter'];
            case 5: // Level 3.2 — Final climb
                return ['dog', 'gutter', 'rickshaw', 'overheadWires'];
            default:
                return ['dog', 'gutter'];
        }
    },

    // --- Spawn Coin ---
    spawnCoin() {
        const coin = this.getInactiveCoin();
        if (!coin) return;

        const level = Game.currentLevel;
        const types = this.getCoinTypesForLevel(level);
        const type = types[Utils.randomInt(0, types.length - 1)];

        coin.type = type;

        switch (type) {
            case 'cash10':
                coin.w = 12;
                coin.h = 16;
                break;
            case 'cash50':
                coin.w = 12;
                coin.h = 16;
                break;
            case 'cash100':
                coin.w = 12;
                coin.h = 16;
                break;
            case 'bikeKey':
                coin.w = 16;
                coin.h = 16;
                break;
            case 'petrol':
                coin.w = 16;
                coin.h = 24;
                break;
            case 'chai':
                coin.w = 16;
                coin.h = 16;
                break;
            case 'parchi':
                coin.w = 12;
                coin.h = 16;
                break;
        }

        coin.x = 850;
        coin.y = this.groundY + Utils.random(-30, 30);
        coin.bobTimer = 0;
        coin.active = true;
    },

    getCoinTypesForLevel(level) {
        switch (level) {
            case 0: // Level 1.1 — Cash + key
                return ['cash10', 'cash50', 'cash10'];
            case 1: // Level 1.2 — Cash + key + chai
                return ['cash10', 'cash50', 'cash100', 'bikeKey', 'chai'];
            case 2: // Level 2.1 — Cash + petrol + chai
                return ['cash10', 'cash50', 'cash100', 'petrol', 'chai'];
            case 3: // Level 2.2 — Cash + petrol
                return ['cash10', 'cash50', 'cash100', 'petrol'];
            case 4: // Level 3.1 — Cash + chai + parchi
                return ['cash50', 'cash100', 'chai', 'parchi'];
            case 5: // Level 3.2 — Cash + petrol
                return ['cash50', 'cash100', 'petrol'];
            default:
                return ['cash10'];
        }
    },

    // --- Pool Helpers ---
    getInactiveObstacle() {
        for (let i = 0; i < this.obstacles.length; i++) {
            if (!this.obstacles[i].active) return this.obstacles[i];
        }
        return null;
    },

    getInactiveCoin() {
        for (let i = 0; i < this.coins.length; i++) {
            if (!this.coins[i].active) return this.coins[i];
        }
        return null;
    },

    getActive() {
        return this.obstacles;
    },

    getActiveCoins() {
        return this.coins;
    },

    recycle(obs) {
        obs.active = false;
    },

    recycleCoin(coin) {
        coin.active = false;
    },

    // --- Render ---
    render(ctx) {
        // Draw obstacles
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (!obs.active) continue;
            this.renderObstacle(ctx, obs);
        }

        // Draw coins
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            if (!coin.active) continue;
            this.renderCoin(ctx, coin);
        }
    },

    renderObstacle(ctx, obs) {
        const x = Math.round(obs.x);
        const y = Math.round(obs.y);

        switch (obs.type) {
            case 'dog':
                // Body
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x + 4, y + 4, 28, 16);
                // Head
                ctx.fillStyle = '#7A5C12';
                ctx.fillRect(x + 28, y, 12, 12);
                // Eyes
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 34, y + 3, 3, 3);
                // Legs
                ctx.fillStyle = '#5C4033';
                ctx.fillRect(x + 6, y + 20, 4, 8);
                ctx.fillRect(x + 14, y + 20, 4, 8);
                ctx.fillRect(x + 22, y + 20, 4, 8);
                ctx.fillRect(x + 30, y + 20, 4, 8);
                // Tail
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x, y + 2, 6, 4);
                break;

            case 'gutter':
                // Dark pit
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x, y, 48, 16);
                // Broken edges
                ctx.fillStyle = '#666666';
                ctx.fillRect(x, y, 48, 3);
                ctx.fillRect(x, y + 13, 48, 3);
                // Slime
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x + 8, y + 6, 8, 4);
                ctx.fillRect(x + 28, y + 8, 10, 3);
                break;

            case 'rickshaw':
                // Body
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 10, y + 10, 36, 24);
                // Roof
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 8, y, 40, 12);
                // Wheels
                ctx.fillStyle = '#333333';
                ctx.fillRect(x + 4, y + 32, 10, 10);
                ctx.fillRect(x + 42, y + 32, 10, 10);
                // Driver silhouette
                ctx.fillStyle = '#2C1810';
                ctx.fillRect(x + 32, y + 12, 8, 14);
                break;

            case 'carelessBike':
                // Frame
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(x + 8, y + 12, 24, 4);
                // Body
                ctx.fillStyle = '#AA0000';
                ctx.fillRect(x + 12, y + 6, 16, 10);
                // Wheels
                ctx.fillStyle = '#222222';
                ctx.fillRect(x + 2, y + 24, 10, 10);
                ctx.fillRect(x + 28, y + 24, 10, 10);
                // Rider (no helmet)
                ctx.fillStyle = '#E8B89D';
                ctx.fillRect(x + 14, y - 4, 10, 10);
                ctx.fillStyle = '#2C1810';
                ctx.fillRect(x + 12, y - 6, 14, 5);
                break;

            case 'speedCamera':
                // Pole
                ctx.fillStyle = '#888888';
                ctx.fillRect(x + 10, y, 4, 36);
                // Camera box
                ctx.fillStyle = '#F0F0F0';
                ctx.fillRect(x, y, 24, 16);
                // Lens
                ctx.fillStyle = '#333333';
                ctx.fillRect(x + 8, y + 4, 8, 8);
                // Flash indicator
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 18, y + 2, 4, 4);
                break;

            case 'tollBarrier':
                // Boom barrier
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(x, y, 200, 8);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x, y + 8, 200, 8);
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(x, y + 16, 200, 8);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x, y + 24, 200, 8);
                // Support pole
                ctx.fillStyle = '#666666';
                ctx.fillRect(x + 90, y + 32, 20, 16);
                break;

            case 'overheadWires':
                // Cable bundle
                ctx.fillStyle = '#333333';
                ctx.fillRect(x, y, 200, 3);
                ctx.fillStyle = '#444444';
                ctx.fillRect(x, y + 3, 200, 3);
                ctx.fillStyle = '#222222';
                ctx.fillRect(x, y + 6, 200, 2);
                break;
        }
    },

    renderCoin(ctx, coin) {
        const x = Math.round(coin.x);
        const y = Math.round(coin.y);

        // Sparkle effect (bob animation handled in update)
        switch (coin.type) {
            case 'cash10':
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 2, y + 5, 8, 2);
                ctx.fillRect(x + 4, y + 3, 2, 6);
                break;

            case 'cash50':
                ctx.fillStyle = '#388E3C';
                ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 1, y + 5, 10, 2);
                ctx.fillRect(x + 3, y + 3, 4, 6);
                break;

            case 'cash100':
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2, y + 5, 8, 2);
                ctx.fillRect(x + 4, y + 3, 2, 6);
                break;

            case 'bikeKey':
                // Key shape
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 4, y, 8, 4); // bow
                ctx.fillRect(x + 6, y + 4, 4, 10); // shaft
                ctx.fillRect(x + 4, y + 12, 8, 2); // bit
                // Sparkle
                ctx.fillStyle = '#FFFF88';
                ctx.fillRect(x + 2, y - 2, 2, 2);
                ctx.fillRect(x + 12, y + 2, 2, 2);
                break;

            case 'petrol':
                // Bottle
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x + 4, y, 8, 4); // cap
                ctx.fillRect(x + 2, y + 4, 12, 18); // body
                // Label
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 3, y + 8, 10, 6);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 5, y + 10, 6, 2);
                break;

            case 'chai':
                // Cup
                ctx.fillStyle = '#D32F2F';
                ctx.fillRect(x + 2, y + 4, 12, 10); // cup body
                ctx.fillRect(x + 12, y + 6, 4, 4); // handle
                // Steam
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fillRect(x + 4, y, 2, 4);
                ctx.fillRect(x + 8, y + 1, 2, 3);
                break;

            case 'parchi':
                // Paper slip
                ctx.fillStyle = '#FFF8DC';
                ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 2, y + 4, 8, 1);
                ctx.fillRect(x + 2, y + 7, 8, 1);
                ctx.fillRect(x + 2, y + 10, 6, 1);
                break;
        }
    },
};
