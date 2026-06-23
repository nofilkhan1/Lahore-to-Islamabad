// ============================================================
// audio.js — Sound manager with .ogg → .mp3 → .wav fallback
// ============================================================

const Audio = {
    ctx: null,
    muted: false,
    initialized: false,
    buffers: {},
    currentlyPlaying: {},

    // Sound file definitions (name → { ogg, mp3 })
    sounds: {
        jump:             { ogg: 'assets/audio/jump.ogg', mp3: 'assets/audio/jump.mp3' },
        landing:          { ogg: 'assets/audio/landing.ogg', mp3: 'assets/audio/landing.mp3' },
        collectCash:      { ogg: 'assets/audio/collect_cash.ogg', mp3: 'assets/audio/collect_cash.mp3' },
        collectKey:       { ogg: 'assets/audio/collect_key.ogg', mp3: 'assets/audio/collect_key.mp3' },
        collectPetrol:    { ogg: 'assets/audio/collect_petrol.ogg', mp3: 'assets/audio/collect_petrol.mp3' },
        chaiPower:        { ogg: 'assets/audio/chai_power.ogg', mp3: 'assets/audio/chai_power.mp3' },
        collectParchi:    { ogg: 'assets/audio/collect_parchi.ogg', mp3: 'assets/audio/collect_parchi.mp3' },
        bikeStart:        { ogg: 'assets/audio/bike_start.ogg', mp3: 'assets/audio/bike_start.mp3' },
        bikeCrash:        { ogg: 'assets/audio/bike_crash.ogg', mp3: 'assets/audio/bike_crash.mp3' },
        heartLoss:        { ogg: 'assets/audio/heart_loss.ogg', mp3: 'assets/audio/heart_loss.mp3' },
        dogBark:          { ogg: 'assets/audio/dog_bark.ogg', mp3: 'assets/audio/dog_bark.mp3' },
        cameraFlash:      { ogg: 'assets/audio/camera_flash.ogg', mp3: 'assets/audio/camera_flash.mp3' },
        gameOver:         { ogg: 'assets/audio/game_over.ogg', mp3: 'assets/audio/game_over.mp3' },
        levelComplete:    { ogg: 'assets/audio/level_complete.ogg', mp3: 'assets/audio/level_complete.mp3' },
        wardenSiren:      { ogg: 'assets/audio/warden_siren.ogg', mp3: 'assets/audio/warden_siren.mp3' },
    },

    init() {
        // Create AudioContext (required to be created after user gesture on mobile)
        // We create it lazily on first play
    },

    ensureContext() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    },

    // Play a sound by name
    play(name) {
        if (this.muted) return;
        if (!this.sounds[name]) return;

        this.ensureContext();
        if (!this.ctx) return;

        // If already playing this sound, don't overlap (except for looping sounds)
        if (this.currentlyPlaying[name]) return;

        // Try to load and play
        this.loadAndPlay(name);
    },

    async loadAndPlay(name) {
        if (!this.ctx) return;

        const soundDef = this.sounds[name];

        // Try .ogg first, then .mp3
        let url = null;
        if (soundDef.ogg && this.canPlayOgg()) {
            url = soundDef.ogg;
        } else if (soundDef.mp3) {
            url = soundDef.mp3;
        }

        if (!url) return;

        try {
            const response = await fetch(url);
            if (!response.ok) return; // File not found — silently fail

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

            this.buffers[name] = audioBuffer;
            this.playBuffer(name, audioBuffer);
        } catch (e) {
            // Sound file doesn't exist yet — that's fine, game still works
            // console.log('Audio not available:', name);
        }
    },

    playBuffer(name, buffer) {
        if (!this.ctx || this.muted) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);

        this.currentlyPlaying[name] = source;

        source.onended = () => {
            delete this.currentlyPlaying[name];
        };

        source.start(0);
    },

    canPlayOgg() {
        const audio = document.createElement('audio');
        return audio.canPlayType('audio/ogg; codecs="vorbis"') !== '';
    },

    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            // Stop all currently playing sounds
            for (const name in this.currentlyPlaying) {
                try {
                    this.currentlyPlaying[name].stop();
                } catch (e) {}
            }
            this.currentlyPlaying = {};
        }
    },

    // Resume AudioContext after user interaction (required for mobile)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
};

// Resume audio on first user interaction
document.addEventListener('click', () => Audio.resume(), { once: true });
document.addEventListener('touchstart', () => Audio.resume(), { once: true });
