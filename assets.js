// ============================================================
// assets.js — Asset loading pipeline with vector fallback
// ============================================================

const AssetLoader = {
    images: {},
    loaded: false,
    basePath: 'assets/',
    scale: 1,

    // Asset manifest: all expected sprites with their paths
    manifest: {
        // Player
        'player_run': 'sprites/player/run.png',
        'player_jump': 'sprites/player/jump.png',
        'player_slide': 'sprites/player/slide.png',
        'player_hit': 'sprites/player/hit.png',
        'bike_run': 'sprites/bike/run.png',
        'bike_jump': 'sprites/bike/jump.png',

        // Obstacles
        'dog': 'sprites/obstacles/dog.png',
        'dog_angry': 'sprites/obstacles/dog_angry.png',
        'rickshaw': 'sprites/obstacles/rickshaw.png',
        'rider': 'sprites/obstacles/rider.png',
        'bike_rider': 'sprites/obstacles/bike_rider.png',
        'speed_cam': 'sprites/obstacles/speed_camera.png',
        'cam_flash': 'sprites/obstacles/cam_flash.png',
        'toll_barrier': 'sprites/obstacles/toll_barrier.png',
        'chalaan_walker': 'sprites/obstacles/chalaan_walker.png',

        // Collectibles
        'coin_rupee': 'sprites/collectibles/coin_rupee.png',
        'coin_bills': 'sprites/collectibles/coin_bills.png',
        'coin_gold': 'sprites/collectibles/coin_gold.png',
        'key_bike': 'sprites/collectibles/key_bike.png',
        'petrol': 'sprites/collectibles/petrol.png',
        'paratha': 'sprites/collectibles/paratha.png',

        // Decorations
        'milestone': 'sprites/decorations/milestone.png',
        'milestone_isb': 'sprites/decorations/milestone_isb.png',
        'milk_shop': 'sprites/decorations/milk_shop.png',
        'cart': 'sprites/decorations/cart.png',
        'bakra': 'sprites/decorations/bakra.png',
        'tollbooth': 'sprites/decorations/tollbooth.png',
        'lightpoles': 'sprites/decorations/lightpoles.png',

        // Special mode
        'warden': 'sprites/special/warden.png',
        'warden_angry': 'sprites/special/warden_angry.png',
        'bribe_cash': 'sprites/special/bribe_cash.png',

        // Particles
        'spark': 'sprites/particles/spark.png',
        'rain': 'sprites/particles/rain.png',
        'dust': 'sprites/particles/dust.png',
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
