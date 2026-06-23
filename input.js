// ============================================================
// input.js — Keyboard + Touch input mapping
// ============================================================

const Input = {
    keys: {},
    justPressedKeys: {},
    prevKeys: {},

    // Touch state
    touches: {},
    touchActive: false,
    touchHideTimer: 0,
    touchHidden: false,

    // Touch button references
    btnLeft: false,
    btnRight: false,
    btnUp: false,
    btnDown: false,
    btnJump: false,

    canvas: null,

    init(canvas) {
        this.canvas = canvas;

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });

        // Touch events on canvas
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

        // Touch button events (mobile UI buttons)
        this.setupTouchButton('btnLeft', 'btnLeft');
        this.setupTouchButton('btnRight', 'btnRight');
        this.setupTouchButton('btnDown', 'btnDown');
        this.setupTouchButton('btnJump', 'btnJump');

        // Show touch controls on touch devices
        if ('ontouchstart' in window) {
            document.getElementById('touchControls').classList.remove('hidden');
        }
    },

    setupTouchButton(elementId, stateKey) {
        const el = document.getElementById(elementId);
        if (!el) return;

        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this[stateKey] = true;
            this.showTouchControls();
        }, { passive: false });

        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this[stateKey] = false;
        }, { passive: false });

        el.addEventListener('touchcancel', (e) => {
            this[stateKey] = false;
        });
    },

    handleTouchStart(e) {
        e.preventDefault();
        this.touchActive = true;
        this.showTouchControls();

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const relX = x / rect.width;

            // Right half = jump
            if (relX > 0.5) {
                this.btnJump = true;
            }
            // Left half = directional (determined by position)
            else {
                const relY = (touch.clientY - rect.top) / rect.height;
                if (relY < 0.4) this.btnUp = true;
                else if (relY > 0.7) this.btnDown = true;
                else this.btnLeft = true; // default left area = left
            }
        }
    },

    handleTouchMove(e) {
        e.preventDefault();
    },

    handleTouchEnd(e) {
        e.preventDefault();
        if (e.touches.length === 0) {
            this.touchActive = false;
            this.btnLeft = false;
            this.btnRight = false;
            this.btnUp = false;
            this.btnDown = false;
            this.btnJump = false;
        }
    },

    showTouchControls() {
        const controls = document.getElementById('touchControls');
        controls.classList.remove('hidden');
        this.touchHideTimer = 2;
        this.touchHidden = false;
    },

    hideTouchControls() {
        const controls = document.getElementById('touchControls');
        controls.classList.add('hidden');
        this.touchHidden = true;
    },

    update() {
        // Calculate just pressed (single frame detection)
        for (const key in this.keys) {
            this.justPressedKeys[key] = this.keys[key] && !this.prevKeys[key];
        }
        // Also check touch buttons as "just pressed"
        // (simplified: touch buttons are treated as held, not just-pressed)

        // Save previous state
        this.prevKeys = { ...this.keys };

        // Auto-hide touch controls after inactivity
        if (!this.touchActive && !this.touchHidden) {
            this.touchHideTimer -= 1 / 60;
            if (this.touchHideTimer <= 0) {
                this.hideTouchControls();
            }
        }
    },

    // --- Query Methods ---
    isLeft() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.btnLeft;
    },

    isRight() {
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.btnRight;
    },

    isUp() {
        return this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space'] || this.btnUp || this.btnJump;
    },

    isDown() {
        return this.keys['ArrowDown'] || this.keys['KeyS'] || this.btnDown;
    },

    isDismount() {
        return this.justPressedKeys['KeyE'];
    },

    isJump() {
        return this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space'] || this.btnJump;
    },

    isJumpJustPressed() {
        return this.justPressedKeys['ArrowUp'] || this.justPressedKeys['KeyW'] || this.justPressedKeys['Space'] || this.btnJump;
    },

    isPause() {
        return this.justPressedKeys['KeyP'] || this.justPressedKeys['Escape'];
    },

    isMute() {
        return this.justPressedKeys['KeyM'];
    },
};
