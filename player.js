// ============================================================
// player.js — Foot mode, bike mode, state machine, physics
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
    wallet: 0, fuel: 100, parchiCount: 0,
    ducking: false,
    invincible: false, invincibleTimer: 0,
    flashTimer: 0, flashVisible: true, flashInterval: 0,
    chaiActive: false, chaiTimer: 0,
    mountingBike: false, mountTimer: 0,
    animFrame: 0, animTimer: 0,
    facingRight: true,

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
        this.wallet = 0; this.fuel = 100;
        this.parchiCount = 0;
        this.ducking = false;
        this.invincible = false; this.invincibleTimer = 0;
        this.flashTimer = 0; this.flashVisible = true; this.flashInterval = 0;
        this.chaiActive = false; this.chaiTimer = 0;
        this.mountingBike = false; this.mountTimer = 0;
        this.animFrame = 0; this.animTimer = 0;
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

        if (jumpPress && this.grounded) {
            const jumpForce = this.mode === 'bike' ? this.bike.jumpForce : this.foot.jumpForce;
            this.velY = this.chaiActive ? jumpForce * 1.3 : jumpForce;
            this.grounded = false;
            Audio.play('jump');
        }

        const gravity = this.mode === 'bike' ? this.bike.gravity : this.foot.gravity;
        if (!this.grounded) {
            this.velY += gravity * (dt / 60);
        }

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
            if (this.flashInterval >= 0.08) {
                this.flashVisible = !this.flashVisible;
                this.flashInterval = 0;
            }
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.flashVisible = true;
            }
        }

        if (this.chaiActive) {
            this.chaiTimer -= dt / 60;
            if (this.chaiTimer <= 0) this.chaiActive = false;
        }

        if (this.mode === 'bike') {
            this.fuel -= 5 * (dt / 60);
            if (this.fuel <= 0) {
                this.fuel = 0;
                this.demoteToFoot();
                HUD.showMessage('FUEL EMPTY!', '#ff4444');
            }
        }

        this.animTimer += dt / 60;
        if (this.animTimer >= 0.15) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    },

    getHitbox() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    },

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
        this.invincible = true;
        this.invincibleTimer = 1.5;
        this.flashTimer = 1.5;
        this.flashInterval = 0;
        Audio.play('bikeCrash');
    },

    activateChaiPower() {
        this.chaiActive = true;
        this.chaiTimer = 5;
    },

    render(ctx) {
        if (this.invincible && !this.flashVisible) return;
        if (this.mountingBike) {
            this.renderFoot(ctx);
            return;
        }
        if (this.mode === 'foot') this.renderFoot(ctx);
        else this.renderBike(ctx);
    },

    renderFoot(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        if (this.ducking) {
            ctx.fillStyle = '#E8E0D0';
            ctx.fillRect(x + 4, y + 4, 24, 20);
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(x + 8, y, 16, 12);
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(x + 8, y, 16, 5);
        } else {
            ctx.fillStyle = '#E8E0D0';
            ctx.fillRect(x + 6, y + 40, 8, 20);
            ctx.fillRect(x + 18, y + 40, 8, 20);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 4, y + 56, 12, 6);
            ctx.fillRect(x + 16, y + 56, 12, 6);
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(x + 4, y + 16, 24, 26);
            ctx.fillStyle = '#556B2F';
            ctx.fillRect(x + 22, y + 18, 10, 18);
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(x, y + 20, 6, 14);
            ctx.fillRect(x + 26, y + 20, 6, 14);
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(x + 8, y, 16, 18);
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(x + 6, y, 20, 8);
            if (this.chaiActive) {
                ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
                ctx.fillRect(x - 4, y - 4, this.w + 8, this.h + 8);
            }
        }
    },

    renderBike(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 10, y + 15, 44, 4);
        ctx.fillStyle = '#444444';
        ctx.fillRect(x + 18, y + 10, 28, 14);
        ctx.fillStyle = '#5C3317';
        ctx.fillRect(x + 12, y + 8, 16, 6);
        ctx.fillStyle = '#222222';
        ctx.fillRect(x + 4, y + 32, 16, 16);
        ctx.fillRect(x + 44, y + 32, 16, 16);
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 10, y + 36, 4, 8);
        ctx.fillRect(x + 50, y + 36, 4, 8);
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 48, y + 4, 6, 12);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 54, y + 8, 4, 4);
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(x + 16, y - 4, 20, 16);
        ctx.fillStyle = '#E8B89D';
        ctx.fillRect(x + 20, y - 14, 14, 12);
        ctx.fillStyle = '#2C1810';
        ctx.fillRect(x + 18, y - 14, 18, 6);
        if (this.chaiActive) {
            ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
            ctx.fillRect(x - 4, y - 4, this.w + 8, this.h + 8);
        }
        if (this.fuel < 20 && this.fuel > 0) {
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.fillRect(x - 2, y - 2, this.w + 4, this.h + 4);
            }
        }
    },
};
