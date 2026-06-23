// ============================================================
// modes.js — Load shedding, chalaan escape, bonus stage modes
// ============================================================

const Modes = {
    loadShedding: { active: false, torchAngle: 0 },
    chalaan: { active: false, wardenX: -60, wardenY: 370, timer: 45, stunned: false, stunTimer: 0, caught: false },
    bonus: { active: false, timer: 15, cashRainTimer: 0, collected: 0 },
    toll: { active: false, choiceMade: false },
    garage: {
        active: false,
        upgrades: [
            { id: 'tank', name: 'Bigger Fuel Tank', desc: '+50 fuel capacity', cost: 400, max: 3, owned: 0, effect: '+50 fuel' },
            { id: 'shield', name: 'Bike Shield', desc: 'Survive 1 extra crash', cost: 600, max: 2, owned: 0, effect: '+1 crash' },
            { id: 'speed', name: 'Speed Boost', desc: '+10% top speed', cost: 500, max: 3, owned: 0, effect: '+10% speed' },
            { id: 'mtag', name: 'M-Tag Pass', desc: 'Skip toll plaza fees', cost: 800, max: 1, owned: 0, effect: 'Free toll' },
        ],
        selectedIndex: 0,
    },

    init() { this.reset(); },

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
        if (this.chalaan.active) this.updateChalaan(dt);
        if (this.bonus.active) this.updateBonusStage(dt);
        if (this.loadShedding.active) this.loadShedding.torchAngle += dt * 0.1;
        if (this.toll.active && !this.toll.choiceMade) this.updateToll(dt);
    },

    // === LOAD SHEDDING ===
    activateLoadShedding() { this.loadShedding.active = true; },
    deactivateLoadShedding() { this.loadShedding.active = false; },

    // === CHALAAN ===
    activateChalaan() {
        this.chalaan.active = true;
        this.chalaan.wardenX = -60;
        this.chalaan.timer = 45;
        this.chalaan.stunned = false;
        this.chalaan.caught = false;
        Audio.play('wardenSiren');
    },

    updateChalaan(dt) {
        if (this.chalaan.caught) return;
        this.chalaan.timer -= dt / 60;
        if (this.chalaan.timer <= 0) {
            Player.wallet += 1000;
            HUD.showMessage('Rs. 1000 BONUS!', '#4CAF50');
            this.chalaan.active = false;
            return;
        }
        if (this.chalaan.stunned) {
            this.chalaan.stunTimer -= dt / 60;
            if (this.chalaan.stunTimer <= 0) this.chalaan.stunned = false;
            return;
        }
        const wardenSpeed = (Player.velX > 0 ? Player.velX : Game.scrollSpeed) * 1.1;
        this.chalaan.wardenX += (wardenSpeed - Game.scrollSpeed) * (dt / 60);
        if (this.chalaan.wardenX >= Player.x - 40) {
            this.chalaan.caught = true;
            this.chalaan.stunned = true;
            this.chalaan.stunTimer = 0.5;
            Player.wallet = Math.max(0, Player.wallet - 500);
            HUD.showMessage('Rs. 500 FINE!', '#ff4444');
            Utils.triggerScreenShake(4, 0.3);
            this.chalaan.wardenX = -60;
            this.chalaan.timer = 45;
            this.chalaan.caught = false;
        }
    },

    renderChalaanWarden(ctx) {
        if (!this.chalaan.active) return;
        const x = Math.round(this.chalaan.wardenX);
        const y = this.chalaan.wardenY;

        // Try image first
        const wardenKey = this.chalaan.stunned ? 'warden_angry' : 'warden';
        if (AssetLoader.draw(ctx, wardenKey, x - 4, y - 20, 60, 70)) {
            return;
        }

        ctx.fillStyle = '#1A237E';
        ctx.fillRect(x + 8, y + 12, 32, 4);
        ctx.fillStyle = '#0D47A1';
        ctx.fillRect(x + 12, y + 6, 24, 10);
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 2, y + 24, 10, 10);
        ctx.fillRect(x + 36, y + 24, 10, 10);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(x + 14, y - 8, 16, 16);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 16, y - 14, 12, 8);
        const flash = Math.floor(Date.now() / 200) % 2;
        ctx.fillStyle = flash ? '#FF0000' : '#2196F3';
        ctx.fillRect(x + 10, y - 4, 4, 4);
        ctx.fillStyle = flash ? '#2196F3' : '#FF0000';
        ctx.fillRect(x + 30, y - 4, 4, 4);
    },

    // === BONUS STAGE ===
    startBonusStage() {
        this.bonus.active = true;
        this.bonus.timer = 15;
        this.bonus.collected = 0;
        this.bonus.cashRainTimer = 0;
        Game.scrollSpeed = 0;
        Game.targetScrollSpeed = 0;
    },

    updateBonusStage(dt) {
        this.bonus.timer -= dt / 60;
        if (this.bonus.timer <= 0) {
            this.bonus.active = false;
            Player.wallet += this.bonus.collected;
            HUD.showMessage('+' + Utils.formatRupees(this.bonus.collected) + ' collected!', '#FFD700');
            setTimeout(() => Game.nextLevel(), 1500);
            return;
        }
        this.bonus.cashRainTimer += dt / 60;
        if (this.bonus.cashRainTimer >= 0.3) {
            this.bonus.cashRainTimer = 0;
            this.spawnBonusCash();
        }
        if (Input.isLeft()) Player.x -= 200 * (dt / 60);
        if (Input.isRight()) Player.x += 200 * (dt / 60);
        Player.x = Utils.clamp(Player.x, 0, 800 - Player.w);

        const playerBox = Player.getHitbox();
        const coins = Obstacles.getActiveCoins();
        for (let i = 0; i < coins.length; i++) {
            const c = coins[i];
            if (!c.active) continue;
            // Move bonus coins with velocity (diagonal rain)
            if (c.velX !== undefined) c.x += c.velX * (dt / 60);
            if (c.velY !== undefined) c.y += c.velY * (dt / 60);
            else c.y += 100 * (dt / 60); // fallback speed
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
        const types = ['cash10', 'cash100', 'cash500'];
        coin.type = types[Utils.randomInt(0, 2)];
        coin.w = 12; coin.h = 16;
        coin.x = Utils.random(50, 750);
        coin.y = -20;
        coin.bobTimer = 0;
        coin.active = true;
        // Diagonal rain - add horizontal velocity
        coin.velX = Utils.random(-30, 30);
        coin.velY = Utils.random(80, 120);
    },

    renderBonusStage(ctx) {
        if (!this.bonus.active) return;
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(this.bonus.timer) + 's left', 400, 50);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('COLLECTED: Rs. ' + Utils.formatRupees(this.bonus.collected), 400, 80);
        ctx.restore();
    },

    // === TOLL PLAZA ===
    showTollChoice() {
        this.toll.active = true;
        this.toll.choiceMade = false;
    },

    updateToll(dt) {
        if (!this.toll.active || this.toll.choiceMade) return;
        if (Input.isJumpJustPressed() || Input.isUp()) {
            if (Player.mtagPass) {
                HUD.showMessage('M-TAG: FREE PASS!', '#00FF00');
                Audio.play('collectCash');
                this.toll.active = false;
                this.toll.choiceMade = true;
                Game.targetScrollSpeed = Levels.currentLevelData ? Levels.currentLevelData.scrollSpeed : 200;
                Game.scrollSpeed = Game.targetScrollSpeed;
                Obstacles.getActive().forEach(o => { if (o.type === 'tollBarrier') o.active = false; });
            } else if (Player.wallet >= 1000) {
                Player.wallet -= 1000;
                HUD.showMessage('-Rs. 1000 TOLL PAID', '#FFD700');
                Audio.play('collectCash');
                this.toll.active = false;
                this.toll.choiceMade = true;
                Game.targetScrollSpeed = Levels.currentLevelData ? Levels.currentLevelData.scrollSpeed : 200;
                Game.scrollSpeed = Game.targetScrollSpeed;
                Obstacles.getActive().forEach(o => { if (o.type === 'tollBarrier') o.active = false; });
            } else {
                HUD.showMessage('NEED Rs. 1000!', '#ff4444');
            }
        }
        if (Player.y < Player.groundY - 20 && Player.velX > 450) {
            this.toll.active = false;
            this.toll.choiceMade = true;
            Game.targetScrollSpeed = Levels.currentLevelData ? Levels.currentLevelData.scrollSpeed : 200;
            Game.scrollSpeed = Game.targetScrollSpeed;
            Obstacles.getActive().forEach(o => { if (o.type === 'tollBarrier') o.active = false; });
            HUD.showMessage('JUMPED OVER!', '#4CAF50');
        }
    },

    renderTollOverlay(ctx) {
        if (!this.toll.active || this.toll.choiceMade) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 150, 800, 150);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TOLL PLAZA', 400, 185);
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText('Press JUMP to pay Rs. 1,000', 400, 215);
        ctx.fillText('OR jump over the barrier at full speed!', 400, 235);
        ctx.fillStyle = '#aaa';
        ctx.font = '10px monospace';
        ctx.fillText('Your wallet: Rs. ' + Utils.formatRupees(Player.wallet), 400, 260);
    },

    renderOverlay(ctx) {
        if (this.loadShedding.active) {
            const W = 800, H = 450;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.90)';
            ctx.fillRect(0, 0, W, H);
            const px = Player.x + Player.w / 2;
            const py = Player.y + Player.h / 2;
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, Player.mode === 'bike' ? 180 : 120);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(px, py);
            if (Player.mode === 'bike') {
                ctx.lineTo(px + 200, py - 60);
                ctx.lineTo(px + 200, py + 60);
            } else {
                const flicker = Math.sin(this.loadShedding.torchAngle * 5) * 10;
                ctx.lineTo(px + 140 + flicker, py - 80);
                ctx.lineTo(px + 140 + flicker, py + 80);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        if (this.chalaan.active) this.renderChalaanWarden(ctx);
        if (this.toll.active) this.renderTollOverlay(ctx);
        if (this.bonus.active) this.renderBonusStage(ctx);
    },

    // === TRUCK ART GARAGE ===
    openGarage() {
        this.garage.active = true;
        this.garage.selectedIndex = 0;
        // Reset owned counts from saved upgrades
        const saved = Player.upgrades || {};
        this.garage.upgrades.forEach(u => {
            u.owned = saved[u.id] || 0;
        });
        this.renderGarageUI();
        Game.showScreen('garageScreen');
    },

    closeGarage() {
        this.garage.active = false;
        // Save upgrades to player
        if (!Player.upgrades) Player.upgrades = {};
        this.garage.upgrades.forEach(u => {
            Player.upgrades[u.id] = u.owned;
        });
        Game.showScreen('none');
        Game.continueAfterLevel();
    },

    renderGarageUI() {
        const container = document.getElementById('garageUpgrades');
        if (!container) return;
        container.innerHTML = '';
        this.garage.upgrades.forEach((u, i) => {
            const div = document.createElement('div');
            div.style.cssText = 'margin:8px 0; padding:10px; background:#333; border-radius:8px; cursor:pointer; border:2px solid ' + (i === this.garage.selectedIndex ? '#FF6F00' : '#555') + ';';
            const affordable = Player.wallet >= u.cost && u.owned < u.max;
            div.innerHTML = '<div style="color:' + (affordable ? '#fff' : '#888') + '; font-size:14px;">' +
                u.name + ' <span style="color:#FFD700;">Rs.' + u.cost + '</span></div>' +
                '<div style="color:#aaa; font-size:11px;">' + u.desc + ' | Owned: ' + u.owned + '/' + u.max + '</div>';
            div.onclick = () => this.buyUpgrade(i);
            container.appendChild(div);
        });
        const walletEl = document.getElementById('garageWallet');
        if (walletEl) walletEl.textContent = 'Wallet: Rs. ' + Player.wallet;
    },

    buyUpgrade(index) {
        const u = this.garage.upgrades[index];
        if (!u || Player.wallet < u.cost || u.owned >= u.max) return;
        Player.wallet -= u.cost;
        u.owned++;
        // Apply upgrade immediately
        if (u.id === 'tank') Player.maxFuel = 100 + u.owned * 50;
        if (u.id === 'speed') Player.speedMultiplier = 1 + u.owned * 0.1;
        if (u.id === 'shield') Player.shieldCount = u.owned;
        if (u.id === 'mtag') Player.mtagPass = u.owned > 0;
        Audio.play('collectCash');
        this.renderGarageUI();
    },
};
