// ============================================================
// obstacles.js — Object pool, hazard types, AABB collision
// ============================================================

const Obstacles = {
    obstacles: [],
    coins: [],
    POOL_OBSTACLES: 10,
    POOL_COINS: 20,
    obstacleSpawnTimer: 0,
    coinSpawnTimer: 0,
    obstacleSpawnInterval: 90,
    coinSpawnInterval: 50,
    groundY: 370,

    init() {
        this.groundY = 450 - 64 - 16;
        for (let i = 0; i < this.POOL_OBSTACLES; i++) {
            this.obstacles.push({ active: false, type: '', x: 0, y: 0, w: 0, h: 0, speed: 0, triggered: false });
        }
        for (let i = 0; i < this.POOL_COINS; i++) {
            this.coins.push({ active: false, type: '', x: 0, y: 0, w: 0, h: 0, bobTimer: 0 });
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
        this.obstacleSpawnTimer += dt;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }
        this.coinSpawnTimer += dt;
        if (this.coinSpawnTimer >= this.coinSpawnInterval) {
            this.coinSpawnTimer = 0;
            this.spawnCoin();
        }
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            if (!obs.active) continue;
            obs.x -= (scrollSpeed + obs.speed) * (dt / 60);
            if (obs.type === 'dog' && !obs.triggered && Player.x > obs.x - 150) {
                obs.triggered = true;
                obs.speed = 300;
                Audio.play('dogBark');
            }
            if (obs.x + obs.w < -50) obs.active = false;
        }
        for (let i = 0; i < this.coins.length; i++) {
            const coin = this.coins[i];
            if (!coin.active) continue;
            coin.x -= scrollSpeed * (dt / 60);
            coin.bobTimer += dt / 60;
            if (coin.x + coin.w < -20) coin.active = false;
        }
    },

    spawnObstacle() {
        const obs = this.getInactiveObstacle();
        if (!obs) return;
        const level = Game.currentLevel;
        const types = this.getObstacleTypesForLevel(level);
        const type = types[Utils.randomInt(0, types.length - 1)];
        obs.type = type;
        obs.triggered = false;
        switch (type) {
            case 'dog': obs.w = 40; obs.h = 28; obs.y = this.groundY + 36; obs.speed = 0; break;
            case 'gutter': obs.w = 48; obs.h = 16; obs.y = this.groundY + 48; obs.speed = 0; break;
            case 'rickshaw': obs.w = 56; obs.h = 44; obs.y = this.groundY + 20; obs.speed = Utils.random(50, 150); break;
            case 'carelessBike': obs.w = 40; obs.h = 36; obs.y = this.groundY + 28; obs.speed = Utils.random(80, 200); break;
            case 'speedCamera': obs.w = 24; obs.h = 36; obs.y = this.groundY - 20; obs.speed = 0; break;
            case 'tollBarrier': obs.w = 200; obs.h = 40; obs.y = this.groundY + 24; obs.speed = 0; break;
            case 'overheadWires': obs.w = 200; obs.h = 8; obs.y = this.groundY - 30; obs.speed = 0; break;
        }
        obs.x = 850;
        obs.active = true;
    },

    getObstacleTypesForLevel(level) {
        switch (level) {
            case 0: return ['dog', 'gutter', 'dog', 'gutter'];
            case 1: return ['dog', 'gutter', 'rickshaw', 'carelessBike'];
            case 2: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'speedCamera'];
            case 3: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'tollBarrier'];
            case 4: return ['rickshaw', 'carelessBike', 'speedCamera', 'gutter'];
            case 5: return ['dog', 'gutter', 'rickshaw', 'overheadWires'];
            default: return ['dog', 'gutter'];
        }
    },

    spawnCoin() {
        const coin = this.getInactiveCoin();
        if (!coin) return;
        const types = this.getCoinTypesForLevel(Game.currentLevel);
        const type = types[Utils.randomInt(0, types.length - 1)];
        coin.type = type;
        switch (type) {
            case 'cash10': case 'cash50': case 'cash100': coin.w = 12; coin.h = 16; break;
            case 'bikeKey': coin.w = 16; coin.h = 16; break;
            case 'petrol': coin.w = 16; coin.h = 24; break;
            case 'chai': coin.w = 16; coin.h = 16; break;
            case 'parchi': coin.w = 12; coin.h = 16; break;
            default: coin.w = 12; coin.h = 16;
        }
        coin.x = 850;
        coin.y = this.groundY + Utils.random(-30, 30);
        coin.bobTimer = 0;
        coin.active = true;
    },

    getCoinTypesForLevel(level) {
        switch (level) {
            case 0: return ['cash10', 'cash50', 'cash10'];
            case 1: return ['cash10', 'cash50', 'cash100', 'bikeKey', 'chai'];
            case 2: return ['cash10', 'cash50', 'cash100', 'petrol', 'chai'];
            case 3: return ['cash10', 'cash50', 'cash100', 'petrol'];
            case 4: return ['cash50', 'cash100', 'chai', 'parchi'];
            case 5: return ['cash50', 'cash100', 'petrol'];
            default: return ['cash10'];
        }
    },

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

    getActive() { return this.obstacles; },
    getActiveCoins() { return this.coins; },
    recycle(obs) { obs.active = false; },
    recycleCoin(coin) { coin.active = false; },

    render(ctx) {
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].active) this.renderObstacle(ctx, this.obstacles[i]);
        }
        for (let i = 0; i < this.coins.length; i++) {
            if (this.coins[i].active) this.renderCoin(ctx, this.coins[i]);
        }
    },

    renderObstacle(ctx, obs) {
        const x = Math.round(obs.x);
        const y = Math.round(obs.y);
        switch (obs.type) {
            case 'dog':
                ctx.fillStyle = '#8B6914'; ctx.fillRect(x + 4, y + 4, 28, 16);
                ctx.fillStyle = '#7A5C12'; ctx.fillRect(x + 28, y, 12, 12);
                ctx.fillStyle = '#FF0000'; ctx.fillRect(x + 34, y + 3, 3, 3);
                ctx.fillStyle = '#5C4033';
                ctx.fillRect(x + 6, y + 20, 4, 8); ctx.fillRect(x + 14, y + 20, 4, 8);
                ctx.fillRect(x + 22, y + 20, 4, 8); ctx.fillRect(x + 30, y + 20, 4, 8);
                break;
            case 'gutter':
                ctx.fillStyle = '#1A1A1A'; ctx.fillRect(x, y, 48, 16);
                ctx.fillStyle = '#666666'; ctx.fillRect(x, y, 48, 3); ctx.fillRect(x, y + 13, 48, 3);
                break;
            case 'rickshaw':
                ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 8, y, 40, 12);
                ctx.fillStyle = '#228B22'; ctx.fillRect(x + 10, y + 10, 36, 24);
                ctx.fillStyle = '#333333';
                ctx.fillRect(x + 4, y + 32, 10, 10); ctx.fillRect(x + 42, y + 32, 10, 10);
                break;
            case 'carelessBike':
                ctx.fillStyle = '#CC0000'; ctx.fillRect(x + 8, y + 12, 24, 4);
                ctx.fillStyle = '#AA0000'; ctx.fillRect(x + 12, y + 6, 16, 10);
                ctx.fillStyle = '#222222';
                ctx.fillRect(x + 2, y + 24, 10, 10); ctx.fillRect(x + 28, y + 24, 10, 10);
                ctx.fillStyle = '#E8B89D'; ctx.fillRect(x + 14, y - 4, 10, 10);
                break;
            case 'speedCamera':
                ctx.fillStyle = '#888888'; ctx.fillRect(x + 10, y, 4, 36);
                ctx.fillStyle = '#F0F0F0'; ctx.fillRect(x, y, 24, 16);
                ctx.fillStyle = '#333333'; ctx.fillRect(x + 8, y + 4, 8, 8);
                ctx.fillStyle = '#FF0000'; ctx.fillRect(x + 18, y + 2, 4, 4);
                break;
            case 'tollBarrier':
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#CC0000' : '#FFD700';
                    ctx.fillRect(x, y + i * 10, 200, 10);
                }
                ctx.fillStyle = '#666666'; ctx.fillRect(x + 90, y + 40, 20, 16);
                break;
            case 'overheadWires':
                ctx.fillStyle = '#333333'; ctx.fillRect(x, y, 200, 3);
                ctx.fillStyle = '#444444'; ctx.fillRect(x, y + 3, 200, 3);
                break;
        }
    },

    renderCoin(ctx, coin) {
        const x = Math.round(coin.x);
        const y = Math.round(coin.y);
        switch (coin.type) {
            case 'cash10':
                ctx.fillStyle = '#4CAF50'; ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#fff'; ctx.fillRect(x + 3, y + 5, 6, 2);
                break;
            case 'cash50':
                ctx.fillStyle = '#388E3C'; ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#fff'; ctx.fillRect(x + 2, y + 5, 8, 2);
                break;
            case 'cash100':
                ctx.fillStyle = '#2E7D32'; ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 2, y + 5, 8, 2);
                break;
            case 'bikeKey':
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 4, y, 8, 4); ctx.fillRect(x + 6, y + 4, 4, 10); ctx.fillRect(x + 4, y + 12, 8, 2);
                break;
            case 'petrol':
                ctx.fillStyle = '#4CAF50'; ctx.fillRect(x + 4, y, 8, 4); ctx.fillRect(x + 2, y + 4, 12, 18);
                ctx.fillStyle = '#FF0000'; ctx.fillRect(x + 3, y + 8, 10, 6);
                break;
            case 'chai':
                ctx.fillStyle = '#D32F2F';
                ctx.fillRect(x + 2, y + 4, 12, 10); ctx.fillRect(x + 12, y + 6, 4, 4);
                ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(x + 4, y, 2, 4);
                break;
            case 'parchi':
                ctx.fillStyle = '#FFF8DC'; ctx.fillRect(x, y, 12, 16);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 2, y + 4, 8, 1); ctx.fillRect(x + 2, y + 7, 8, 1);
                break;
        }
    },
};
