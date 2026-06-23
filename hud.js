// ============================================================
// hud.js — Hearts, wallet, fuel gauge, mission progress
// ============================================================

const HUD = {
    visible: false,
    messages: [],
    MESSAGE_DURATION: 1.5,
    objectiveText: '',
    levelGoal: 3000,

    init() {
        const objectives = [
            'Survive with Rs. 500', 'Find the bike key!', 'Survive the highway',
            'Pay the toll or jump!', 'Survive the capital', 'Climb to The Monal!',
        ];
        this.objectiveText = objectives[Game.currentLevel] || 'Survive!';
        this.levelGoal = (Levels.currentLevelData && Levels.currentLevelData.distance) || 3000;
    },

    show() {
        this.visible = true;
        document.getElementById('hud').style.display = 'block';
    },

    hide() {
        this.visible = false;
        document.getElementById('hud').style.display = 'none';
    },

    setObjective(text, goal) {
        this.objectiveText = text;
        if (goal) this.levelGoal = goal;
    },

    update(dt) {
        if (!this.visible) return;
        for (let i = 0; i < 5; i++) {
            const el = document.getElementById('heart' + i);
            if (i < Player.hearts) el.classList.remove('empty');
            else el.classList.add('empty');
        }
        document.getElementById('walletAmount').textContent = Utils.formatRupees(Player.wallet);
        const fuelContainer = document.getElementById('fuelContainer');
        const fuelBarFill = document.getElementById('fuelBarFill');
        if (Player.mode === 'bike') {
            fuelContainer.classList.add('visible');
            fuelBarFill.style.width = (Player.fuel / Player.maxFuel * 100) + '%';
            if (Player.fuel > 50) fuelBarFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            else if (Player.fuel > 20) fuelBarFill.style.background = 'linear-gradient(90deg, #FFC107, #FF9800)';
            else fuelBarFill.style.background = 'linear-gradient(90deg, #F44336, #FF5722)';
        } else {
            fuelContainer.classList.remove('visible');
        }
        document.getElementById('distanceContainer').textContent = Math.floor(Game.distance) + ' m';
        if (Modes.chalaan.active) {
            document.getElementById('distanceContainer').textContent =
                Math.floor(Game.distance) + ' m | CHALAAN: ' + Math.ceil(Modes.chalaan.timer) + 's';
        }
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].timer -= dt / 60;
            if (this.messages[i].timer <= 0) this.messages.splice(i, 1);
        }
    },

    showMessage(text, color) {
        this.messages.push({ text: text, color: color || '#fff', timer: this.MESSAGE_DURATION });
    },

    renderMessages(ctx) {
        for (let i = 0; i < this.messages.length; i++) {
            const msg = this.messages[i];
            const alpha = Math.min(1, msg.timer / 0.3);
            const yOffset = (1 - msg.timer / this.MESSAGE_DURATION) * 30;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = msg.color;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(msg.text, 400, 120 + i * 20 - yOffset);
            ctx.restore();
        }
    },

    renderProgress(ctx) {
        if (!this.visible) return;
        const progress = Math.min(1, Game.distance / this.levelGoal);
        const barX = 120;
        const barY = 14;
        const barW = 200;
        const barH = 8;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

        // Fill
        const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        grad.addColorStop(0, '#2196F3');
        grad.addColorStop(1, '#00E5FF');
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, barW * progress, barH);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(this.objectiveText, barX, barY + barH + 10);

        const remaining = Math.max(0, this.levelGoal - Math.floor(Game.distance));
        ctx.textAlign = 'right';
        ctx.fillStyle = remaining < 500 ? '#4CAF50' : '#ccc';
        ctx.fillText(remaining + 'm left', barX + barW, barY + barH + 10);

        // Meters remaining on right side
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 10px monospace';
        const walletColor = Player.wallet > 0 ? '#FFD700' : '#ff4444';
        ctx.fillStyle = walletColor;
        ctx.fillText('Rs.' + Utils.formatRupees(Player.wallet), 780, 46);

        ctx.textAlign = 'left';
    },
};
