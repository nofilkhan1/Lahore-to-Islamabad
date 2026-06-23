// ============================================================
// hud.js — Hearts, wallet display, fuel gauge
// ============================================================

const HUD = {
    visible: false,
    messages: [],
    MESSAGE_DURATION: 1.5,

    init() {},

    show() {
        this.visible = true;
        document.getElementById('hud').style.display = 'block';
    },

    hide() {
        this.visible = false;
        document.getElementById('hud').style.display = 'none';
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
            fuelBarFill.style.width = Player.fuel + '%';
            if (Player.fuel > 50) fuelBarFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            else if (Player.fuel > 20) fuelBarFill.style.background = 'linear-gradient(90deg, #FFC107, #FF9800)';
            else fuelBarFill.style.background = 'linear-gradient(90deg, #F44336, #FF5722)';
        } else {
            fuelContainer.classList.remove('visible');
        }
        document.getElementById('distanceContainer').textContent = Math.floor(Game.distance) + ' m';
        // Show chalaan timer if active
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
};
