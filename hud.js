// ============================================================
// hud.js — Hearts, wallet display, fuel gauge
// ============================================================

const HUD = {
    canvas: null,
    visible: false,

    // Message display
    messages: [],
    MESSAGE_DURATION: 1.5,

    init(canvas) {
        this.canvas = canvas;
    },

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

        // Update hearts
        for (let i = 0; i < 5; i++) {
            const heartEl = document.getElementById('heart' + i);
            if (i < Player.hearts) {
                heartEl.classList.remove('empty');
            } else {
                heartEl.classList.add('empty');
            }
        }

        // Update wallet
        document.getElementById('walletAmount').textContent = Utils.formatRupees(Player.wallet);

        // Update fuel bar
        const fuelContainer = document.getElementById('fuelContainer');
        const fuelBarFill = document.getElementById('fuelBarFill');

        if (Player.mode === 'bike') {
            fuelContainer.classList.add('visible');
            fuelBarFill.style.width = Player.fuel + '%';

            // Color based on fuel level
            if (Player.fuel > 50) {
                fuelBarFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            } else if (Player.fuel > 20) {
                fuelBarFill.style.background = 'linear-gradient(90deg, #FFC107, #FF9800)';
            } else {
                fuelBarFill.style.background = 'linear-gradient(90deg, #F44336, #FF5722)';
            }
        } else {
            fuelContainer.classList.remove('visible');
        }

        // Update distance
        document.getElementById('distanceContainer').textContent = Math.floor(Game.distance) + ' m';

        // Update floating messages
        for (let i = this.messages.length - 1; i >= 0; i--) {
            this.messages[i].timer -= dt / 60;
            if (this.messages[i].timer <= 0) {
                this.messages.splice(i, 1);
            }
        }
    },

    showMessage(text, color) {
        this.messages.push({
            text: text,
            color: color || '#fff',
            timer: this.MESSAGE_DURATION,
            y: 0,
        });
    },

    renderMessages(ctx) {
        // Render floating messages on canvas (below HUD)
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
