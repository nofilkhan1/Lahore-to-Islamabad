// ============================================================
// player.js — Foot mode, bike mode, state machine, physics
// ============================================================

const Player = {
    // --- Mode ---
    mode: 'foot', // 'foot' | 'bike'

    // --- Position & Physics ---
    x: 100,
    y: 0,
    velX: 0,
    velY: 0,
    grounded: false,
    groundY: 370, // Ground level (450 - 64 player height - 16 ground)

    // --- Foot Mode Stats ---
    foot: {
        w: 32,
        h: 64,
        speed: 200,
        jumpForce: -450,
        gravity: 980,
        duckH: 32,
    },

    // --- Bike Mode Stats ---
    bike: {
        w: 64,
        h: 54,
        speed: 500,
        jumpForce: -350,
        gravity: 1960,
    },

    // --- Current hitbox (changes with mode/ducking) ---
    w: 32,
    h: 64,

    // --- Health & Economy ---
    hearts: 5,
    maxHearts: 5,
    wallet: 0,
    fuel: 100,
    parchiCount: 0,

    // --- State Flags ---
    ducking: false,
    invincible: false,
    invincibleTimer: 0,
    flashTimer: 0,
    flashVisible: true,
    flashInterval: 0,

    // --- Chai Power-Up ---
    chaiActive: false,
    chaiTimer: 0,

    // --- Animation ---
    animFrame: 0,
    animTimer: 0,
    facingRight: true,

    // --- Bike Mounting ---
    mountingBike: false,
    mountTimer: 0,

    // --- Colors (for colored shape rendering) ---
    bodyColor: '#F5F5DC',
    skinColor: '#E8B89D',
    hairColor: '#2C1810',
    bikeColor: '#333333',

    init() {
        this.reset();
    },

    reset() {
        this.mode = 'foot';
        this.x = 100;
        this.y = this.groundY;
        this.velX = 0;
        this.velY = 0;
        this.grounded = true;
        this.w = this.foot.w;
        this.h = this.foot.h;
        this.hearts = this.maxHearts;
        this.wallet = 0;
        this.fuel = 100;
        this.parchiCount = 0;
        this.ducking = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.flashTimer = 0;
        this.flashVisible = true;
        this.chaiActive = false;
        this.chaiTimer = 0;
        this.mountingBike = false;
        this.mountTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;

        // Set initial ground Y based on canvas
        this.groundY = 450 - this.foot.h - 16;
    },

    resetForNewLevel() {
        this.x = 100;
        this.velX = 0;
        this.velY = 0;
        this.grounded = true;
        this.ducking = false;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.flashTimer = 0;
        this.chaiActive = false;
        this.chaiTimer = 0;
        this.mountingBike = false;

        // Keep mode and fuel from previous level
        if (this.mode === 'foot') {
            this.w = this.foot.w;
            this.h = this.foot.h;
            this.groundY = 450 - this.foot.h - 16;
        } else {
            this.w = this.bike.w;
            this.h = this.bike.h;
            this.groundY = 450 - this.bike.h - 16;
        }
        this.y = this.groundY;
    },

    update(dt) {
        // --- Mounting Animation ---
        if (this.mountingBike) {
            this.mountTimer -= dt / 60;
            if (this.mountTimer <= 0) {
                this.mountingBike = false;
                this.mode = 'bike';
                this.w = this.bike.w;
                this.h = this.bike.h;
                this.groundY = 450 - this.bike.h - 16;
                this.y = this.groundY;
            }
            return;
        }

        // --- Input ---
        const moveLeft = Input.isLeft();
        const moveRight = Input.isRight();
        const jumpPress = Input.isJumpJustPressed();
        const jumpHold = Input.isJump();
        const duckHold = Input.isDown();

        // --- Horizontal Movement ---
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

        // --- Ducking (foot mode only) ---
        if (this.mode === 'foot' && duckHold && this.grounded) {
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

        // --- Jumping ---
        if (jumpPress && this.grounded) {
            const jumpForce = this.mode === 'bike' ? this.bike.jumpForce : this.foot.jumpForce;
            this.velY = this.chaiActive ? jumpForce * 1.3 : jumpForce;
            this.grounded = false;
            Audio.play('jump');
        }

        // --- Gravity ---
        const gravity = this.mode === 'bike' ? this.bike.gravity : this.foot.gravity;
        if (!this.grounded) {
            this.velY += gravity * (dt / 60);
        }

        // --- Apply Movement ---
        this.x += this.velX * (dt / 60);
        this.y += this.velY * (dt / 60);

        // --- Ground Collision ---
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            if (!this.grounded && this.velY > 0) {
                Audio.play('landing');
            }
            this.velY = 0;
            this.grounded = true;
        }

        // --- Keep player in bounds ---
        this.x = Utils.clamp(this.x, 0, 800 - this.w);

        // --- Invincibility Timer ---
        if (this.invincible) {
            this.invincibleTimer -= dt / 60;
            this.flashTimer -= dt / 60;

            // Blink effect
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

        // --- Chai Power-Up Timer ---
        if (this.chaiActive) {
            this.chaiTimer -= dt / 60;
            if (this.chaiTimer <= 0) {
                this.chaiActive = false;
            }
        }

        // --- Bike Fuel ---
        if (this.mode === 'bike') {
            this.fuel -= 5 * (dt / 60); // 5 units/sec
            if (this.fuel <= 0) {
                this.fuel = 0;
                this.demoteToFoot();
                HUD.showMessage('⛽ FUEL EMPTY!', '#ff4444');
            }

            // Engine sputter sound when low fuel
            if (this.fuel < 20 && this.fuel > 0) {
                // Handled in audio.js
            }
        }

        // --- Animation ---
        this.animTimer += dt / 60;
        if (this.animTimer >= 0.15) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    },

    // --- Get Current Hitbox ---
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
        };
    },

    // --- Promote to Bike ---
    promoteToBike() {
        if (this.mode === 'bike') return;
        this.mountingBike = true;
        this.mountTimer = 0.5;
        this.fuel = 100;
        Audio.play('bikeStart');
    },

    // --- Demote to Foot ---
    demoteToFoot() {
        if (this.mode === 'foot') return;
        this.mode = 'foot';
        this.w = this.foot.w;
        this.h = this.foot.h;
        this.groundY = 450 - this.foot.h - 16;
        this.y = this.groundY;
        this.invincible = true;
        this.invincibleTimer = 1.5;
        this.flashTimer = 1.5;
        this.flashInterval = 0;
        Audio.play('bikeCrash');
    },

    // --- Chai Power-Up ---
    activateChaiPower() {
        this.chaiActive = true;
        this.chaiTimer = 5;
    },

    // --- Render (Colored Shapes for Phase 1) ---
    render(ctx) {
        // Skip rendering during invincibility blink
        if (this.invincible && !this.flashVisible) return;

        // Mounting animation
        if (this.mountingBike) {
            this.renderMounting(ctx);
            return;
        }

        if (this.mode === 'foot') {
            this.renderFoot(ctx);
        } else {
            this.renderBike(ctx);
        }
    },

    renderFoot(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        if (this.ducking) {
            // Ducking — compressed body
            // Body (shalwar kameez)
            ctx.fillStyle = this.bodyColor;
            ctx.fillRect(x + 4, y + 4, 24, 20);

            // Head
            ctx.fillStyle = this.skinColor;
            ctx.fillRect(x + 8, y, 16, 12);

            // Hair
            ctx.fillStyle = this.hairColor;
            ctx.fillRect(x + 8, y, 16, 5);
        } else {
            // Standing/Running

            // Legs (shalwar)
            ctx.fillStyle = '#E8E0D0';
            ctx.fillRect(x + 6, y + 40, 8, 20);
            ctx.fillRect(x + 18, y + 40, 8, 20);

            // Sandals
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 4, y + 56, 12, 6);
            ctx.fillRect(x + 16, y + 56, 12, 6);

            // Body (kameez)
            ctx.fillStyle = this.bodyColor;
            ctx.fillRect(x + 4, y + 16, 24, 26);

            // Backpack
            ctx.fillStyle = '#556B2F';
            ctx.fillRect(x + 22, y + 18, 10, 18);

            // Arms
            ctx.fillStyle = this.skinColor;
            ctx.fillRect(x, y + 20, 6, 14);
            ctx.fillRect(x + 26, y + 20, 6, 14);

            // Head
            ctx.fillStyle = this.skinColor;
            ctx.fillRect(x + 8, y, 16, 18);

            // Hair
            ctx.fillStyle = this.hairColor;
            ctx.fillRect(x + 6, y, 20, 8);

            // Chai power-up glow
            if (this.chaiActive) {
                ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
                ctx.fillRect(x - 4, y - 4, this.w + 8, this.h + 8);
            }
        }
    },

    renderBike(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);

        // Bike frame
        ctx.fillStyle = this.bikeColor;
        ctx.fillRect(x + 10, y + 15, 44, 4);

        // Bike body / engine
        ctx.fillStyle = '#444444';
        ctx.fillRect(x + 18, y + 10, 28, 14);

        // Seat
        ctx.fillStyle = '#5C3317';
        ctx.fillRect(x + 12, y + 8, 16, 6);

        // Wheels
        ctx.fillStyle = '#222222';
        ctx.fillRect(x + 4, y + 32, 16, 16); // rear
        ctx.fillRect(x + 44, y + 32, 16, 16); // front

        // Wheel spokes (chrome)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 10, y + 36, 4, 8);
        ctx.fillRect(x + 50, y + 36, 4, 8);

        // Handlebar
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 48, y + 4, 6, 12);

        // Headlight
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 54, y + 8, 4, 4);

        // Exhaust
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 2, y + 20, 10, 4);

        // Rider body
        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(x + 16, y - 4, 20, 16);

        // Rider head
        ctx.fillStyle = this.skinColor;
        ctx.fillRect(x + 20, y - 14, 14, 12);

        // Rider hair
        ctx.fillStyle = this.hairColor;
        ctx.fillRect(x + 18, y - 14, 18, 6);

        // Backpack on rider
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(x + 12, y - 2, 6, 12);

        // Chai power-up glow
        if (this.chaiActive) {
            ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
            ctx.fillRect(x - 4, y - 4, this.w + 8, this.h + 8);
        }

        // Fuel low warning flash
        if (this.fuel < 20 && this.fuel > 0) {
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.fillRect(x - 2, y - 2, this.w + 4, this.h + 4);
            }
        }
    },

    renderMounting(ctx) {
        // Simple transition: player fading onto bike
        const progress = 1 - (this.mountTimer / 0.5);
        ctx.globalAlpha = 1 - progress;
        this.renderFoot(ctx);
        ctx.globalAlpha = progress;
        this.renderBike(ctx);
        ctx.globalAlpha = 1;
    },
};
