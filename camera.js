// ============================================================
// camera.js — 4-layer parallax scrolling background
// ============================================================

const Camera = {
    canvas: null,

    // Scroll offsets per layer
    layers: [
        { offset: 0, speed: 0.05, color: '', elements: [] },  // Layer 4 — far (sky + landmarks)
        { offset: 0, speed: 0.3, color: '', elements: [] },   // Layer 3 — mid (buildings)
        { offset: 0, speed: 0.6, color: '', elements: [] },   // Layer 2 — near (shops)
        { offset: 0, speed: 1.0, color: '', elements: [] },   // Layer 1 — ground
    ],

    // City-specific colors
    cityThemes: {
        Lahore: {
            sky: '#FF8C42',
            skyGrad: '#FFB366',
            far: '#C4956A',
            mid: '#8B6914',
            near: '#5C4033',
            ground: '#8B7355',
            pavement: '#A0A0A0',
        },
        'GT Road': {
            sky: '#87CEEB',
            skyGrad: '#B0E0E6',
            far: '#4CAF50',
            mid: '#388E3C',
            near: '#555555',
            ground: '#D2B48C',
            pavement: '#777777',
        },
        Islamabad: {
            sky: '#5B86E5',
            skyGrad: '#7BA4F0',
            far: '#2F4F4F',
            mid: '#2E8B57',
            near: '#708090',
            ground: '#6B8E23',
            pavement: '#A9A9A9',
        },
        Bonus: {
            sky: '#FFB6C1',
            skyGrad: '#FFC0CB',
            far: '#8B4513',
            mid: '#D2691E',
            near: '#DEB887',
            ground: '#F5DEB3',
            pavement: '#FAEBD7',
        },
    },

    init(canvas) {
        this.canvas = canvas;
        this.generateLayerElements();
    },

    generateLayerElements() {
        // Generate random background elements for each layer
        // These repeat as the camera scrolls (tile-based)

        this.layers[0].elements = []; // Far — landmarks
        this.layers[1].elements = []; // Mid — buildings
        this.layers[2].elements = []; // Near — shops/details
        this.layers[3].elements = []; // Ground — pavement details

        // Generate elements spanning ~1600px (2 screens worth, tiles)
        for (let i = 0; i < 20; i++) {
            // Far layer elements (landmarks, hills, etc.)
            this.layers[0].elements.push({
                x: i * 120,
                type: Utils.randomInt(0, 3),
                w: Utils.random(40, 80),
                h: Utils.random(30, 60),
            });

            // Mid layer (buildings, trees)
            this.layers[1].elements.push({
                x: i * 100,
                type: Utils.randomInt(0, 2),
                w: Utils.random(50, 90),
                h: Utils.random(40, 80),
            });

            // Near layer (shops, poles, signs)
            this.layers[2].elements.push({
                x: i * 80,
                type: Utils.randomInt(0, 3),
                w: Utils.random(30, 60),
                h: Utils.random(20, 50),
            });
        }
    },

    reset() {
        this.layers.forEach(l => l.offset = 0);
        this.generateLayerElements();
    },

    update(dt, scrollSpeed) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.cityThemes[city] || this.cityThemes.Lahore;

        // Update each layer's scroll offset
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            layer.offset += scrollSpeed * layer.speed * (dt / 60);

            // Wrap offset for infinite scrolling (using 1600px tile width)
            if (layer.offset > 1600) {
                layer.offset -= 1600;
            }
        }
    },

    render(ctx) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.cityThemes[city] || this.cityThemes.Lahore;
        const W = 800;
        const H = 450;

        // --- Layer 4: Sky Gradient ---
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        skyGrad.addColorStop(0, theme.sky);
        skyGrad.addColorStop(1, theme.skyGrad);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H * 0.5);

        // --- Far Layer (Layer 4) — Landmarks silhouette ---
        this.renderFarLayer(ctx, theme, W, H);

        // --- Mid Layer (Layer 3) — Buildings ---
        this.renderMidLayer(ctx, theme, W, H);

        // --- Near Layer (Layer 2) — Shops/Details ---
        this.renderNearLayer(ctx, theme, W, H);

        // --- Ground Layer (Layer 1) ---
        this.renderGround(ctx, theme, W, H);

        // --- Level-specific decorations ---
        Levels.renderDecorations(ctx);
    },

    renderFarLayer(ctx, theme, W, H) {
        const layer = this.layers[0];
        const baseY = H * 0.3;

        ctx.fillStyle = theme.far;
        ctx.globalAlpha = 0.6;

        // Draw distant landmarks
        for (let i = 0; i < layer.elements.length; i++) {
            const el = layer.elements[i];
            const x = el.x - layer.offset;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;

            if (drawX > -100 && drawX < W + 100) {
                // Silhouette shapes
                switch (el.type) {
                    case 0: // Mosque minaret
                        ctx.fillRect(drawX, baseY - el.h, 12, el.h);
                        ctx.fillRect(drawX - 6, baseY - el.h, 24, 8);
                        ctx.fillRect(drawX - 2, baseY - el.h - 8, 16, 10);
                        break;
                    case 1: // Hill/mountain
                        ctx.beginPath();
                        ctx.moveTo(drawX, baseY);
                        ctx.lineTo(drawX + el.w / 2, baseY - el.h);
                        ctx.lineTo(drawX + el.w, baseY);
                        ctx.fill();
                        break;
                    case 2: // Building block
                        ctx.fillRect(drawX, baseY - el.h, el.w, el.h);
                        break;
                    case 3: // Tree silhouette
                        ctx.fillRect(drawX + el.w / 2 - 3, baseY - el.h * 0.4, 6, el.h * 0.4);
                        ctx.beginPath();
                        ctx.arc(drawX + el.w / 2, baseY - el.h * 0.5, el.w / 2, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
            }
        }

        ctx.globalAlpha = 1;
    },

    renderMidLayer(ctx, theme, W, H) {
        const layer = this.layers[1];
        const baseY = H * 0.55;

        ctx.fillStyle = theme.mid;
        ctx.globalAlpha = 0.8;

        for (let i = 0; i < layer.elements.length; i++) {
            const el = layer.elements[i];
            const x = el.x - layer.offset;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;

            if (drawX > -100 && drawX < W + 100) {
                switch (el.type) {
                    case 0: // Building with windows
                        ctx.fillRect(drawX, baseY - el.h, el.w, el.h);
                        // Windows
                        ctx.fillStyle = '#FFFF88';
                        for (let wy = 0; wy < el.h - 10; wy += 16) {
                            for (let wx = 6; wx < el.w - 6; wx += 14) {
                                ctx.fillRect(drawX + wx, baseY - el.h + wy + 6, 6, 8);
                            }
                        }
                        ctx.fillStyle = theme.mid;
                        break;
                    case 1: // Tree
                        ctx.fillRect(drawX + el.w / 2 - 4, baseY - el.h * 0.3, 8, el.h * 0.3);
                        ctx.fillStyle = '#228B22';
                        ctx.beginPath();
                        ctx.arc(drawX + el.w / 2, baseY - el.h * 0.45, el.w / 2.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = theme.mid;
                        break;
                    case 2: // Power pole
                        ctx.fillRect(drawX + 4, baseY - el.h, 4, el.h);
                        ctx.fillRect(drawX - 10, baseY - el.h, 24, 3);
                        // Wires
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(drawX - 10, baseY - el.h + 1);
                        ctx.lineTo(drawX + 60, baseY - el.h + 3);
                        ctx.stroke();
                        break;
                }
            }
        }

        ctx.globalAlpha = 1;
    },

    renderNearLayer(ctx, theme, W, H) {
        const layer = this.layers[2];
        const baseY = H * 0.7;

        ctx.fillStyle = theme.near;
        ctx.globalAlpha = 0.9;

        for (let i = 0; i < layer.elements.length; i++) {
            const el = layer.elements[i];
            const x = el.x - layer.offset;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;

            if (drawX > -80 && drawX < W + 80) {
                switch (el.type) {
                    case 0: // Shop front
                        ctx.fillRect(drawX, baseY - el.h, el.w, el.h);
                        // Awning
                        ctx.fillStyle = '#CC0000';
                        ctx.fillRect(drawX - 4, baseY - el.h - 6, el.w + 8, 8);
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(drawX - 4, baseY - el.h + 2, el.w + 8, 3);
                        ctx.fillStyle = theme.near;
                        break;
                    case 1: // Street lamp
                        ctx.fillStyle = '#666';
                        ctx.fillRect(drawX + 2, baseY - 40, 4, 40);
                        ctx.fillStyle = '#FFFF88';
                        ctx.fillRect(drawX - 4, baseY - 44, 16, 6);
                        ctx.fillStyle = theme.near;
                        break;
                    case 2: // Signboard
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(drawX, baseY - el.h - 10, el.w, 14);
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(drawX + 2, baseY - el.h - 8, el.w - 4, 10);
                        break;
                    case 3: // Trash/debris
                        ctx.fillStyle = '#555';
                        ctx.fillRect(drawX, baseY - 4, el.w * 0.5, 4);
                        ctx.fillRect(drawX + el.w * 0.3, baseY - 6, el.w * 0.3, 6);
                        break;
                }
            }
        }

        ctx.globalAlpha = 1;
    },

    renderGround(ctx, theme, W, H) {
        const groundY = H - 80;

        // Main ground
        ctx.fillStyle = theme.ground;
        ctx.fillRect(0, groundY, W, 80);

        // Pavement line
        ctx.fillStyle = theme.pavement;
        ctx.fillRect(0, groundY, W, 4);

        // Pavement cracks/details
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let x = 0; x < W; x += 60) {
            ctx.fillRect(x, groundY + 2, 2, 38);
        }

        // Road markings (for GT Road and Islamabad)
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        if (city === 'GT Road' || city === 'Islamabad') {
            ctx.fillStyle = '#FFD700';
            for (let x = -50; x < W + 50; x += 80) {
                ctx.fillRect(x, groundY + 50, 40, 3);
            }
        }
    },
};
