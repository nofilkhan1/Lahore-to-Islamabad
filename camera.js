// ============================================================
// camera.js — Fixed parallax system with pseudo-3D depth
// ============================================================

const Camera = {
    canvas: null,
    // 4 scroll offsets for 4 parallax layers (far=0 to near=3)
    offsets: [0, 0, 0, 0],
    // Parallax multipliers — far layers scroll slowest
    speeds: [0.04, 0.15, 0.45, 1.0],

    // City color themes (used as fallback when images missing)
    themes: {
        Lahore:    { sky1: '#2C1654', sky2: '#FF7043', sky3: '#FFAB40', ground: '#8B7355', pavement: '#A09080', paveDark: '#7A6E5E' },
        'GT Road': { sky1: '#1A237E', sky2: '#0288D1', sky3: '#B3E5FC', ground: '#5D4037', pavement: '#757575', paveDark: '#616161' },
        Islamabad: { sky1: '#0D47A1', sky2: '#1976D2', sky3: '#BBDEFB', ground: '#4CAF50', pavement: '#BDBDBD', paveDark: '#9E9E9E' },
        Murree:    { sky1: '#0A0E1A', sky2: '#0D1B3E', sky3: '#1A2F5A', ground: '#3E2723', pavement: '#5D4037', paveDark: '#4E342E' },
        Naran:     { sky1: '#050D1F', sky2: '#0D47A1', sky3: '#1976D2', ground: '#2E1B0E', pavement: '#4E342E', paveDark: '#3E2723' },
    },

    // Which images to use per city and per layer
    // Layer 0 = far/sky, Layer 1 = mid-far buildings, Layer 2 = near buildings/street
    cityImages: {
        Lahore:    { 0: 'bg_lahore_far',  1: 'bg_lahore_near', 2: null },
        'GT Road': { 0: 'bg_gtroad_far',  1: 'bg_gtroad_mid',  2: 'bg_gtroad_near' },
        Islamabad: { 0: 'bg_isb_far',     1: 'bg_isb_mid',     2: 'bg_isb_near' },
        Murree:    { 0: null, 1: null, 2: null },
        Naran:     { 0: null, 1: null, 2: null },
    },

    // Ground Y position — everything below this is ground
    GROUND_TOP: 390,
    CANVAS_W: 800,
    CANVAS_H: 450,

    init(canvas) {
        this.canvas = canvas;
    },

    reset() {
        this.offsets = [0, 0, 0, 0];
    },

    update(dt, scrollSpeed) {
        for (let i = 0; i < 4; i++) {
            this.offsets[i] += scrollSpeed * this.speeds[i] * (dt / 60);
            // Add screen shake displacement (near layers shake more)
            if (Utils.screenShake.duration > 0) {
                this.offsets[i] += Utils.screenShake.offsetX * (i + 1) * 0.003;
            }
            if (this.offsets[i] > 3200) this.offsets[i] -= 3200;
        }
    },

    render(ctx) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.themes[city] || this.themes.Lahore;
        const imgs = this.cityImages[city] || {};

        // LAYER 0: SKY — Fills top 55% of canvas (0 to 248px)
        this.renderSky(ctx, theme, city);

        // LAYER 1: FAR BUILDINGS / MOUNTAINS — Fills from 120px to 390px, scrolls at 0.15x
        const farKey = imgs[0];
        const farDrawn = farKey && this.drawLayer(ctx, farKey, this.offsets[0], 120, 270, 0.88);
        if (!farDrawn) {
            this.drawProceduralFar(ctx, theme, city, this.offsets[0]);
        }

        // LAYER 2: MID BUILDINGS — Fills from 250px to 390px, scrolls at 0.45x
        const midKey = imgs[1];
        const midDrawn = midKey && this.drawLayer(ctx, midKey, this.offsets[1], 250, 140, 1.0);
        if (!midDrawn && city !== 'Murree' && city !== 'Naran') {
            // Use far image again at different position as mid layer fallback
            if (farKey) this.drawLayer(ctx, farKey, this.offsets[1] * 1.2, 270, 120, 0.95);
        }

        // LAYER 3: NEAR STREET / SHOP FRONTS — Fills from 330px to 390px, scrolls at 1.0x
        const nearKey = imgs[2];
        if (nearKey) {
            this.drawLayer(ctx, nearKey, this.offsets[2], 330, 60, 1.0);
        }
        // Near-layer decorations always drawn (lamp posts, pennants, etc.)
        this.renderNearDecorations(ctx, theme, city, this.offsets[3]);

        // GROUND
        this.renderGround(ctx, theme, city);
    },

    // Draw one image layer with seamless tiling
    drawLayer(ctx, imgKey, scrollOffset, dstY, dstH, alpha) {
        const img = AssetLoader.get(imgKey);
        if (!img) return false;

        ctx.save();
        ctx.globalAlpha = alpha || 1;

        // Clip to only this layer's region — prevents overflow into other layers
        ctx.beginPath();
        ctx.rect(0, dstY, this.CANVAS_W, dstH);
        ctx.clip();

        // Scale image to fill the full canvas width
        const scaledW = this.CANVAS_W;
        const scaledH = dstH;

        // Tile offset — keep within [0, scaledW)
        const offset = scrollOffset % scaledW;

        // Draw twice: shifted left by offset, and shifted right by scaledW
        // This gives perfectly seamless looping with no visible seam
        ctx.drawImage(img, -offset, dstY, scaledW, scaledH);
        ctx.drawImage(img, scaledW - offset, dstY, scaledW, scaledH);

        ctx.restore();
        return true;
    },

    renderSky(ctx, theme, city) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 250);
        skyGrad.addColorStop(0.0, theme.sky1);
        skyGrad.addColorStop(0.5, theme.sky2);
        skyGrad.addColorStop(1.0, theme.sky3);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.CANVAS_W, 250);

        // City-specific sky elements
        if (city === 'Lahore') {
            // Dawn clouds
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#FFCCBC';
            for (let i = 0; i < 4; i++) {
                const cx = (i * 220 + this.offsets[0] * 0.3) % 860 - 30;
                ctx.beginPath();
                ctx.ellipse(cx, 60 + i * 20, 80 + i * 10, 18, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        if (city === 'Murree' || city === 'Naran') {
            // Stars
            for (let i = 0; i < 80; i++) {
                const sx = (i * 107 + this.offsets[0] * 0.02) % 800;
                const sy = (i * 53) % 200;
                const alpha = 0.4 + 0.5 * Math.sin(Date.now() * 0.001 + i);
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                ctx.fillRect(sx, sy, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
            }
        }
        if (city === 'GT Road') {
            // Hot sun haze at horizon
            ctx.save();
            ctx.globalAlpha = 0.15;
            const hazeGrad = ctx.createLinearGradient(0, 180, 0, 250);
            hazeGrad.addColorStop(0, 'rgba(255,214,0,0.3)');
            hazeGrad.addColorStop(1, 'rgba(255,214,0,0)');
            ctx.fillStyle = hazeGrad;
            ctx.fillRect(0, 180, 800, 70);
            ctx.restore();
        }
    },

    renderGround(ctx, theme, city) {
        const gTop = this.GROUND_TOP;       // 390
        const gH = this.CANVAS_H - gTop;   // 60

        // Pavement surface (top 20px of ground)
        ctx.fillStyle = theme.pavement;
        ctx.fillRect(0, gTop, this.CANVAS_W, 20);

        // City-specific ground texture
        const tileOffset = Math.floor(this.offsets[3]) % 60;

        if (city === 'Lahore') {
            // Terracotta tiles with cracks
            ctx.strokeStyle = theme.paveDark;
            ctx.lineWidth = 1;
            for (let x = -60 + tileOffset; x < this.CANVAS_W + 60; x += 60) {
                ctx.beginPath();
                ctx.moveTo(x, gTop);
                ctx.lineTo(x, gTop + 20);
                ctx.stroke();
            }
            // Horizontal grout line
            ctx.beginPath();
            ctx.moveTo(0, gTop + 10);
            ctx.lineTo(this.CANVAS_W, gTop + 10);
            ctx.stroke();
            // Small pebble dots
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < 12; i++) {
                const px = (i * 67 + tileOffset * 2) % this.CANVAS_W;
                ctx.beginPath();
                ctx.arc(px, gTop + 15, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (city === 'GT Road') {
            // Asphalt grey
            ctx.fillStyle = '#5A5A5A';
            ctx.fillRect(0, gTop, this.CANVAS_W, 20);
            // Center dashes (white road markings)
            ctx.fillStyle = '#EEEEEE';
            const dashOffset = tileOffset * 1.3;
            for (let x = -80 + dashOffset; x < this.CANVAS_W + 80; x += 80) {
                ctx.fillRect(x, gTop + 9, 40, 3);
            }
            // Left yellow edge line
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(0, gTop, this.CANVAS_W, 2);
        }

        if (city === 'Islamabad') {
            // Clean concrete tiles
            ctx.fillStyle = '#C8C8C8';
            ctx.fillRect(0, gTop, this.CANVAS_W, 20);
            ctx.strokeStyle = '#AAAAAA';
            ctx.lineWidth = 1;
            for (let x = -40 + tileOffset; x < this.CANVAS_W + 40; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, gTop); ctx.lineTo(x, gTop + 20);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(0, gTop + 10); ctx.lineTo(this.CANVAS_W, gTop + 10);
            ctx.stroke();
        }

        if (city === 'Murree') {
            // Rocky mountain path with snow
            ctx.fillStyle = '#6D4C41';
            ctx.fillRect(0, gTop, this.CANVAS_W, 20);
            // Snow patches
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            for (let i = 0; i < 8; i++) {
                const sx = (i * 110 + tileOffset * 2) % this.CANVAS_W;
                ctx.beginPath();
                ctx.ellipse(sx, gTop + 6, 20 + (i % 3) * 8, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (city === 'Naran') {
            // Rocky river-bank path
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(0, gTop, this.CANVAS_W, 20);
            ctx.fillStyle = '#795548';
            for (let i = 0; i < 6; i++) {
                const rx = (i * 130 + tileOffset * 1.5) % this.CANVAS_W;
                ctx.beginPath();
                ctx.ellipse(rx, gTop + 12, 16, 7, 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Shadow line at pavement top edge
        const shadowGrad = ctx.createLinearGradient(0, gTop - 10, 0, gTop);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, gTop - 10, this.CANVAS_W, 10);

        // Ground underside (below pavement)
        const underGrad = ctx.createLinearGradient(0, gTop + 20, 0, this.CANVAS_H);
        underGrad.addColorStop(0, theme.ground);
        underGrad.addColorStop(1, this.darken(theme.ground, 0.5));
        ctx.fillStyle = underGrad;
        ctx.fillRect(0, gTop + 20, this.CANVAS_W, gH - 20);
    },

    renderNearDecorations(ctx, theme, city, offset) {
        const tileOffset = offset % 200;

        if (city === 'Lahore') {
            // Lamp posts every 200px
            for (let x = -200 + tileOffset; x < this.CANVAS_W + 200; x += 200) {
                ctx.fillStyle = '#555';
                ctx.fillRect(x, 355, 5, 38);
                ctx.fillStyle = '#444';
                ctx.fillRect(x - 8, 351, 20, 6);
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.ellipse(x + 2, 355, 22, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            // Hanging pennant strings between every post
            const pennantOffset = offset % 200;
            const colours = ['#E53935', '#43A047', '#1E88E5', '#FFD600', '#AB47BC'];
            for (let x = -200 + pennantOffset; x < this.CANVAS_W + 200; x += 200) {
                ctx.strokeStyle = 'rgba(100,100,100,0.6)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(x + 2, 355);
                ctx.quadraticCurveTo(x + 100, 365, x + 202, 355);
                ctx.stroke();
                for (let p = 0; p < 6; p++) {
                    const px = x + p * 33 + 8;
                    const py = 358 + Math.sin(p * 0.8) * 5;
                    ctx.fillStyle = colours[p % colours.length];
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + 10, py);
                    ctx.lineTo(px + 5, py + 12);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        if (city === 'GT Road') {
            // Milestone posts every 300px
            const msOffset = offset % 300;
            for (let x = -300 + msOffset; x < this.CANVAS_W + 300; x += 300) {
                ctx.fillStyle = '#1B5E20';
                ctx.fillRect(x, 358, 14, 35);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x - 2, 358, 18, 20);
                ctx.fillStyle = '#1B5E20';
                ctx.font = '5px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('ISB', x + 7, 367);
                ctx.fillText('\u2191200', x + 7, 374);
                ctx.textAlign = 'left';
            }
            // Roadside scrub bushes
            const bushOffset = offset % 140;
            for (let x = -140 + bushOffset; x < this.CANVAS_W + 140; x += 140) {
                ctx.fillStyle = '#2E7D32';
                ctx.beginPath();
                ctx.ellipse(x, 388, 14 + (x % 8), 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#388E3C';
                ctx.beginPath();
                ctx.ellipse(x + 10, 384, 10, 6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (city === 'Islamabad') {
            // Manicured hedges
            const hedgeOffset = offset % 120;
            for (let x = -120 + hedgeOffset; x < this.CANVAS_W + 120; x += 120) {
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x, 375, 90, 18);
                ctx.fillStyle = '#388E3C';
                ctx.beginPath();
                ctx.ellipse(x + 45, 375, 46, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Clean modern lamp posts
            const lampOffset = offset % 240;
            for (let x = -240 + lampOffset; x < this.CANVAS_W + 240; x += 240) {
                ctx.fillStyle = '#9E9E9E';
                ctx.fillRect(x, 340, 5, 53);
                ctx.fillStyle = '#BDBDBD';
                ctx.fillRect(x - 10, 337, 25, 5);
                ctx.save();
                ctx.globalAlpha = 0.12;
                ctx.fillStyle = '#B3E5FC';
                ctx.beginPath();
                ctx.ellipse(x + 2, 340, 22, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        if (city === 'Murree') {
            // Pine trees along path
            const pineOffset = offset % 100;
            for (let x = -100 + pineOffset; x < this.CANVAS_W + 100; x += 100) {
                const th = 55 + (x % 20);
                ctx.fillStyle = '#1B5E20';
                ctx.beginPath();
                ctx.moveTo(x, 390); ctx.lineTo(x - 18, 390 - th); ctx.lineTo(x + 18, 390 - th);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#2E7D32';
                ctx.beginPath();
                ctx.moveTo(x, 390 - th * 0.3); ctx.lineTo(x - 14, 390 - th); ctx.lineTo(x + 14, 390 - th);
                ctx.closePath();
                ctx.fill();
            }
        }

        if (city === 'Naran') {
            // Large boulders
            const rockOffset = offset % 180;
            for (let x = -180 + rockOffset; x < this.CANVAS_W + 180; x += 180) {
                ctx.fillStyle = '#546E7A';
                ctx.beginPath();
                ctx.ellipse(x, 390, 22, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#607D8B';
                ctx.beginPath();
                ctx.ellipse(x - 5, 385, 14, 9, -0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    // Depth fog: drawn AFTER the player to create atmospheric depth
    renderDepthFog(ctx) {
        // Upper atmosphere darkening (sky blends into scene)
        const topFog = ctx.createLinearGradient(0, 0, 0, 140);
        topFog.addColorStop(0, 'rgba(0,0,0,0.22)');
        topFog.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topFog;
        ctx.fillRect(0, 0, this.CANVAS_W, 140);

        // Horizon haze (mid-screen where sky meets buildings)
        const horizonFog = ctx.createLinearGradient(0, 220, 0, 320);
        horizonFog.addColorStop(0, 'rgba(255,255,255,0)');
        horizonFog.addColorStop(0.5, 'rgba(200,200,180,0.06)');
        horizonFog.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = horizonFog;
        ctx.fillRect(0, 220, this.CANVAS_W, 100);

        // Bottom ground shadow (depth at feet)
        const bottomFog = ctx.createLinearGradient(0, 390, 0, 450);
        bottomFog.addColorStop(0, 'rgba(0,0,0,0)');
        bottomFog.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = bottomFog;
        ctx.fillRect(0, 390, this.CANVAS_W, 60);
    },

    // Procedural far-layer fallback for cities without images
    drawProceduralFar(ctx, theme, city, offset) {
        if (city === 'Murree') {
            // Dark mountain silhouettes
            ctx.fillStyle = '#0D1B3E';
            const pts = [0,390, 80,210, 160,280, 260,160, 360,240, 450,110, 550,200, 660,130, 760,210, 800,180, 800,390];
            ctx.beginPath();
            for (let i = 0; i < pts.length; i += 2) {
                i === 0 ? ctx.moveTo(pts[i] - offset * 0.15 % 800, pts[i + 1]) : ctx.lineTo(pts[i] - offset * 0.15 % 800, pts[i + 1]);
            }
            ctx.closePath();
            ctx.fill();

            // Snow caps on peaks
            const peaks = [[260, 160], [450, 110], [660, 130]];
            ctx.fillStyle = '#E8EAF6';
            for (const [px, py] of peaks) {
                const ax = px - offset * 0.15 % 800;
                ctx.beginPath();
                ctx.moveTo(ax - 30, py + 40);
                ctx.lineTo(ax, py);
                ctx.lineTo(ax + 30, py + 40);
                ctx.closePath();
                ctx.fill();
            }

            // Pine tree silhouettes at mid layer
            const pineOff = offset * 0.35;
            for (let x = -80 + (pineOff % 80); x < 860; x += 80) {
                const h = 60 + (x % 25);
                ctx.fillStyle = '#0A2A0A';
                ctx.beginPath();
                ctx.moveTo(x, 390);
                ctx.lineTo(x - 20, 390 - h);
                ctx.lineTo(x + 20, 390 - h);
                ctx.closePath();
                ctx.fill();
            }
        }

        if (city === 'Naran') {
            // Giant mountain peaks
            const peakData = [{ x: 100, y: 100, w: 220 }, { x: 380, y: 60, w: 300 }, { x: 660, y: 90, w: 260 }];
            const mOff = offset * 0.08;
            for (const p of peakData) {
                const px = p.x - mOff % this.CANVAS_W;
                ctx.fillStyle = '#1C2F3A';
                ctx.beginPath();
                ctx.moveTo(px - p.w / 2, 395);
                ctx.lineTo(px, p.y);
                ctx.lineTo(px + p.w / 2, 395);
                ctx.closePath();
                ctx.fill();
                // Snow cap
                ctx.fillStyle = '#ECEFF1';
                ctx.beginPath();
                ctx.moveTo(px - p.w * 0.12, p.y + (395 - p.y) * 0.28);
                ctx.lineTo(px, p.y);
                ctx.lineTo(px + p.w * 0.12, p.y + (395 - p.y) * 0.28);
                ctx.closePath();
                ctx.fill();
            }
        }
    },

    // Utility: darken a hex color by a factor (0=black, 1=same)
    darken(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
    },
};
