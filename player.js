// ============================================================
// player.js — Enhanced rendering with detailed character art
// ============================================================

const Player = {
    mode: 'foot',
    x: 100, y: 370,
    velX: 0, velY: 0,
    grounded: true,
    groundY: 370,

    foot: { w: 32, h: 64, speed: 200, jumpForce: -450, gravity: 980, duckH: 32 },
    bike: { w: 64, h: 54, speed: 500, jumpForce: -350, gravity: 1960 },

    w: 32, h: 64,
    hearts: 5, maxHearts: 5,
    wallet: 0, fuel: 100, maxFuel: 100, parchiCount: 0,
    ducking: false,
    invincible: false, invincibleTimer: 0,
    flashTimer: 0, flashVisible: true, flashInterval: 0,
    chaiActive: false, chaiTimer: 0,
    mountingBike: false, mountTimer: 0,
    animFrame: 0, animTimer: 0,
    runCycle: 0,
    facingRight: true,
    upgrades: {},
    speedMultiplier: 1,
    shieldCount: 0,
    mtagPass: false,

    init() { this.reset(); },

    reset() {
        this.mode = 'foot';
        this.x = 100;
        this.groundY = 450 - this.foot.h - 16;
        this.y = this.groundY;
        this.velX = 0; this.velY = 0;
        this.grounded = true;
        this.w = this.foot.w; this.h = this.foot.h;
        this.hearts = this.maxHearts;
        this.wallet = 0; this.fuel = 100; this.maxFuel = 100;
        this.parchiCount = 0;
        this.ducking = false;
        this.invincible = false; this.invincibleTimer = 0;
        this.flashTimer = 0; this.flashVisible = true; this.flashInterval = 0;
        this.chaiActive = false; this.chaiTimer = 0;
        this.mountingBike = false; this.mountTimer = 0;
        this.animFrame = 0; this.animTimer = 0;
        this.runCycle = 0;
    },

    resetForNewLevel() {
        this.x = 100;
        this.velX = 0; this.velY = 0;
        this.grounded = true;
        this.ducking = false;
        this.invincible = false; this.invincibleTimer = 0;
        this.flashTimer = 0;
        this.chaiActive = false; this.chaiTimer = 0;
        this.mountingBike = false;
        if (this.mode === 'foot') {
            this.w = this.foot.w; this.h = this.foot.h;
            this.groundY = 450 - this.foot.h - 16;
        } else {
            this.w = this.bike.w; this.h = this.bike.h;
            this.groundY = 450 - this.bike.h - 16;
        }
        this.y = this.groundY;
    },

    update(dt) {
        if (this.mountingBike) {
            this.mountTimer -= dt / 60;
            if (this.mountTimer <= 0) {
                this.mountingBike = false;
                this.mode = 'bike';
                this.w = this.bike.w; this.h = this.bike.h;
                this.groundY = 450 - this.bike.h - 16;
                this.y = this.groundY;
            }
            return;
        }

        const moveRight = Input.isRight();
        const moveLeft = Input.isLeft();
        const jumpPress = Input.isJumpJustPressed();

        let maxSpeed = this.mode === 'bike' ? this.bike.speed : this.foot.speed;
        if (this.chaiActive) maxSpeed *= 2;

        if (moveRight) {
            this.velX = Utils.lerp(this.velX, maxSpeed, 0.1);
            this.facingRight = true;
        } else if (moveLeft) {
            this.velX = Utils.lerp(this.velX, -maxSpeed * 0.5, 0.1);
            this.facingRight = false;
        } else {
            this.velX = Utils.lerp(this.velX, 0, 0.15);
        }

        if (this.mode === 'foot' && Input.isDown() && this.grounded) {
            if (!this.ducking) {
                this.ducking = true;
                this.h = this.foot.duckH;
                this.y = this.groundY + (this.foot.h - this.foot.duckH);
            }
        } else if (this.ducking) {
            this.ducking = false;
            this.h = this.foot.h;
            this.y = this.groundY;
        }

        // Manual dismount (risky - costs 1 heart + 2s stun)
        if (this.mode === 'bike' && Input.isDismount() && !this.mountingBike) {
            this.hearts = Math.max(0, this.hearts - 1);
            this.demoteToFoot();
            this.invincible = true;
            this.invincibleTimer = 2.0;
            HUD.showMessage('DISMOUNT! -1 Heart', '#ff4444');
            Audio.play('hit');
            Utils.triggerScreenShake(3, 0.2);
        }

        if (jumpPress && this.grounded) {
            const jumpForce = this.mode === 'bike' ? this.bike.jumpForce : this.foot.jumpForce;
            this.velY = this.chaiActive ? jumpForce * 1.3 : jumpForce;
            this.grounded = false;
            Audio.play('jump');
        }

        const gravity = this.mode === 'bike' ? this.bike.gravity : this.foot.gravity;
        if (!this.grounded) this.velY += gravity * (dt / 60);

        this.x += this.velX * (dt / 60);
        this.y += this.velY * (dt / 60);

        if (this.y >= this.groundY) {
            if (!this.grounded && this.velY > 0) Audio.play('landing');
            this.y = this.groundY;
            this.velY = 0;
            this.grounded = true;
        }

        this.x = Utils.clamp(this.x, 0, 800 - this.w);

        if (this.invincible) {
            this.invincibleTimer -= dt / 60;
            this.flashTimer -= dt / 60;
            this.flashInterval += dt / 60;
            if (this.flashInterval >= 0.08) { this.flashVisible = !this.flashVisible; this.flashInterval = 0; }
            if (this.invincibleTimer <= 0) { this.invincible = false; this.flashVisible = true; }
        }

        if (this.chaiActive) { this.chaiTimer -= dt / 60; if (this.chaiTimer <= 0) this.chaiActive = false; }

        if (this.mode === 'bike') {
            this.fuel -= 5 * (dt / 60);
            if (this.fuel <= 0) { this.fuel = 0; this.demoteToFoot(); HUD.showMessage('FUEL EMPTY!', '#ff4444'); }
        }

        this.animTimer += dt / 60;
        if (this.animTimer >= 0.12) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
            if (Math.abs(this.velX) > 20) this.runCycle = (this.runCycle + 1) % 4;
        }

        // Emit dust when running on ground
        if (this.grounded && Math.abs(this.velX) > 100 && Math.random() < 0.3) {
            Particles.emitDust(this.x, this.groundY + this.h);
        }
    },

    getHitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; },

    promoteToBike() {
        if (this.mode === 'bike') return;
        this.mountingBike = true;
        this.mountTimer = 0.5;
        this.fuel = 100;
        Audio.play('bikeStart');
    },

    demoteToFoot() {
        if (this.mode === 'foot') return;
        this.mode = 'foot';
        this.w = this.foot.w; this.h = this.foot.h;
        this.groundY = 450 - this.foot.h - 16;
        this.y = this.groundY;
        this.invincible = true; this.invincibleTimer = 1.5;
        this.flashTimer = 1.5; this.flashInterval = 0;
        Audio.play('bikeCrash');
        Particles.emitSmoke(this.x + this.w / 2, this.y);
    },

    activateChaiPower() { this.chaiActive = true; this.chaiTimer = 5; },

    render(ctx) {
        if (this.invincible && !this.flashVisible) return;
        if (this.mountingBike) { this.renderFoot(ctx); return; }
        if (this.mode === 'foot') this.renderFoot(ctx);
        else this.renderBike(ctx);
    },

    renderFoot(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const f = this.runCycle;
        const moving = Math.abs(this.velX) > 20;

        // Try image first
        if (!this.ducking) {
            const imgKey = this.jumping ? 'player_jump' : 'player_run';
            if (AssetLoader.draw(ctx, imgKey, x, y, this.w, this.h, this.flipX)) {
                if (this.chaiActive) {
                    const glow = Math.sin(Date.now() * 0.01) * 0.1 + 0.25;
                    ctx.fillStyle = 'rgba(255, 152, 0, ' + glow + ')';
                    ctx.fillRect(x - 6, y - 6, this.w + 12, this.h + 12);
                }
                return;
            }
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x + 16, this.groundY + this.h + 2, 14, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.ducking) {
            // Ducking pose - compact crouch
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(x + 2, y + 8, 28, 18);
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(x + 10, y + 2, 12, 10);
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(x + 8, y, 16, 6);
            ctx.fillStyle = '#556B2F';
            ctx.fillRect(x + 24, y + 10, 8, 12);
            return;
        }

        // Legs (shalwar - white loose pants)
        const legOffset = moving ? Math.sin(f * Math.PI / 2) * 3 : 0;
        ctx.fillStyle = '#E8E0D0';
        ctx.fillRect(x + 6, y + 42, 8, 18 + legOffset);
        ctx.fillRect(x + 18, y + 42, 8, 18 - legOffset);

        // Sandals (chappal)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y + 58 + legOffset, 12, 5);
        ctx.fillRect(x + 16, y + 58 - legOffset, 12, 5);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + 6, y + 58 + legOffset, 8, 2);
        ctx.fillRect(x + 18, y + 58 - legOffset, 8, 2);

        // Body (kameez - cream/off-white tunic)
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 3, y + 18, 26, 26);
        // Kameez collar
        ctx.fillStyle = '#EDE8D0';
        ctx.fillRect(x + 10, y + 16, 12, 4);

        // Collar detail (shalwar kameez neckline)
        ctx.fillStyle = '#D4CDB8';
        ctx.fillRect(x + 13, y + 16, 6, 2);

        // Backpack
        ctx.fillStyle = '#3D5C2E';
        ctx.fillRect(x + 24, y + 20, 8, 16);
        ctx.fillStyle = '#4A6E35';
        ctx.fillRect(x + 25, y + 21, 6, 14);
        ctx.fillStyle = '#5C3317';
        ctx.fillRect(x + 24, y + 20, 8, 2);

        // Arms
        const armSwing = moving ? Math.sin(f * Math.PI / 2) * 4 : 0;
        ctx.fillStyle = '#E8B89D';
        ctx.fillRect(x - 1, y + 22 + armSwing, 5, 12);
        ctx.fillRect(x + 28, y + 22 - armSwing, 5, 12);

        // Head
        ctx.fillStyle = '#E8B89D';
        ctx.fillRect(x + 8, y, 16, 16);

        // Hair
        ctx.fillStyle = '#2C1810';
        ctx.fillRect(x + 6, y - 2, 20, 8);
        ctx.fillRect(x + 6, y, 2, 6);

        // Eyes
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 14, y + 5, 2, 3);
        ctx.fillRect(x + 18, y + 5, 2, 3);

        // Eyebrows
        ctx.fillRect(x + 13, y + 4, 4, 1);
        ctx.fillRect(x + 17, y + 4, 4, 1);

        // Chai power-up glow
        if (this.chaiActive) {
            const glow = Math.sin(Date.now() * 0.01) * 0.1 + 0.25;
            ctx.fillStyle = 'rgba(255, 152, 0, ' + glow + ')';
            ctx.fillRect(x - 6, y - 6, this.w + 12, this.h + 12);
        }
    },

    renderBike(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const wheelSpin = (Date.now() / 50) % 8;

        // Try image first
        const bikeImg = this.jumping ? 'bike_jump' : 'bike_run';
        if (AssetLoader.draw(ctx, bikeImg, x - 5, y - 5, 70, 50, false)) {
            if (this.chaiActive) {
                const glow = Math.sin(Date.now() * 0.01) * 0.1 + 0.25;
                ctx.fillStyle = 'rgba(255, 152, 0, ' + glow + ')';
                ctx.fillRect(x - 10, y - 22, 70, 56);
            }
            return;
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(x + 32, this.groundY + this.h + 3, 28, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // === BIKE (Honda CD 70 style) ===

        // Rear wheel
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(x + 14, y + 40, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + 14, y + 40, 6, 0, Math.PI * 2);
        ctx.fill();
        // Spokes
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const angle = (wheelSpin + i * 2) * 0.4;
            ctx.beginPath();
            ctx.moveTo(x + 14, y + 40);
            ctx.lineTo(x + 14 + Math.cos(angle) * 8, y + 40 + Math.sin(angle) * 8);
            ctx.stroke();
        }

        // Front wheel
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(x + 50, y + 40, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + 50, y + 40, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#888';
        for (let i = 0; i < 4; i++) {
            const angle = (wheelSpin + i * 2) * 0.4;
            ctx.beginPath();
            ctx.moveTo(x + 50, y + 40);
            ctx.lineTo(x + 50 + Math.cos(angle) * 8, y + 40 + Math.sin(angle) * 8);
            ctx.stroke();
        }

        // Frame (black body)
        ctx.fillStyle = '#2A2A2A';
        ctx.fillRect(x + 10, y + 20, 44, 4);
        ctx.fillRect(x + 14, y + 16, 8, 8);

        // Engine block
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 18, y + 22, 16, 10);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 19, y + 23, 14, 3);

        // Fuel tank
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(x + 16, y + 10, 20, 10);
        ctx.fillStyle = '#DD2222';
        ctx.fillRect(x + 18, y + 12, 16, 4);
        // Honda logo stripe
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 20, y + 14, 12, 2);

        // Seat
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 8, y + 8, 14, 6);
        ctx.fillStyle = '#2A2A2A';
        ctx.fillRect(x + 9, y + 9, 12, 3);

        // Exhaust pipe
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 2, y + 26, 12, 3);
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 2, y + 27, 3, 2);

        // Handlebar
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 50, y + 4, 4, 14);
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 46, y + 4, 12, 3);

        // Headlight
        ctx.fillStyle = '#FFFF88';
        ctx.fillRect(x + 54, y + 8, 4, 5);
        if (this.fuel > 20 || Math.floor(Date.now() / 300) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 150, 0.4)';
            ctx.beginPath();
            ctx.moveTo(x + 58, y + 10);
            ctx.lineTo(x + 70, y + 6);
            ctx.lineTo(x + 70, y + 14);
            ctx.closePath();
            ctx.fill();
        }

        // === RIDER ===

        // Body (kameez on bike)
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 14, y - 6, 20, 18);

        // Backpack
        ctx.fillStyle = '#3D5C2E';
        ctx.fillRect(x + 10, y - 4, 6, 12);

        // Arms reaching to handlebar
        ctx.fillStyle = '#E8B89D';
        ctx.fillRect(x + 34, y + 2, 10, 4);

        // Head
        ctx.fillStyle = '#E8B89D';
        ctx.fillRect(x + 18, y - 16, 14, 12);

        // Hair
        ctx.fillStyle = '#2C1810';
        ctx.fillRect(x + 16, y - 18, 18, 7);

        // Eyes
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 24, y - 12, 2, 2);
        ctx.fillRect(x + 28, y - 12, 2, 2);

        // Chai power-up glow
        if (this.chaiActive) {
            const glow = Math.sin(Date.now() * 0.01) * 0.1 + 0.25;
            ctx.fillStyle = 'rgba(255, 152, 0, ' + glow + ')';
            ctx.fillRect(x - 6, y - 22, this.w + 12, this.h + 12);
        }

        // Low fuel warning
        if (this.fuel < 20 && this.fuel > 0) {
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
                ctx.fillRect(x - 4, y - 22, this.w + 8, this.h + 8);
            }
        }
    },
};
