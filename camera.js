// ============================================================
// camera.js — 4-layer parallax scrolling with real BG images
// CHANGE 3: 3-layer textured ground system
// CHANGE 4: Fix background rendering (seams, depth, scale)
// CHANGE 7: Near-layer fast-scrolling decorations
// ============================================================

const Camera = {
    canvas: null,
    layers: [
        { offset: 0, speed: 0.05 },
        { offset: 0, speed: 0.18 },
        { offset: 0, speed: 0.5 },
        { offset: 0, speed: 1.0 },
    ],

    // City-specific background configuration using image source rects
    bgConfig: {
        Lahore: {
            sky:      { key: 'bg_lahore_far',  srcY: 0,    srcH: 0.35, dstY: 0,   dstH: 160, alpha: 1.0,  speed: 0.05 },
            farBuild: { key: 'bg_lahore_far',  srcY: 0.25, srcH: 0.55, dstY: 110, dstH: 230, alpha: 0.9,  speed: 0.18 },
            nearBuild:{ key: 'bg_lahore_near', srcY: 0.3,  srcH: 0.6,  dstY: 250, dstH: 160, alpha: 1.0,  speed: 0.5  },
        },
        'GT Road': {
            sky:      { key: 'bg_gtroad_far',  srcY: 0,    srcH: 0.4,  dstY: 0,   dstH: 170, alpha: 1.0,  speed: 0.05 },
            farBuild: { key: 'bg_gtroad_far',  srcY: 0.3,  srcH: 0.5,  dstY: 130, dstH: 210, alpha: 0.85, speed: 0.2  },
            nearBuild:{ key: 'bg_gtroad_mid',  srcY: 0.2,  srcH: 0.7,  dstY: 260, dstH: 150, alpha: 1.0,  speed: 0.5  },
        },
        Islamabad: {
            sky:      { key: 'bg_isb_far',     srcY: 0,    srcH: 0.35, dstY: 0,   dstH: 155, alpha: 1.0,  speed: 0.05 },
            farBuild: { key: 'bg_isb_far',     srcY: 0.2,  srcH: 0.6,  dstY: 100, dstH: 240, alpha: 0.85, speed: 0.18 },
            nearBuild:{ key: 'bg_isb_mid',     srcY: 0.3,  srcH: 0.65, dstY: 255, dstH: 155, alpha: 1.0,  speed: 0.5  },
        },
        Murree:  { procedural: true },
        Naran:   { procedural: true },
    },

    // Fallback colors for sky gradients and ground when images are missing
    cityThemes: {
        Lahore:     { sky: '#FF8C42', skyGrad: '#FFB366', far: '#C4956A', mid: '#8B6914', near: '#5C4033', ground: '#8B7355', pavement: '#A0A0A0' },
        'GT Road':  { sky: '#87CEEB', skyGrad: '#B0E0E6', far: '#4CAF50', mid: '#388E3C', near: '#555555', ground: '#D2B48C', pavement: '#777777' },
        Islamabad:  { sky: '#5B86E5', skyGrad: '#7BA4F0', far: '#2F4F4F', mid: '#2E8B57', near: '#708090', ground: '#6B8E23', pavement: '#A9A9A9', hills: '#2E4E3E', hillPeak: '#1A3A2A' },
        Murree:     { sky: '#1A237E', skyGrad: '#283593', far: '#1B5E20', mid: '#2E7D32', near: '#4E342E', ground: '#3E2723', pavement: '#5D4037', snow: '#fff', pine: '#1B5E20' },
        Naran:      { sky: '#0D47A1', skyGrad: '#1565C0', far: '#1A237E', mid: '#283593', near: '#3E2723', ground: '#4E342E', pavement: '#5D4037', river: '#1565C0', mountain: '#37474F' },
    },

    init(canvas) { this.canvas = canvas; },

    reset() { this.layers.forEach(l => l.offset = 0); },

    update(dt, scrollSpeed) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].offset += scrollSpeed * this.layers[i].speed * (dt / 60);
            if (this.layers[i].offset > 1600) this.layers[i].offset -= 1600;
        }
    },

    // CHANGE 4: Seamless tiling with clipRect — stretches to 800px width
    drawTiledLayer(ctx, imgKey, layerOffset, srcY, srcH, dstY, dstH, alpha) {
        const img = AssetLoader.get(imgKey);
        if (!img) return false;
        ctx.save();
        ctx.globalAlpha = alpha || 1;
        ctx.beginPath();
        ctx.rect(0, dstY, 800, dstH);
        ctx.clip();
        const drawW = 800;
        const offset = layerOffset % drawW;
        ctx.drawImage(img, 0, srcY * img.height, img.width, srcH * img.height, -offset, dstY, drawW, dstH);
        ctx.drawImage(img, 0, srcY * img.height, img.width, srcH * img.height, drawW - offset, dstY, drawW, dstH);
        ctx.restore();
        return true;
    },

    // --------------------------------------------------------
    // Main render — sky, bg layers (image or procedural), ground, near decorations
    // --------------------------------------------------------
    render(ctx) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.cityThemes[city] || this.cityThemes.Lahore;
        const W = 800, H = 450;
        const bg = this.bgConfig[city] || {};

        // Sky gradient fallback
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 160);
        skyGrad.addColorStop(0, theme.sky);
        skyGrad.addColorStop(1, theme.skyGrad || theme.sky);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, 160);

        if (bg.procedural) {
            // Murree / Naran — fully procedural backgrounds
            const offsets = this.layers.map(l => l.offset);
            if (city === 'Murree') this.renderMurreeProcedural(ctx, offsets);
            else if (city === 'Naran') this.renderNaranProcedural(ctx, offsets);
        } else {
            // Image-based cities: sky, far buildings, near buildings
            if (bg.sky) {
                this.drawTiledLayer(ctx, bg.sky.key, this.layers[0].offset,
                    bg.sky.srcY, bg.sky.srcH, bg.sky.dstY, bg.sky.dstH, bg.sky.alpha);
            }
            if (bg.farBuild) {
                this.drawTiledLayer(ctx, bg.farBuild.key, this.layers[1].offset,
                    bg.farBuild.srcY, bg.farBuild.srcH, bg.farBuild.dstY, bg.farBuild.dstH, bg.farBuild.alpha);
            }
            if (bg.nearBuild) {
                this.drawTiledLayer(ctx, bg.nearBuild.key, this.layers[2].offset,
                    bg.nearBuild.srcY, bg.nearBuild.srcH, bg.nearBuild.dstY, bg.nearBuild.dstH, bg.nearBuild.alpha);
            }
        }

        this.renderGround(ctx, theme, W, H, city);
        this.renderNearDecorations(ctx, theme, city, this.layers[3].offset);
    },

    // --------------------------------------------------------
    // CHANGE 3: 3-layer ground system with per-city textures
    // --------------------------------------------------------
    renderGround(ctx, theme, W, H, city) {
        const levelData = Levels.currentLevelData;
        const isUphill = levelData && levelData.uphill;

        ctx.save();
        if (isUphill) {
            ctx.translate(0, H);
            ctx.rotate(-0.03);
            ctx.translate(0, -H);
        }

        // ---- Layer A: Pavement / Road Surface (y: 395-420) ----
        const pavementY = 395;
        const pavementH = 25;

        switch (city) {
            case 'Lahore':
                ctx.fillStyle = '#B8A898';
                ctx.fillRect(0, pavementY, W, pavementH);
                ctx.strokeStyle = '#A09080';
                ctx.lineWidth = 1;
                for (let x = 0; x < W; x += 60) {
                    ctx.beginPath();
                    ctx.moveTo(x, pavementY + 12);
                    ctx.lineTo(x + 40, pavementY + 12);
                    ctx.stroke();
                }
                ctx.fillStyle = '#888';
                for (let i = 0; i < 25; i++) {
                    const px = (i * 37 + 10) % W;
                    const py = pavementY + 4 + (i * 7) % 18;
                    ctx.beginPath();
                    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'GT Road':
                ctx.fillStyle = '#666666';
                ctx.fillRect(0, pavementY, W, pavementH);
                ctx.fillStyle = '#FFC107';
                ctx.fillRect(0, pavementY, W, 2);
                ctx.fillStyle = '#FFFFFF';
                for (let x = -40; x < W + 40; x += 80) {
                    ctx.fillRect(x, pavementY + 11, 30, 3);
                }
                break;

            case 'Islamabad':
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(0, pavementY, W, pavementH);
                ctx.strokeStyle = '#AAAAAA';
                ctx.lineWidth = 1;
                for (let x = 0; x < W; x += 40) {
                    ctx.beginPath();
                    ctx.moveTo(x, pavementY);
                    ctx.lineTo(x, pavementY + pavementH);
                    ctx.stroke();
                }
                break;

            case 'Murree':
                ctx.fillStyle = '#8B7355';
                ctx.fillRect(0, pavementY, W, pavementH);
                ctx.fillStyle = '#FFFFFF';
                for (let x = 50; x < W; x += 100) {
                    ctx.beginPath();
                    ctx.ellipse(x, pavementY + 8, 10, 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.strokeStyle = '#6B5540';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < 15; i++) {
                    const ax = (i * 53 + 20) % W;
                    const ay = pavementY + 5 + (i * 11) % 15;
                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(ax + 8, ay - 3);
                    ctx.stroke();
                }
                break;

            case 'Naran':
                ctx.fillStyle = '#6B5B45';
                ctx.fillRect(0, pavementY, W, pavementH);
                ctx.fillStyle = '#777';
                for (let x = 40; x < W; x += 80) {
                    ctx.beginPath();
                    ctx.ellipse(x, pavementY + 14, 7.5, 5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                const riverEdge = (Date.now() * 0.02) % 80;
                ctx.fillStyle = '#1565C0';
                ctx.globalAlpha = 0.35;
                ctx.fillRect(W - 10, pavementY, 10, pavementH);
                ctx.globalAlpha = 1;
                break;

            default:
                ctx.fillStyle = theme.pavement || '#A0A0A0';
                ctx.fillRect(0, pavementY, W, pavementH);
                break;
        }

        // ---- Layer B: Ground Edge shadow (y: 420-430) ----
        const edgeGrad = ctx.createLinearGradient(0, 420, 0, 430);
        edgeGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
        edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(0, 420, W, 10);

        // ---- Layer C: Below ground void (y: 430-450) ----
        switch (city) {
            case 'Lahore':    ctx.fillStyle = '#3B2A1A'; break;
            case 'GT Road':   ctx.fillStyle = '#4A4040'; break;
            case 'Islamabad': ctx.fillStyle = '#555555'; break;
            case 'Murree':    ctx.fillStyle = '#3E2E2E'; break;
            case 'Naran':     ctx.fillStyle = '#2E2010'; break;
            default:          ctx.fillStyle = '#3B2A1A'; break;
        }
        ctx.fillRect(0, 430, W, 20);

        ctx.restore();
    },

    // --------------------------------------------------------
    // CHANGE 7: Near-layer fast-scrolling decorations
    // --------------------------------------------------------
    renderNearDecorations(ctx, theme, city, layerOffset) {
        ctx.save();

        switch (city) {
            case 'Lahore': {
                // Lamp posts every 200px
                const postOffset = layerOffset % 200;
                for (let x = -200 + postOffset; x < 900; x += 200) {
                    ctx.fillStyle = '#444';
                    ctx.fillRect(x, 340, 5, 60);
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x - 8, 335, 20, 8);
                    ctx.save();
                    ctx.globalAlpha = 0.1;
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.ellipse(x, 340, 30, 20, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                // Hanging pennants
                const colours = ['#E53935', '#43A047', '#1E88E5', '#FFD600'];
                for (let x = -150 + postOffset; x < 850; x += 200) {
                    for (let b = 0; b < 5; b++) {
                        ctx.fillStyle = colours[b % colours.length];
                        ctx.beginPath();
                        ctx.moveTo(x + b * 20, 355);
                        ctx.lineTo(x + b * 20 + 8, 368);
                        ctx.lineTo(x + b * 20 + 16, 355);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
                break;
            }

            case 'GT Road': {
                // Roadside milestones
                const msOffset = layerOffset % 400;
                for (let x = -400 + msOffset; x < 900; x += 400) {
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(x, 350, 16, 50);
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x - 2, 350, 20, 22);
                    ctx.fillStyle = '#222';
                    ctx.font = '6px monospace';
                    ctx.fillText('ISB', x + 1, 360);
                    ctx.fillText('200km', x - 1, 368);
                }
                // Roadside bushes
                const bushOffset = layerOffset % 150;
                for (let x = -150 + bushOffset; x < 900; x += 150) {
                    ctx.fillStyle = '#2E7D32';
                    ctx.beginPath();
                    ctx.ellipse(x, 390, 18, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#388E3C';
                    ctx.beginPath();
                    ctx.ellipse(x + 8, 386, 12, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            }

            case 'Islamabad': {
                // Manicured hedges
                const hedgeOffset = layerOffset % 120;
                for (let x = -120 + hedgeOffset; x < 900; x += 120) {
                    ctx.fillStyle = '#2E7D32';
                    ctx.fillRect(x, 375, 80, 22);
                    ctx.fillStyle = '#1B5E20';
                    ctx.fillRect(x, 375, 80, 5);
                }
                // Clean lamp posts
                const lampOffset = layerOffset % 250;
                for (let x = -250 + lampOffset; x < 900; x += 250) {
                    ctx.fillStyle = '#9E9E9E';
                    ctx.fillRect(x, 330, 6, 70);
                    ctx.fillStyle = '#BDBDBD';
                    ctx.fillRect(x - 12, 326, 30, 6);
                    ctx.save();
                    ctx.fillStyle = 'rgba(200,230,255,0.25)';
                    ctx.beginPath();
                    ctx.ellipse(x + 3, 330, 25, 18, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                break;
            }
        }

        ctx.restore();
    },

    // --------------------------------------------------------
    // Procedural Murree background (no images — stars, mountains, pines, snow)
    // --------------------------------------------------------
    renderMurreeProcedural(ctx, layerOffsets) {
        // Sky: deep navy-indigo gradient
        const skyG = ctx.createLinearGradient(0, 0, 0, 180);
        skyG.addColorStop(0, '#0D1B3E');
        skyG.addColorStop(1, '#1A2F5A');
        ctx.fillStyle = skyG;
        ctx.fillRect(0, 0, 800, 180);

        // Stars: 60 small dots
        for (let i = 0; i < 60; i++) {
            const sx = (i * 127 + layerOffsets[0] * 0.5) % 800;
            const sy = (i * 53) % 160;
            const alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 + i);
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
            ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
        }

        // Far mountains: dark silhouette
        ctx.fillStyle = '#0A1628';
        ctx.beginPath();
        const mPoints = [0,280, 80,160, 150,220, 250,120, 320,200, 420,90, 500,180, 620,100, 720,200, 800,150, 800,280];
        for (let i = 0; i < mPoints.length; i += 2) {
            i === 0 ? ctx.moveTo(mPoints[i], mPoints[i + 1]) : ctx.lineTo(mPoints[i], mPoints[i + 1]);
        }
        ctx.closePath();
        ctx.fill();

        // Pine trees: dark green triangles at mid layer, scrolling
        ctx.fillStyle = '#0D2B0D';
        const treeOffset = (layerOffsets[1] * 0.4) % 120;
        for (let i = -120; i < 900; i += 80) {
            const tx = i - treeOffset;
            const th = 60 + (i % 30);
            ctx.beginPath();
            ctx.moveTo(tx, 360);
            ctx.lineTo(tx - 20, 360 - th);
            ctx.lineTo(tx + 20, 360 - th);
            ctx.closePath();
            ctx.fill();
            // Second layer of tree (lighter)
            ctx.fillStyle = '#1A4A1A';
            ctx.beginPath();
            ctx.moveTo(tx, 370);
            ctx.lineTo(tx - 15, 370 - th * 0.6);
            ctx.lineTo(tx + 15, 370 - th * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#0D2B0D';
        }

        // Snow: white horizontal streaks
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        const snowOffset = (layerOffsets[2] * 1.2) % 800;
        for (let i = 0; i < 30; i++) {
            const sx = (i * 150 + snowOffset) % 850 - 25;
            const sy = (i * 37) % 380;
            ctx.fillRect(sx, sy, 3 + (i % 4), 1);
        }
    },

    // --------------------------------------------------------
    // Procedural Naran background (snow-capped peaks, river)
    // --------------------------------------------------------
    renderNaranProcedural(ctx, layerOffsets) {
        // Sky: dawn blue
        const skyG = ctx.createLinearGradient(0, 0, 0, 200);
        skyG.addColorStop(0, '#0D47A1');
        skyG.addColorStop(0.6, '#1976D2');
        skyG.addColorStop(1, '#B3E5FC');
        ctx.fillStyle = skyG;
        ctx.fillRect(0, 0, 800, 200);

        // Snow-capped mountain peaks
        const peakData = [
            { x: 100, peakY: 60, baseY: 280, w: 200 },
            { x: 320, peakY: 20, baseY: 290, w: 280 },
            { x: 600, peakY: 50, baseY: 275, w: 240 },
        ];
        const mtOffset = (layerOffsets[0] * 0.1) % 800;
        for (const p of peakData) {
            const px = p.x - mtOffset;
            // Rock body
            ctx.fillStyle = '#37474F';
            ctx.beginPath();
            ctx.moveTo(px - p.w / 2, p.baseY);
            ctx.lineTo(px, p.peakY);
            ctx.lineTo(px + p.w / 2, p.baseY);
            ctx.closePath();
            ctx.fill();
            // Snow cap (top 30% of mountain)
            ctx.fillStyle = '#ECEFF1';
            const snowBase = p.peakY + (p.baseY - p.peakY) * 0.3;
            ctx.beginPath();
            ctx.moveTo(px - (p.w * 0.15), snowBase);
            ctx.lineTo(px, p.peakY);
            ctx.lineTo(px + (p.w * 0.15), snowBase);
            ctx.closePath();
            ctx.fill();
        }

        // River at bottom: animated blue strip
        const riverY = 400;
        const riverG = ctx.createLinearGradient(0, riverY, 0, 430);
        riverG.addColorStop(0, '#1565C0');
        riverG.addColorStop(1, '#0D47A1');
        ctx.fillStyle = riverG;
        ctx.fillRect(0, riverY, 800, 30);
        // River waves
        const waveOffset = (Date.now() * 0.03) % 80;
        ctx.fillStyle = 'rgba(100, 181, 246, 0.5)';
        for (let i = -80; i < 900; i += 80) {
            ctx.fillRect(i + waveOffset, riverY + 5, 40, 3);
            ctx.fillRect(i + waveOffset + 20, riverY + 15, 30, 2);
        }
    },
};
