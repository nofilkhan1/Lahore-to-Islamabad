// ============================================================
// particles.js — Rain, dust, sparks, coin sparkle effects
// ============================================================

const Particles = {
    pool: [],
    POOL_SIZE: 50,

    init() {
        for (let i = 0; i < this.POOL_SIZE; i++) {
            this.pool.push({
                active: false,
                x: 0, y: 0,
                velX: 0, velY: 0,
                life: 0,
                maxLife: 0,
                size: 0,
                color: '',
                type: '', // spark, dust, rain, sparkle
                gravity: 0,
                alpha: 1,
            });
        }
    },

    reset() {
        this.pool.forEach(p => p.active = false);
    },

    update(dt) {
        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            p.life -= dt / 60;
            if (p.life <= 0) {
                p.active = false;
                continue;
            }

            // Apply velocity
            p.x += p.velX * (dt / 60);
            p.y += p.velY * (dt / 60);

            // Apply gravity
            p.velY += p.gravity * (dt / 60);

            // Fade out near end of life
            p.alpha = Math.max(0, p.life / p.maxLife);
        }
    },

    // --- Emit Effects ---

    // Burst of sparks (coin collect, hit effect)
    burst(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const p = this.getInactive();
            if (!p) return;

            p.active = true;
            p.x = x;
            p.y = y;
            p.velX = (Math.random() - 0.5) * 200;
            p.velY = (Math.random() - 0.5) * 200 - 50;
            p.life = 0.5;
            p.maxLife = 0.5;
            p.size = Utils.random(2, 4);
            p.color = color || Utils.COLORS.SPARK;
            p.type = 'spark';
            p.gravity = 100;
            p.alpha = 1;
        }
    },

    // Rain particles
    emitRain() {
        const p = this.getInactive();
        if (!p) return;

        p.active = true;
        p.x = Math.random() * 800;
        p.y = -10;
        p.velX = -30;
        p.velY = 400;
        p.life = 2;
        p.maxLife = 2;
        p.size = 2;
        p.color = Utils.COLORS.RAIN;
        p.type = 'rain';
        p.gravity = 0;
        p.alpha = 0.6;
    },

    // Dust trail (bike moving)
    emitDust(x, y) {
        const p = this.getInactive();
        if (!p) return;

        p.active = true;
        p.x = x + Math.random() * 10;
        p.y = y + Math.random() * 4;
        p.velX = -Utils.random(20, 60);
        p.velY = -Utils.random(10, 30);
        p.life = 0.6;
        p.maxLife = 0.6;
        p.size = Utils.random(3, 6);
        p.color = Utils.COLORS.DUST;
        p.type = 'dust';
        p.gravity = -20;
        p.alpha = 0.5;
    },

    // Smoke puff (exhaust, explosion)
    emitSmoke(x, y) {
        const p = this.getInactive();
        if (!p) return;

        p.active = true;
        p.x = x;
        p.y = y;
        p.velX = -Utils.random(10, 30);
        p.velY = -Utils.random(20, 50);
        p.life = 1;
        p.maxLife = 1;
        p.size = Utils.random(4, 8);
        p.color = '#888888';
        p.type = 'dust';
        p.gravity = -10;
        p.alpha = 0.4;
    },

    // Sparkle (bike key, special item)
    emitSparkle(x, y, color) {
        const p = this.getInactive();
        if (!p) return;

        p.active = true;
        p.x = x + Math.random() * 16;
        p.y = y + Math.random() * 16;
        p.velX = (Math.random() - 0.5) * 40;
        p.velY = (Math.random() - 0.5) * 40;
        p.life = 0.8;
        p.maxLife = 0.8;
        p.size = Utils.random(1, 3);
        p.color = color || '#FFD700';
        p.type = 'sparkle';
        p.gravity = 0;
        p.alpha = 1;
    },

    // --- Pool Helper ---
    getInactive() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].active) return this.pool[i];
        }
        return null;
    },

    // --- Render ---
    render(ctx) {
        for (let i = 0; i < this.pool.length; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            ctx.save();
            ctx.globalAlpha = p.alpha;

            switch (p.type) {
                case 'spark':
                    ctx.fillStyle = p.color;
                    ctx.fillRect(
                        Math.round(p.x - p.size / 2),
                        Math.round(p.y - p.size / 2),
                        p.size, p.size
                    );
                    break;

                case 'rain':
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(Math.round(p.x), Math.round(p.y));
                    ctx.lineTo(Math.round(p.x + p.velX * 0.02), Math.round(p.y + 6));
                    ctx.stroke();
                    break;

                case 'dust':
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(
                        Math.round(p.x),
                        Math.round(p.y),
                        p.size / 2,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                    break;

                case 'sparkle':
                    ctx.fillStyle = p.color;
                    // Star shape
                    const sx = Math.round(p.x);
                    const sy = Math.round(p.y);
                    const ss = p.size;
                    ctx.fillRect(sx - ss, sy, ss * 2, 1);
                    ctx.fillRect(sx, sy - ss, 1, ss * 2);
                    break;
            }

            ctx.restore();
        }
    },
};
