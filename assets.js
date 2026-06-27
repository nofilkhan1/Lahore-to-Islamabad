// ============================================================
// assets.js — Asset loading pipeline with vector fallback
// ============================================================

const AssetLoader = {
    images: {},
    loaded: false,
    basePath: 'assets/',
    scale: 1,

    manifest: {
        // Player (foot mode)
        'player_idle': 'sprites/player/foot_idle.png',
        'player_run': 'sprites/player/foot_run_01.png',
        'player_run2': 'sprites/player/foot_run_02.png',
        'player_run_speed': 'sprites/player/foot_run_speed.png',
        'player_jump': 'sprites/player/foot_jump.png',
        'player_flight': 'sprites/player/foot_flight.png',
        'player_duck': 'sprites/player/foot_duck.png',
        'player_hurt': 'sprites/player/foot_hurt.png',

        // Bike
        'bike_idle': 'sprites/bike/bike_idle.png',
        'bike_run': 'sprites/bike/bike_run_01.png',
        'bike_run2': 'sprites/bike/bike_run_02.png',
        'bike_jump': 'sprites/bike/bike_jump.png',
        'bike_destroyed': 'sprites/bike/bike_destroyed.png',

        // Obstacles
        'dog_sit': 'sprites/obstacles/dog_sit.png',
        'dog_run1': 'sprites/obstacles/dog_run_01.png',
        'dog_run2': 'sprites/obstacles/dog_run_02.png',
        'rickshaw': 'sprites/obstacles/rickshaw_01.png',
        'truck': 'sprites/obstacles/truck.png',
        'careless_biker': 'sprites/obstacles/careless_biker.png',
        'gutter': 'sprites/obstacles/gutter.png',
        'wires_pole': 'sprites/obstacles/wires_pole.png',

        // Collectibles
        'rupee_note': 'sprites/collectibles/rupee_note.png',
        'key': 'sprites/collectibles/key.png',
        'petrol_bottle': 'sprites/collectibles/petrol_bottle.png',

        // Decorations
        'milk_shop': 'sprites/decorations/milk_shop.png',
        'chai_dhaba': 'sprites/decorations/chai_ka_dhaba.png',
        'sign_board': 'sprites/decorations/sign_board.png',
        'toll_plaza1': 'sprites/decorations/toll_plaza_01.png',
        'toll_plaza2': 'sprites/decorations/toll_plaza_02.png',

        // Backgrounds — Lahore
        'bg_lahore_far': 'bg/lahore_layer 1.png',
        'bg_lahore_near': 'bg/lahore_layer 2.png',

        // Backgrounds — GT Road
        'bg_gtroad_far': 'bg/GT_road layer 1.png',
        'bg_gtroad_mid': 'sprites/special/GT_road layer 2.png',
        'bg_gtroad_near': 'sprites/special/GT_road layer 3.png',

        // Backgrounds — Islamabad
        'bg_isb_far': 'bg/islamabad_layer 1.png',
        'bg_isb_mid': 'sprites/special/islamabad_layer 2.png',
        'bg_isb_near': 'sprites/special/islamabad_layer 3.png',
        'bg_margalla': 'bg/margala_hills.png',
        'bg_faisal_mosque': 'bg/faisal_mosque.png',
        'bg_sky_scrapper': 'bg/sky_scrapper.png',

        // HUD
        'hud_heart': 'hud/heart icon.png',
        'hud_fuel': 'hud/fuel icon.png',

        // Special
        'rain_drop': 'sprites/special/rain drop.png',
    },

    // Initialize: load all assets, call onComplete when done
    async init(onComplete) {
        const keys = Object.keys(this.manifest);
        let loadedCount = 0;
        let failedCount = 0;

        const tryFinish = () => {
            loadedCount++;
            if (loadedCount + failedCount >= keys.length) {
                this.loaded = true;
                console.log(`[AssetLoader] ${loadedCount - failedCount}/${keys.length} assets loaded`);
                if (onComplete) onComplete();
            }
        };

        for (const key of keys) {
            this.loadImage(key, this.manifest[key], tryFinish, () => {
                failedCount++;
                tryFinish();
            });
        }
    },

    loadImage(key, path, onSuccess, onError) {
        const img = new Image();
        img.src = this.basePath + path;
        img.onload = () => {
            this.images[key] = img;
            onSuccess();
        };
        img.onerror = () => {
            // Silent fail — vector fallback will be used
            if (onError) onError();
        };
    },

    // Get a loaded image, returns null if not loaded
    get(key) {
        return this.images[key] || null;
    },

    // Draw image if available, returns true if image was drawn
    draw(ctx, key, x, y, w, h, flipX = false) {
        const img = this.images[key];
        if (!img) return false;

        ctx.save();
        if (flipX) {
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.drawImage(img, x, y, w, h);
        }
        ctx.restore();
        return true;
    },

    // Draw image with source rect (for sprite sheets)
    drawFrame(ctx, key, sx, sy, sw, sh, dx, dy, dw, dh) {
        const img = this.images[key];
        if (!img) return false;
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        return true;
    },

    // Draw centered
    drawCenter(ctx, key, cx, cy, w, h) {
        return this.draw(ctx, key, cx - w / 2, cy - h / 2, w, h);
    },

    // Check if image exists (for fallback decisions)
    has(key) {
        return !!this.images[key];
    },

    // Preload a subset of assets (for specific screens)
    preload(keys, callback) {
        let remaining = keys.length;
        if (remaining === 0) { callback(); return; }

        keys.forEach(key => {
            if (this.has(key)) {
                remaining--;
                if (remaining === 0) callback();
            } else {
                const path = this.manifest[key];
                if (!path) {
                    remaining--;
                    if (remaining === 0) callback();
                    return;
                }
                this.loadImage(key, path,
                    () => { if (--remaining === 0) callback(); },
                    () => { if (--remaining === 0) callback(); }
                );
            }
        });
    },
};
