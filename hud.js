// ============================================================
// hud.js — Hearts, wallet, fuel gauge, mission progress, SMS
// ============================================================

const HUD = {
    visible: false,
    messages: [],
    MESSAGE_DURATION: 1.5,
    objectiveText: '',
    levelGoal: 3000,
    smsMessages: [],
    smsTimer: 0,
    currentSMS: null,
    heartElements: [],

    init() {
        const levelData = Levels.currentLevelData;
        if (levelData) {
            this.objectiveText = 'Survive ' + levelData.distance + 'm';
            this.levelGoal = levelData.distance;
        } else {
            this.objectiveText = 'Survive!';
            this.levelGoal = 3000;
        }
        // Create heart elements once
        const heartContainer = document.getElementById('heartsContainer');
        if (heartContainer && this.heartElements.length === 0) {
            heartContainer.innerHTML = '';
            const hasHeartImg = AssetLoader.has('hud_heart');
            for (let i = 0; i < 5; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                if (hasHeartImg) {
                    const img = document.createElement('img');
                    img.src = AssetLoader.get('hud_heart').src;
                    img.style.cssText = 'width:20px;height:20px;image-rendering:pixelated;';
                    heart.appendChild(img);
                } else {
                    heart.textContent = '❤️';
                }
                heartContainer.appendChild(heart);
                this.heartElements.push(heart);
            }
        }
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
        // Hearts — update cached elements
        if (this.heartElements.length > 0) {
            for (let i = 0; i < this.heartElements.length; i++) {
                const heart = this.heartElements[i];
                const full = i < Player.hearts;
                heart.className = 'heart' + (full ? '' : ' empty');
                const img = heart.querySelector('img');
                if (img) img.style.opacity = full ? '1' : '0.3';
                else heart.textContent = full ? '❤️' : '🖤';
            }
        }

        const fuelContainer = document.getElementById('fuelContainer');
        const fuelBarFill = document.getElementById('fuelBarFill');
        if (Player.mode === 'bike') {
            fuelContainer.classList.add('visible');
            fuelBarFill.style.width = (Player.fuel / Player.maxFuel * 100) + '%';
            if (Player.fuel > 50) fuelBarFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            else if (Player.fuel > 20) fuelBarFill.style.background = 'linear-gradient(90deg, #FFC107, #FF9800)';
            else fuelBarFill.style.background = 'linear-gradient(90deg, #F44336, #FF5722)';
            // Use fuel icon image if available
            const fuelLabel = document.getElementById('fuelLabel');
            if (fuelLabel && !fuelLabel.dataset.imgSet) {
                const fuelImg = AssetLoader.get('hud_fuel');
                if (fuelImg) {
                    fuelLabel.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = fuelImg.src;
                    img.style.cssText = 'width:14px;height:14px;image-rendering:pixelated;vertical-align:middle;margin-right:4px';
                    fuelLabel.appendChild(img);
                    fuelLabel.appendChild(document.createTextNode('FUEL'));
                    fuelLabel.dataset.imgSet = '1';
                }
            }
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
        // SMS timer
        this.smsTimer -= dt / 60;
        if (this.smsTimer <= 0 && this.currentSMS) {
            this.hideSMS();
        }
    },

    showMessage(text, color) {
        this.messages.push({ text: text, color: color || '#fff', timer: this.MESSAGE_DURATION });
    },

    showSMS(sender, message) {
        const smsEl = document.getElementById('smsNotification');
        if (!smsEl) return;
        smsEl.querySelector('.sender').textContent = sender;
        smsEl.querySelector('.message').textContent = message;
        smsEl.classList.add('show');
        this.currentSMS = { sender, message };
        this.smsTimer = 5;
    },

    hideSMS() {
        const smsEl = document.getElementById('smsNotification');
        if (smsEl) smsEl.classList.remove('show');
        this.currentSMS = null;
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

        // Canvas-rendered wallet (top-right)
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(690, 4, 100, 18);
        ctx.textAlign = 'right';
        ctx.fillStyle = Player.wallet > 0 ? '#FFD700' : '#ff4444';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('Rs. ' + Utils.formatRupees(Player.wallet), 786, 16);
        ctx.textAlign = 'left';
        ctx.restore();

        // Chapter name
        const chapterData = Game.chapterData[Game.currentChapter];
        if (chapterData) {
            ctx.textAlign = 'center';
            ctx.fillStyle = chapterData.color;
            ctx.font = '8px monospace';
            ctx.fillText('Ch' + (Game.currentChapter + 1) + ': ' + chapterData.name, 400, 46);
        }

        ctx.textAlign = 'left';
    },

    renderSMS(ctx) {
        // SMS is rendered via HTML overlay, not canvas
    },
};
