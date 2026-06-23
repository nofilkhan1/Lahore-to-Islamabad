// ============================================================
// modes.js — Load shedding, chalaan escape, bonus stage modes
// ============================================================

const Modes = {
    // --- Load Shedding Mode ---
    loadShedding: {
        active: false,
        torchAngle: 0,
    },

    // --- Chalaan Escape Mode ---
    chalaan: {
        active: false,
        wardenX: -60,
        wardenY: 370,
        timer: 45,
        stunned: false,
        stunTimer: 0,
        caught: false,
    },

    // --- Bonus Stage ---
    bonus: {
        active: false,
        timer: 15,
        cashRainTimer: 0,
        collected: 0,
    },

    // --- Toll Plaza State ---
    toll: {
        active: false,
        choiceMade: false,
    },

    init() {
        this.reset();
    },

    reset() {
        this.loadShedding.active = false;
        this.loadShedding.torchAngle = 0;

        this.chalaan.active = false;
        this.chalaan.wardenX = -60;
        this.chalaan.timer = 45;
        this.chalaan.stunned = false;
        this.chalaan.caught = false;

        this.bonus.active = false;
        this.bonus.timer = 15;
        this.bonus.collected = 0;

        this.toll.active = false;
        this.toll.choiceMade = false;
    },

    update(dt) {
        // --- Chalaan Mode ---
        if (this.chalaan.active) {
            this.updateChalaan(dt);
        }

        // --- Bonus Stage ---
        if (this.bonus.active) {
            this.updateBonusStage(dt);
        }

        // --- Load Shedding torch flicker ---
        if (this.loadShedding.active) {
            this.loadShedding.torchAngle += dt * 0.1;
        }
    },

    // ===========================
    // LOAD SHEDDING MODE
    // ===========================
    activateLoadShedding() {
        this.loadShedding.active = true;
    },

    deactivateLoadShedding() {
        this.loadShedding.active = false;
    },

    renderLoadSheddingOverlay(ctx) {
        if (!this.loadShedding.active) return;

        const W = 800;
        const H = 450;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, W, H);

        // Light cone from player position
        const px = Player.x + Player.w / 2;
        const py = Player.y + Player.h / 2;

        // Create gradient for torch/light
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, Player.mode === 'bike' ? 180 : 120);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        // Cut out the light cone
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradient;

        if (Player.mode === 'bike') {
            // Bike headlight — narrow forward cone
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + 200, py - 60);
            ctx.lineTo(px + 200, py + 60);
            ctx.closePath();
            ctx.fill();
        } else {
            // Torch — wider cone
            const flicker = Math.sin(this.loadShedding.torchAngle * 5) * 10;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + 140 + flicker, py - 80);
            ctx.lineTo(px + 140 + flicker, py + 80);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Add warm glow tint
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 200, 100, 0.1)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    },

    // ===========================
    // CHALAAN ESCAPE MODE
    // ===========================
    activateChalaan() {
        this.chalaan.active = true;
        this.chalaan.wardenX = -60;
        this.chalaan.timer = 45;
        this.chalaan.stunned = false;
        this.chalaan.caught = false;
        Audio.play('wardenSiren');
    },

    deactivateChalaan() {
        this.chalaan.active = false;
    },

    updateChalaan(dt) {
        if (this.chalaan.caught) return;

        // Timer countdown
        this.chalaan.timer -= dt / 60;

        if (this.chalaan.timer <= 0) {
            // Survived! Bonus reward
            Player.wallet += 1000;
            HUD.showMessage('Rs. 1000 BONUS! 🎉', '#4CAF50');
            this.deactivateChalaan();
            return;
        }

        // Stun recovery
        if (this.chalaan.stunned) {
            this.chalaan.stunTimer -= dt / 60;
            if (this.chalaan.stunTimer <= 0) {
                this.chalaan.stunned = false;
            }
            return;
        }

        // Warden chases — always 10% faster than player
        const wardenSpeed = (Player.velX > 0 ? Player.velX : Game.scrollSpeed) * 1.1;
        this.chalaan.wardenX += (wardenSpeed - Game.scrollSpeed) * (dt / 60);

        // Warden catches player
        if (this.chalaan.wardenX >= Player.x - 40) {
            this.chalaan.caught = true;
            this.chalaan.stunned = true;
            this.chalaan.stunTimer = 0.5;

            // Fine the player
            Player.wallet = Math.max(0, Player.wallet - 500);
            HUD.showMessage('Rs. 500 FINE! 🚔', '#ff4444');
            Utils.triggerScreenShake(4, 0.3);

            // Reset warden position
            this.chalaan.wardenX = -60;
            this.chalaan.timer = 45;
            this.chalaan.caught = false;
        }
    },

    renderChalaanWarden(ctx) {
        if (!this.chalaan.active) return;

        const x = Math.round(this.chalaan.wardenX);
        const y = this.chalaan.wardenY;

        // Warden bike
        ctx.fillStyle = '#1A237E'; // Dark blue police
        ctx.fillRect(x + 8, y + 12, 32, 4); // frame
        ctx.fillStyle = '#0D47A1';
        ctx.fillRect(x + 12, y + 6, 24, 10); // body

        // Wheels
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 2, y + 24, 10, 10);
        ctx.fillRect(x + 36, y + 24, 10, 10);

        // Warden figure
        ctx.fillStyle = '#8D6E63'; // Khaki uniform
        ctx.fillRect(x + 14, y - 8, 16, 16);

        // Helmet
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 16, y - 14, 12, 8);

        // Flashing lights (red/blue alternating)
        const flash = Math.floor(Date.now() / 200) % 2;
        ctx.fillStyle = flash ? '#FF0000' : '#2196F3';
        ctx.fillRect(x + 10, y - 4, 4, 4);
        ctx.fillStyle = flash ? '#2196F3' : '#FF0000';
        ctx.fillRect(x + 30, y - 4, 4, 4);

        // Siren glow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = flash ? '#FF0000' : '#2196F3';
        ctx.beginPath();
        ctx.arc(x + 22, y - 2, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Baton
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 34, y - 6, 3, 12);
    },

    // ===========================
    // BONUS STAGE
    // ===========================
    startBonusStage() {
        this.bonus.active = true;
        this.bonus.timer = 15;
        this.bonus.collected = 0;
        this.bonus.cashRainTimer = 0;

        // Stop scroll
        Game.scrollSpeed = 0;
        Game.targetScrollSpeed = 0;

        Game.showScreen('levelCompleteScreen');
        document.querySelector('#levelCompleteScreen .screen-title').textContent = '💸 AMMI\'S POCKET MONEY!';
        document.querySelector('#levelCompleteScreen .screen-subtitle').textContent = 'Collect as much as you can!';
        document.getElementById('btnNextLevel').style.display = 'none';

        setTimeout(() => {
            Game.hideAllScreens();
            document.getElementById('btnNextLevel').style.display = '';
        }, 2000);
    },

    updateBonusStage(dt) {
        this.bonus.timer -= dt / 60;

        if (this.bonus.timer <= 0) {
            // End bonus stage
            this.bonus.active = false;
            Player.wallet += this.bonus.collected;
            HUD.showMessage('+' + 'Rs. ' + Utils.formatRupees(this.bonus.collected) + ' collected!', '#FFD700');

            // Move to next level
            setTimeout(() => {
                Game.nextLevel();
            }, 1500);
            return;
        }

        // Rain cash periodically
        this.bonus.cashRainTimer += dt / 60;
        if (this.bonus.cashRainTimer >= 0.3) {
            this.bonus.cashRainTimer = 0;
            this.spawnBonusCash();
        }

        // Move player left/right
        if (Input.isLeft()) {
            Player.x -= 200 * (dt / 60);
        }
        if (Input.isRight()) {
            Player.x += 200 * (dt / 60);
        }
        Player.x = Utils.clamp(Player.x, 0, 800 - Player.w);

        // Check collection
        const playerBox = Player.getHitbox();
        const coins = Obstacles.getActiveCoins();
        for (let i = 0; i < coins.length; i++) {
            const c = coins[i];
            if (!c.active) continue;
            if (Utils.checkAABB(playerBox, { x: c.x, y: c.y, w: c.w, h: c.h })) {
                const value = c.type === 'cash100' ? 100 : c.type === 'cash50' ? 50 : 10;
                this.bonus.collected += value;
                Particles.burst(c.x, c.y, 5, '#FFD700');
                Obstacles.recycleCoin(c);
            }
        }
    },

    spawnBonusCash() {
        const coin = Obstacles.getInactiveCoin();
        if (!coin) return;

        const types = ['cash10', 'cash50', 'cash100'];
        coin.type = types[Utils.randomInt(0, 2)];
        coin.w = 12;
        coin.h = 16;
        coin.x = Utils.random(50, 750);
        coin.y = -20;
        coin.velX = Utils.random(-30, 30);
        coin.velY = Utils.random(80, 150);
        coin.bobTimer = 0;
        coin.active = true;
    },

    renderBonusStage(ctx) {
        if (!this.bonus.active) return;

        // Timer display
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⏱ ' + Math.ceil(this.bonus.timer) + 's', 400, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('COLLECTED: Rs. ' + Utils.formatRupees(this.bonus.collected), 400, 80);
        ctx.restore();
    },

    // ===========================
    // TOLL PLAZA
    // ===========================
    showTollChoice() {
        this.toll.active = true;
        this.toll.choiceMade = false;
        Game.targetScrollSpeed = 0;

        // Show a simple choice overlay on canvas (handled in render)
    },

    updateToll(dt) {
        if (!this.toll.active || this.toll.choiceMade) return;

        // Check for pay option
        if (Input.isJumpJustPressed() || Input.isUp()) {
            if (Player.wallet >= 1000) {
                Player.wallet -= 1000;
                HUD.showMessage('-Rs. 1000 TOLL PAID', '#FFD700');
                Audio.play('collectCash');
                this.toll.active = false;
                this.toll.choiceMade = true;
                Game.targetScrollSpeed = Levels.currentLevelData.scrollSpeed;

                // Remove the toll barrier obstacle
                const active = Obstacles.getActive();
                for (let i = 0; i < active.length; i++) {
                    if (active[i].type === 'tollBarrier') {
                        active[i].active = false;
                    }
                }
            } else {
                HUD.showMessage('NOT ENOUGH MONEY! (Need Rs. 1000)', '#ff4444');
            }
        }

        // Check for jump-over option (if player is in air)
        if (Player.y < Player.groundY - 20 && Player.velX > 300) {
            // Player jumped over — successful!
            this.toll.active = false;
            this.toll.choiceMade = true;
            Game.targetScrollSpeed = Levels.currentLevelData.scrollSpeed;

            const active = Obstacles.getActive();
            for (let i = 0; i < active.length; i++) {
                if (active[i].type === 'tollBarrier') {
                    active[i].active = false;
                }
            }
            HUD.showMessage('JUMPED OVER! 💪', '#4CAF50');
        }
    },

    renderTollOverlay(ctx) {
        if (!this.toll.active || this.toll.choiceMade) return;

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 150, 800, 150);

        // Toll sign
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 TOLL PLAZA — JHELUM', 400, 185);

        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText('Press JUMP to pay Rs. 1,000', 400, 215);
        ctx.fillText('OR jump over the barrier at full speed!', 400, 235);

        ctx.fillStyle = '#aaa';
        ctx.font = '10px monospace';
        ctx.fillText('Your wallet: Rs. ' + Utils.formatRupees(Player.wallet), 400, 260);
    },

    // ===========================
    // MAIN RENDER (delegates to active modes)
    // ===========================
    renderOverlay(ctx) {
        if (this.loadShedding.active) {
            this.renderLoadSheddingOverlay(ctx);
        }
        if (this.chalaan.active) {
            this.renderChalaanWarden(ctx);
        }
        if (this.toll.active) {
            this.renderTollOverlay(ctx);
        }
        if (this.bonus.active) {
            this.renderBonusStage(ctx);
        }

        // HUD messages (canvas-based)
        HUD.renderMessages(ctx);
    },
};
