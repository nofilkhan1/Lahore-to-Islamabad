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
    obstacleSpawnInterval: 60,
    coinSpawnInterval: 35,
    groundY: 370,

    init() {
        this.groundY = 395 - 64;
        for (let i = 0; i < this.POOL_OBSTACLES; i++) {
            this.obstacles.push({ active: false, type: '', x: 0, y: 0, w: 0, h: 0, speed: 0, triggered: false, nearMissed: false, dogState: 'idle', dogStateTimer: 0, dogAccel: 0, tollReduced: false });
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
        // Difficulty scaling: spawn rate increases gradually over longer levels
        const difficultyMult = Math.max(0.6, 1 - (Game.distance / 12000) * 0.4);
        const currentObstacleInterval = this.obstacleSpawnInterval * difficultyMult;
        const currentCoinInterval = this.coinSpawnInterval * Math.max(0.5, 1 - (Game.distance / 15000) * 0.5);

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

            // Dog AI with state machine
            if (obs.type === 'dog') {
                obs.dogStateTimer += dt / 60;
                const playerDist = Player.x - obs.x;
                const distAbs = Math.abs(playerDist);
                const levelData = Levels.currentLevelData;
                const chaseDuration = (levelData && levelData.dogChaseDuration) || 4;
                const accelRate = (levelData && levelData.dogAccelRate) || 1.0;
                const detectRange = 180 + accelRate * 20;

                switch (obs.dogState) {
                    case 'idle':
                        obs.speed = 0;
                        if (distAbs < detectRange && playerDist > 0) {
                            obs.dogState = 'alert';
                            obs.dogStateTimer = 0;
                            Audio.play('dogBark');
                        }
                        break;
                    case 'alert':
                        if (obs.dogStateTimer > 0.5) {
                            obs.dogState = 'chase';
                            obs.dogStateTimer = 0;
                            obs.dogAccel = 0;
                        }
                        break;
                    case 'chase':
                        obs.dogAccel = Math.min(1, obs.dogAccel + (dt / 90) * accelRate);
                        const chaseSpeed = 80 + obs.dogAccel * (200 + accelRate * 80);
                        obs.speed = chaseSpeed;
                        if (obs.dogStateTimer > chaseDuration) {
                            obs.dogState = 'tired';
                            obs.dogStateTimer = 0;
                        }
                        break;
                    case 'tired':
                        obs.speed = Math.max(0, obs.speed - 60 * (dt / 60));
                        if (obs.dogStateTimer > 2.5 || obs.speed <= 0) {
                            obs.speed = 0;
                            obs.dogState = 'idle';
                            obs.dogStateTimer = 0;
                        }
                        break;
                }
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
        obs.tollReduced = false;
        switch (type) {
            case 'dog': obs.w = 40; obs.h = 28; obs.y = this.groundY + 36; obs.speed = 0; break;
            case 'gutter': obs.w = 48; obs.h = 16; obs.y = this.groundY + 48; obs.speed = 0; break;
            case 'rickshaw': obs.w = 56; obs.h = 44; obs.y = this.groundY + 20; obs.speed = Utils.random(50, 150); break;
            case 'carelessBike': obs.w = 40; obs.h = 36; obs.y = this.groundY + 28; obs.speed = Utils.random(80, 200); break;
            case 'speedCamera': obs.w = 24; obs.h = 36; obs.y = this.groundY - 20; obs.speed = 0; break;
            case 'tollBarrier': obs.w = 200; obs.h = 40; obs.y = this.groundY + 24; obs.speed = 0; break;
            case 'overheadWires': obs.w = 200; obs.h = 8; obs.y = this.groundY - 30; obs.speed = 0; break;
            case 'constructionCone': obs.w = 16; obs.h = 24; obs.y = this.groundY - 24; obs.speed = 0; break;
            case 'truck': obs.w = 64; obs.h = 48; obs.y = this.groundY + 16; obs.speed = Utils.random(30, 80); break;
            case 'mountainGoat': obs.w = 36; obs.h = 32; obs.y = this.groundY + 32; obs.speed = 0; break;
            case 'fallingRock': obs.w = 20; obs.h = 20; obs.y = this.groundY - 40; obs.speed = 0; break;
            case 'monkey': obs.w = 32; obs.h = 28; obs.y = this.groundY - 30; obs.speed = 0; break;
            case 'icePatch': obs.w = 60; obs.h = 8; obs.y = this.groundY + 56; obs.speed = 0; break;
            case 'flashFlood': obs.w = 80; obs.h = 30; obs.y = this.groundY + 34; obs.speed = 0; break;
            case 'rollingRock': obs.w = 24; obs.h = 24; obs.y = this.groundY + 40; obs.speed = Utils.random(100, 200); break;
            case 'narrowBridge': obs.w = 200; obs.h = 8; obs.y = this.groundY + 56; obs.speed = 0; break;
            case 'tourist': obs.w = 28; obs.h = 32; obs.y = this.groundY + 32; obs.speed = 0; break;
            case 'lightningZone': obs.w = 100; obs.h = 40; obs.y = this.groundY + 24; obs.speed = 0; break;
            case 'snowPatch': obs.w = 50; obs.h = 6; obs.y = this.groundY + 58; obs.speed = 0; break;
        }
        obs.x = 850;
        obs.active = true;
    },

    getObstacleTypesForLevel(level) {
        switch (level) {
            case 0: return ['dog', 'gutter', 'dog', 'gutter'];
            case 1: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'constructionCone'];
            case 2: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'speedCamera', 'constructionCone', 'truck'];
            case 3: return ['dog', 'gutter', 'rickshaw', 'carelessBike', 'tollBarrier', 'constructionCone'];
            case 4: return ['rickshaw', 'carelessBike', 'speedCamera', 'gutter', 'constructionCone'];
            case 5: return ['dog', 'gutter', 'rickshaw', 'overheadWires', 'constructionCone'];
            case 6: return ['dog', 'fallingRock', 'mountainGoat', 'snowPatch'];
            case 7: return ['dog', 'gutter', 'tourist', 'icePatch', 'monkey'];
            case 8: return ['dog', 'fallingRock', 'flashFlood', 'rollingRock', 'narrowBridge'];
            case 9: return ['dog', 'fallingRock', 'flashFlood', 'lightningZone'];
            default: return ['dog', 'gutter'];
        }
    },

    spawnCoin() {
        const coin = this.getInactiveCoin();
        if (!coin) return;
        const levelData = Levels.currentLevelData;
        const isFootOnly = levelData && levelData.footOnly;
        // 5% chance for Jugaad Repair (rare roadside mechanic) - not in footOnly levels
        if (!isFootOnly && Math.random() < 0.05 && Player.mode === 'foot' && !Player.hasBikeKey) {
            coin.type = 'jugaadRepair';
            coin.w = 24; coin.h = 24;
        } else {
            const types = this.getCoinTypesForLevel(Game.currentLevel);
            const type = types[Utils.randomInt(0, types.length - 1)];
            coin.type = type;
            switch (type) {
                case 'cash10': case 'cash50': case 'cash100': case 'cash500': coin.w = 12; coin.h = 16; break;
                case 'bikeKey': coin.w = 16; coin.h = 16; break;
                case 'petrol': coin.w = 16; coin.h = 24; break;
                case 'chai': coin.w = 16; coin.h = 16; break;
                case 'hotChai': coin.w = 16; coin.h = 16; break;
                case 'parchi': coin.w = 12; coin.h = 16; break;
                case 'bhutta': coin.w = 16; coin.h = 16; break;
                case 'shawl': coin.w = 16; coin.h = 16; break;
                case 'guava': coin.w = 14; coin.h = 14; break;
                case 'jeepToken': coin.w = 20; coin.h = 20; break;
                case 'delivery': coin.w = 16; coin.h = 16; break;
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
            case 0: return ['cash10', 'cash50', 'cash10', 'guava'];
            case 1: return ['cash10', 'cash50', 'cash100', 'chai', 'delivery'];
            case 2: return ['cash10', 'cash50', 'cash100', 'petrol', 'chai'];
            case 3: return ['cash50', 'cash100', 'petrol', 'cash500'];
            case 4: return ['cash50', 'cash100', 'chai', 'parchi'];
            case 5: return ['cash50', 'cash100', 'petrol'];
            case 6: return ['cash50', 'cash100', 'hotChai', 'shawl'];
            case 7: return ['cash50', 'cash100', 'bhutta'];
            case 8: return ['cash50', 'cash100', 'jeepToken'];
            case 9: return ['cash50', 'cash100'];
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

        // Sprite-first rendering: try image, fall back to vector
        const spriteMap = {
            'dog_idle': 'dog_sit',
            'dog': (obs.dogState === 'idle' || obs.dogState === 'tired') ? 'dog_sit' : (Math.floor(Date.now() / 200) % 2 === 0 ? 'dog_run1' : 'dog_run2'),
            'angry_dog': (Math.floor(Date.now() / 150) % 2 === 0) ? 'dog_run1' : 'dog_run2',
            'rickshaw': 'rickshaw',
            'carelessBike': 'careless_biker',
            'truck': 'truck',
            'gutter': 'gutter',
            'overheadWires': 'wires_pole',
        };
        const imgKey = typeof spriteMap[obs.type] === 'function' ? spriteMap[obs.type]() : spriteMap[obs.type];
        if (imgKey && AssetLoader.has(imgKey)) {
            let drawW = obs.w + 8, drawH = obs.h + 8;
            let drawX = x - 4, drawY = y - 4;
            if (obs.type === 'truck') { drawW = 80; drawH = 54; drawX = x - 4; drawY = y - 4; }
            if (obs.type === 'gutter') { drawW = obs.w; drawH = obs.h; drawX = x; drawY = y; }
            AssetLoader.draw(ctx, imgKey, drawX, drawY, drawW, drawH);
            return;
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
                // Eye
                ctx.fillStyle = obs.dogState === 'chase' ? '#FF0000' : (obs.dogState === 'alert' ? '#FFAA00' : '#1A1A1A');
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
                const legAnim = obs.dogState === 'chase' ? Math.sin(Date.now() * 0.01) * 3 : 0;
                ctx.fillRect(x + 6, y + 20, 3, 8 + legAnim);
                ctx.fillRect(x + 12, y + 20, 3, 8 - legAnim);
                ctx.fillRect(x + 22, y + 20, 3, 8 + legAnim);
                ctx.fillRect(x + 30, y + 20, 3, 8 - legAnim);
                // Paws
                ctx.fillStyle = '#5C4033';
                ctx.fillRect(x + 5, y + 26, 5, 2);
                ctx.fillRect(x + 11, y + 26, 5, 2);
                ctx.fillRect(x + 21, y + 26, 5, 2);
                ctx.fillRect(x + 29, y + 26, 5, 2);
                // Tail
                ctx.fillStyle = '#8B6914';
                const tailWag = obs.dogState === 'chase' ? Math.sin(Date.now() * 0.015) * 4 : 0;
                ctx.fillRect(x - 2 + tailWag, y + 4, 6, 3);
                // State indicators
                if (obs.dogState === 'alert') {
                    ctx.fillStyle = '#FFAA00';
                    ctx.font = 'bold 12px monospace';
                    ctx.fillText('!', x + 34, y - 4);
                } else if (obs.dogState === 'tired') {
                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.font = '8px monospace';
                    ctx.fillText('...', x + 28, y - 2);
                }
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

            case 'truck':
                // Truck body
                ctx.fillStyle = '#1565C0';
                ctx.fillRect(x, y + 8, 48, 36);
                // Truck art decorations
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2, y + 10, 44, 3);
                ctx.fillRect(x + 2, y + 39, 44, 3);
                // Truck art flowers
                ctx.fillStyle = '#FF6F00';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(x + 6 + i * 12, y + 16, 8, 8);
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 8 + i * 12, y + 18, 4, 4);
                    ctx.fillStyle = '#FF6F00';
                }
                // Cab
                ctx.fillStyle = '#0D47A1';
                ctx.fillRect(x + 48, y + 12, 16, 32);
                // Windshield
                ctx.fillStyle = '#81D4FA';
                ctx.fillRect(x + 50, y + 14, 12, 10);
                // Wheels
                ctx.fillStyle = '#1A1A1A';
                ctx.beginPath();
                ctx.arc(x + 12, y + 44, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 36, y + 44, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 56, y + 44, 6, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'mountainGoat':
                // Body
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(x + 8, y + 8, 20, 16);
                // Head
                ctx.fillStyle = '#795548';
                ctx.fillRect(x + 24, y + 4, 12, 10);
                // Horns
                ctx.fillStyle = '#D7CCC8';
                ctx.fillRect(x + 26, y, 3, 6);
                ctx.fillRect(x + 32, y, 3, 6);
                // Eyes
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 30, y + 6, 3, 3);
                // Legs
                ctx.fillStyle = '#6D4C41';
                ctx.fillRect(x + 10, y + 24, 3, 8);
                ctx.fillRect(x + 18, y + 24, 3, 8);
                ctx.fillRect(x + 26, y + 24, 3, 8);
                break;

            case 'fallingRock':
                // Rock
                ctx.fillStyle = '#795548';
                ctx.fillRect(x + 2, y + 2, 16, 16);
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(x + 4, y + 4, 12, 12);
                // Shadow
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x + 6, y + 6, 8, 8);
                // Dust particles
                ctx.fillStyle = 'rgba(139, 119, 101, 0.5)';
                ctx.fillRect(x + 2, y + 16, 4, 3);
                ctx.fillRect(x + 14, y + 18, 3, 2);
                break;

            case 'monkey':
                // Body
                ctx.fillStyle = '#795548';
                ctx.fillRect(x + 8, y + 8, 16, 12);
                // Head
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(x + 12, y, 10, 10);
                // Face
                ctx.fillStyle = '#D7CCC8';
                ctx.fillRect(x + 14, y + 2, 6, 6);
                // Eyes
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 15, y + 3, 2, 2);
                ctx.fillRect(x + 19, y + 3, 2, 2);
                // Arms (reaching for items)
                ctx.fillStyle = '#6D4C41';
                const armAnim = Math.sin(Date.now() * 0.01) * 3;
                ctx.fillRect(x + 4, y + 10, 6, 3 + armAnim);
                ctx.fillRect(x + 22, y + 10, 6, 3 - armAnim);
                // Tail
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x, y + 4, 8, 2);
                break;

            case 'icePatch':
                // Ice surface
                ctx.fillStyle = 'rgba(179, 229, 252, 0.7)';
                ctx.fillRect(x, y, 60, 8);
                // Shine lines
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillRect(x + 5, y + 2, 20, 1);
                ctx.fillRect(x + 30, y + 4, 15, 1);
                ctx.fillRect(x + 10, y + 6, 10, 1);
                break;

            case 'flashFlood':
                // Water wave
                ctx.fillStyle = 'rgba(33, 150, 243, 0.7)';
                ctx.fillRect(x, y, 80, 30);
                // Wave crests
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                for (let i = 0; i < 4; i++) {
                    const wx = x + (Date.now() * 0.03 + i * 20) % 80;
                    ctx.fillRect(wx, y + 5, 15, 3);
                }
                // Debris
                ctx.fillStyle = '#795548';
                ctx.fillRect(x + 20, y + 15, 8, 4);
                ctx.fillRect(x + 50, y + 20, 6, 3);
                break;

            case 'rollingRock':
                // Rolling boulder
                ctx.fillStyle = '#795548';
                ctx.beginPath();
                ctx.arc(x + 12, y + 12, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#8D6E63';
                ctx.beginPath();
                ctx.arc(x + 12, y + 12, 8, 0, Math.PI * 2);
                ctx.fill();
                // Dust trail
                ctx.fillStyle = 'rgba(139, 119, 101, 0.4)';
                ctx.fillRect(x - 10, y + 16, 12, 4);
                break;

            case 'narrowBridge':
                // Wooden planks
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(x, y, 200, 8);
                // Plank gaps
                ctx.fillStyle = '#5D4037';
                for (let i = 0; i < 10; i++) {
                    ctx.fillRect(x + i * 20 + 18, y, 2, 8);
                }
                // Ropes
                ctx.strokeStyle = '#D7CCC8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - 5);
                ctx.lineTo(x + 200, y - 5);
                ctx.stroke();
                break;

            case 'tourist':
                // Person
                ctx.fillStyle = '#1565C0';
                ctx.fillRect(x + 6, y + 8, 16, 16);
                // Head
                ctx.fillStyle = '#E8B89D';
                ctx.fillRect(x + 8, y, 12, 10);
                // Phone (taking selfie)
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(x + 22, y + 4, 6, 10);
                // Arm with phone
                ctx.fillStyle = '#E8B89D';
                ctx.fillRect(x + 18, y + 6, 6, 3);
                // Legs
                ctx.fillStyle = '#333';
                ctx.fillRect(x + 8, y + 24, 4, 8);
                ctx.fillRect(x + 16, y + 24, 4, 8);
                break;

            case 'lightningZone':
                // Warning zone
                ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';
                ctx.fillRect(x, y, 100, 40);
                // Lightning bolt
                const lightningFlash = Math.floor(Date.now() / 300) % 2 === 0;
                if (lightningFlash) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x + 45, y, 10, 15);
                    ctx.fillRect(x + 35, y + 12, 10, 15);
                    ctx.fillRect(x + 45, y + 24, 10, 16);
                }
                // Warning signs
                ctx.fillStyle = '#FF0000';
                ctx.font = 'bold 14px monospace';
                ctx.fillText('⚡', x + 42, y + 38);
                break;

            case 'snowPatch':
                // Snow surface
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(x, y, 50, 6);
                // Shine
                ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
                ctx.fillRect(x + 5, y + 1, 15, 2);
                break;
        }
    },

    renderCoin(ctx, coin) {
        const x = Math.round(coin.x);
        const y = Math.round(coin.y);
        const bob = Math.sin(coin.bobTimer * 3) * 2;
        const pulse = 0.85 + 0.15 * Math.sin(Date.now() * 0.005 + coin.x);

        switch (coin.type) {
            case 'cash10':
            case 'cash50':
            case 'cash100':
            case 'cash500':
                ctx.save();
                ctx.globalAlpha = pulse;
                if (AssetLoader.draw(ctx, 'rupee_note', x, y + bob, coin.w, coin.h)) {
                    ctx.restore();
                    return;
                }
                ctx.fillStyle = coin.type === 'cash500' ? '#4CAF50' :
                                coin.type === 'cash100' ? '#2196F3' :
                                coin.type === 'cash50'  ? '#FF9800' : '#9E9E9E';
                ctx.fillRect(x, y + bob, coin.w, coin.h);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 1, y + 1 + bob, coin.w - 2, coin.h - 2);
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${Math.min(coin.w, coin.h) - 4}px monospace`;
                ctx.textAlign = 'center';
                ctx.fillText('\u20A8', x + coin.w / 2, y + coin.h - 3 + bob);
                ctx.globalAlpha = pulse * 0.3;
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(x - 3, y - 3 + bob, coin.w + 6, coin.h + 6);
                ctx.restore();
                break;

            case 'petrol':
                ctx.save();
                ctx.globalAlpha = pulse;
                if (AssetLoader.draw(ctx, 'petrol_bottle', x, y + bob, coin.w, coin.h)) {
                    ctx.restore();
                    return;
                }
                ctx.fillStyle = '#FF5722';
                ctx.fillRect(x + 4, y + 4 + bob, coin.w - 8, coin.h - 4);
                ctx.fillStyle = '#F44336';
                ctx.fillRect(x + 7, y + bob, coin.w - 14, 6);
                ctx.restore();
                break;

            case 'bikeKey':
                ctx.save();
                ctx.globalAlpha = pulse;
                if (AssetLoader.draw(ctx, 'key', x, y + bob, coin.w, coin.h)) {
                    ctx.restore();
                    return;
                }
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + coin.w / 2, y + 8 + bob, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFA000';
                ctx.fillRect(x + coin.w / 2 - 1, y + 12 + bob, 2, coin.h - 12);
                ctx.shadowBlur = 0;
                ctx.restore();
                break;

            default:
                ctx.save();
                ctx.globalAlpha = pulse;
                ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
                ctx.beginPath();
                ctx.arc(x + coin.w / 2, y + coin.h / 2 + bob, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x + coin.w / 2, y + coin.h / 2 + bob, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.fillRect(x + coin.w / 2 - 1, y + 2 + bob, 2, coin.h - 4);
                ctx.restore();
                break;
        }
        ctx.textAlign = 'left';
    },
};
