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
        // Difficulty scaling: spawn rate increases with distance
        const difficultyMult = Math.max(0.5, 1 - (Game.distance / 5000) * 0.3);
        const currentObstacleInterval = this.obstacleSpawnInterval * difficultyMult;
        const currentCoinInterval = this.coinSpawnInterval * Math.max(0.6, 1 - (Game.distance / 8000) * 0.2);

        this.obstacleSpawnTimer += dt;
        if (this.obstacleSpawnTimer >= currentObstacleInterval) {
            this.obstacleSpawnTimer = 0;
            this.spawnObstacle();
        }
        this.coinSpawnTimer += dt;
        if (this.coinSpawnTimer >= currentCoinInterval) {
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
            case 'constructionCone': obs.w = 16; obs.h = 24; obs.y = this.groundY - 24; obs.speed = 0; break;
        }
        obs.x = 850;
        obs.active = true;
    },

    getObstacleTypesForLevel(level) {
        switch (level) {
            case 0: return ['dog', 'gutter', 'dog', 'gutter'];
            case 1: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'constructionCone'];
            case 2: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'speedCamera', 'constructionCone'];
            case 3: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'tollBarrier', 'constructionCone'];
            case 4: return ['rickshaw', 'carelessBike', 'speedCamera', 'gutter', 'constructionCone'];
            case 5: return ['dog', 'gutter', 'rickshaw', 'overheadWires', 'constructionCone'];
            default: return ['dog', 'gutter'];
        }
    },

    spawnCoin() {
        const coin = this.getInactiveCoin();
        if (!coin) return;
        // 5% chance for Jugaad Repair (rare roadside mechanic)
        if (Math.random() < 0.05 && Player.mode === 'foot' && !Player.hasBikeKey) {
            coin.type = 'jugaadRepair';
            coin.w = 24; coin.h = 24;
        } else {
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

    spawnTollBarrier() {
        const obs = this.getInactiveObstacle();
        if (!obs) return;
        obs.type = 'tollBarrier';
        obs.x = 850;
        obs.y = this.groundY - 40;
        obs.w = 200;
        obs.h = 40;
        obs.speed = 0;
        obs.triggered = false;
        obs.active = true;
    },

    spawnBikeKeyAtDistance(distance) {
        const coin = this.getInactiveCoin();
        if (!coin) return;
        coin.type = 'bikeKey';
        coin.w = 16;
        coin.h = 16;
        coin.x = 850;
        coin.y = this.groundY - 40;
        coin.bobTimer = Math.random() * Math.PI * 2;
        coin.active = true;
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

        // Try image first
        const imgMap = {
            'angry_dog': 'dog_angry', 'dog': 'dog',
            'rickshaw': 'rickshaw', 'careless_rider': 'rider',
            'bike_rider': 'bike_rider', 'speed_camera': 'speed_cam',
            'toll_barrier': 'toll_barrier',
            'chalaan_walker': 'chalaan_walker',
        };
        const imgKey = imgMap[obs.type];
        if (imgKey && AssetLoader.has(imgKey)) {
            if (obs.type.includes('dog')) {
                AssetLoader.draw(ctx, imgKey, x - 5, y - 5, obs.hitbox.w + 10, obs.hitbox.h + 10);
                return;
            } else if (obs.type === 'toll_barrier') {
                AssetLoader.draw(ctx, imgKey, x, y, obs.hitbox.w, 80);
                return;
            } else {
                AssetLoader.draw(ctx, imgKey, x - 5, y - 5, obs.hitbox.w + 10, obs.hitbox.h + 10);
                return;
            }
        }

        // Shadow for all obstacles
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + obs.w / 2, y + obs.h + 2, obs.w / 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        switch (obs.type) {
            case 'dog':
                // Body
                ctx.fillStyle = '#A0782C';
                ctx.fillRect(x + 4, y + 6, 28, 14);
                // Belly (lighter)
                ctx.fillStyle = '#C4956A';
                ctx.fillRect(x + 8, y + 14, 20, 6);
                // Head
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x + 28, y + 2, 12, 12);
                // Snout
                ctx.fillStyle = '#C4956A';
                ctx.fillRect(x + 36, y + 6, 6, 4);
                // Nose
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 40, y + 6, 3, 2);
                // Eye (red angry)
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 32, y + 4, 3, 3);
                // Pupil
                ctx.fillStyle = '#880000';
                ctx.fillRect(x + 33, y + 5, 1, 1);
                // Ears
                ctx.fillStyle = '#6B4F12';
                ctx.fillRect(x + 28, y, 5, 5);
                ctx.fillRect(x + 35, y, 5, 5);
                // Legs
                ctx.fillStyle = '#7A5C12';
                ctx.fillRect(x + 6, y + 20, 3, 8);
                ctx.fillRect(x + 12, y + 20, 3, 8);
                ctx.fillRect(x + 22, y + 20, 3, 8);
                ctx.fillRect(x + 30, y + 20, 3, 8);
                // Paws
                ctx.fillStyle = '#5C4033';
                ctx.fillRect(x + 5, y + 26, 5, 2);
                ctx.fillRect(x + 11, y + 26, 5, 2);
                ctx.fillRect(x + 21, y + 26, 5, 2);
                ctx.fillRect(x + 29, y + 26, 5, 2);
                // Tail
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x, y + 4, 6, 3);
                break;

            case 'gutter':
                // Open pit
                ctx.fillStyle = '#0A0A0A';
                ctx.fillRect(x + 2, y + 2, 44, 12);
                // Broken concrete edges
                ctx.fillStyle = '#888';
                ctx.fillRect(x, y, 48, 3);
                ctx.fillRect(x, y + 13, 48, 3);
                // Cracks
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 10, y, 2, 3);
                ctx.fillRect(x + 30, y + 13, 2, 3);
                // Slime/water at bottom
                ctx.fillStyle = '#2D5A1E';
                ctx.fillRect(x + 6, y + 10, 12, 3);
                ctx.fillStyle = '#3D7A2E';
                ctx.fillRect(x + 26, y + 11, 10, 2);
                break;

            case 'rickshaw':
                // Canopy/roof (colorful)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 6, y, 44, 10);
                ctx.fillStyle = '#FF6600';
                ctx.fillRect(x + 8, y + 2, 40, 6);
                // Canopy fringe
                ctx.fillStyle = '#FF0066';
                for (let i = 0; i < 8; i++) {
                    ctx.fillRect(x + 8 + i * 5, y + 8, 3, 4);
                }
                // Body (green/yellow typical Qingqi)
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 8, y + 10, 40, 22);
                // Windows
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 10, y + 12, 10, 8);
                ctx.fillRect(x + 24, y + 12, 10, 8);
                // Seat visible through window
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 11, y + 18, 8, 3);
                ctx.fillRect(x + 25, y + 18, 8, 3);
                // Wheels
                ctx.fillStyle = '#1A1A1A';
                ctx.beginPath();
                ctx.arc(x + 10, y + 36, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 46, y + 36, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.arc(x + 10, y + 36, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 46, y + 36, 2, 0, Math.PI * 2);
                ctx.fill();
                // Driver silhouette
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 38, y + 14, 8, 12);
                // Rear wheel
                ctx.fillStyle = '#1A1A1A';
                ctx.beginPath();
                ctx.arc(x + 28, y + 38, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'carelessBike':
                // Frame
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(x + 8, y + 14, 24, 3);
                // Engine
                ctx.fillStyle = '#444';
                ctx.fillRect(x + 14, y + 16, 12, 6);
                // Seat
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 8, y + 10, 12, 5);
                // Fuel tank
                ctx.fillStyle = '#BB0000';
                ctx.fillRect(x + 14, y + 8, 10, 6);
                // Exhaust
                ctx.fillStyle = '#777';
                ctx.fillRect(x + 2, y + 20, 10, 3);
                // Wheels
                ctx.fillStyle = '#1A1A1A';
                ctx.beginPath();
                ctx.arc(x + 6, y + 28, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 34, y + 28, 7, 0, Math.PI * 2);
                ctx.fill();
                // Handlebar
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 32, y + 6, 4, 10);
                // Rider body
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 12, y - 2, 14, 12);
                // Rider head
                ctx.fillStyle = '#E8B89D';
                ctx.fillRect(x + 14, y - 10, 10, 10);
                // Hair (no helmet!)
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 13, y - 12, 12, 5);
                // Eyes
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 18, y - 6, 2, 2);
                break;

            case 'speedCamera':
                // Pole
                ctx.fillStyle = '#777';
                ctx.fillRect(x + 10, y + 12, 4, 24);
                ctx.fillStyle = '#555';
                ctx.fillRect(x + 8, y + 32, 8, 4);
                // Camera box
                ctx.fillStyle = '#E8E8E8';
                ctx.fillRect(x, y, 24, 14);
                ctx.fillStyle = '#D0D0D0';
                ctx.fillRect(x + 2, y + 2, 20, 10);
                // Lens
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 6, y + 3, 8, 8);
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 8, y + 5, 4, 4);
                // Flash
                const flashOn = Math.floor(Date.now() / 500) % 2 === 0;
                ctx.fillStyle = flashOn ? '#FF0000' : '#660000';
                ctx.fillRect(x + 18, y + 2, 4, 4);
                // Warning label
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2, y + 12, 20, 2);
                break;

            case 'tollBarrier':
                // Boom barrier stripes
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#CC0000' : '#FFD700';
                    ctx.fillRect(x, y + i * 8, 200, 8);
                }
                // Metal pole
                ctx.fillStyle = '#555';
                ctx.fillRect(x + 92, y + 40, 16, 16);
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 94, y + 42, 12, 12);
                // Warning light on top
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 96, y + 36, 8, 4);
                break;

            case 'overheadWires':
                // Cable bundle (messy Pakistani wires)
                ctx.fillStyle = '#222';
                ctx.fillRect(x, y, 200, 2);
                ctx.fillStyle = '#333';
                ctx.fillRect(x, y + 2, 200, 2);
                ctx.fillStyle = '#444';
                ctx.fillRect(x + 20, y - 1, 200, 2);
                ctx.fillStyle = '#2A2A2A';
                ctx.fillRect(x + 40, y + 4, 180, 1);
                // Hanging droop
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 60, y + 3, 40, 2);
                break;
            case 'constructionCone':
                // Orange cone
                ctx.fillStyle = '#FF6600';
                ctx.beginPath();
                ctx.moveTo(x + 8, y);
                ctx.lineTo(x + 16, y + 24);
                ctx.lineTo(x, y + 24);
                ctx.fill();
                // White stripes
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 2, y + 8, 12, 3);
                ctx.fillRect(x + 4, y + 16, 8, 3);
                break;
        }
    },

    renderCoin(ctx, coin) {
        const x = Math.round(coin.x);
        const y = Math.round(coin.y);
        const bob = Math.sin(coin.bobTimer * 3) * 2;

        // Try image first
        const coinImgMap = {
            'cash10': 'coin_rupee', 'cash50': 'coin_bills', 'cash500': 'coin_gold',
            'paratha': 'paratha', 'petrol': 'petrol', 'bikeKey': 'key_bike',
        };
        const imgKey = coinImgMap[coin.type];
        if (imgKey && AssetLoader.has(imgKey)) {
            AssetLoader.draw(ctx, imgKey, x, y + bob, coin.w, coin.h);
            return;
        }

        // Sparkle glow for all collectibles
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.beginPath();
        ctx.arc(x + coin.w / 2, y + coin.h / 2 + bob, 12, 0, Math.PI * 2);
        ctx.fill();

        switch (coin.type) {
            case 'cash10':
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x, y + bob, 12, 16);
                ctx.fillStyle = '#66BB6A';
                ctx.fillRect(x + 1, y + 1 + bob, 10, 14);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 3, y + 5 + bob, 6, 2);
                ctx.fillRect(x + 5, y + 3 + bob, 2, 6);
                break;
            case 'cash50':
                ctx.fillStyle = '#388E3C';
                ctx.fillRect(x, y + bob, 12, 16);
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x + 1, y + 1 + bob, 10, 14);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 2, y + 5 + bob, 8, 2);
                ctx.fillRect(x + 4, y + 3 + bob, 4, 6);
                break;
            case 'cash100':
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x, y + bob, 12, 16);
                ctx.fillStyle = '#388E3C';
                ctx.fillRect(x + 1, y + 1 + bob, 10, 14);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2, y + 4 + bob, 8, 3);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 4, y + 3 + bob, 4, 5);
                break;
            case 'bikeKey':
                // Key bow (round top)
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + 8, y + 4 + bob, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#DAA520';
                ctx.beginPath();
                ctx.arc(x + 8, y + 4 + bob, 3, 0, Math.PI * 2);
                ctx.fill();
                // Shaft
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 6, y + 8 + bob, 4, 6);
                // Bit
                ctx.fillRect(x + 4, y + 12 + bob, 6, 2);
                ctx.fillRect(x + 4, y + 10 + bob, 2, 4);
                // Sparkle
                ctx.fillStyle = '#FFF';
                ctx.fillRect(x + 2, y + bob, 2, 2);
                ctx.fillRect(x + 12, y + 2 + bob, 2, 2);
                break;
            case 'petrol':
                // Bottle body
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x + 2, y + 4 + bob, 12, 18);
                // Cap
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 4, y + bob, 8, 5);
                // Label
                ctx.fillStyle = '#FF5722';
                ctx.fillRect(x + 3, y + 8 + bob, 10, 8);
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + 5, y + 10 + bob, 6, 2);
                ctx.fillRect(x + 5, y + 13 + bob, 4, 2);
                // Liquid level
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x + 3, y + 14 + bob, 10, 6);
                break;
            case 'chai':
                // Cup
                ctx.fillStyle = '#D32F2F';
                ctx.fillRect(x + 2, y + 4 + bob, 12, 10);
                // Cup rim
                ctx.fillStyle = '#E57373';
                ctx.fillRect(x + 1, y + 4 + bob, 14, 2);
                // Handle
                ctx.fillStyle = '#B71C1C';
                ctx.fillRect(x + 13, y + 6 + bob, 3, 5);
                // Chai inside
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(x + 3, y + 6 + bob, 10, 6);
                // Steam wisps
                const t = Date.now() * 0.003;
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillRect(x + 4, y - 2 + Math.sin(t) * 2 + bob, 2, 4);
                ctx.fillRect(x + 8, y - 4 + Math.sin(t + 1) * 2 + bob, 2, 4);
                break;
            case 'parchi':
                // Paper slip
                ctx.fillStyle = '#FFF8DC';
                ctx.fillRect(x, y + bob, 12, 16);
                ctx.fillStyle = '#F5F0C0';
                ctx.fillRect(x + 1, y + 1 + bob, 10, 14);
                // Text lines
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 2, y + 3 + bob, 8, 1);
                ctx.fillRect(x + 2, y + 6 + bob, 8, 1);
                ctx.fillRect(x + 2, y + 9 + bob, 6, 1);
                // Stamp
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(x + 6, y + 11 + bob, 5, 4);
                break;
            case 'jugaadRepair':
                // Wrench icon
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 8, y + 2 + bob, 4, 16);
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 4, y + 2 + bob, 12, 6);
                // Sparkle
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2, y + bob, 3, 3);
                ctx.fillRect(x + 18, y + 4 + bob, 3, 3);
                // Text
                ctx.fillStyle = '#FF6F00';
                ctx.font = '6px monospace';
                ctx.fillText('REPAIR', x + 1, y + 22 + bob);
                break;
        }
    },
};
