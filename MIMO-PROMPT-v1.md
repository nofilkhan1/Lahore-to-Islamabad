# PROMPT FOR MIMO v2.5
## Pakistani 2D platformer — Fix broken graphics + Add pseudo-3D depth system

---

## CONTEXT

This is a Pakistani 2D side-scrolling platformer "Lahore to Islamabad" built in vanilla JavaScript and HTML5 Canvas (800×450px internal resolution). The game has real PNG background images for Lahore, GT Road, and Islamabad. Currently the rendering is broken — buildings cover the player, sky has seams, and the ground is a flat grey rectangle. Fix everything below and add a pseudo-3D depth system.

---

## CRITICAL BUG FIXES (Do these first — game is unplayable without them)

---

### BUG FIX 1: Rendering Order is Wrong — Player is Hidden

In `game.js`, the render function currently draws the near background layer ON TOP of the player. Fix the render order to this exact sequence:

```javascript
render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Utils.screenShake.offsetX, Utils.screenShake.offsetY);
    ctx.clearRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);

    if (this.state === 'homeScene') {
        Story.renderHomeScene(ctx);
        ctx.restore();
        return;
    }

    // CORRECT ORDER: background layers (far to near), then obstacles, then player ON TOP
    Camera.render(ctx);           // 1. All background layers
    Levels.renderDecorations(ctx); // 2. World decorations (milk shop, signs, etc.)
    Obstacles.render(ctx);         // 3. Obstacles and coins
    Player.render(ctx);            // 4. PLAYER — always on top of world elements
    Particles.render(ctx);         // 5. Particles on top of player

    // Depth fog overlay (drawn AFTER player to create atmospheric depth)
    Camera.renderDepthFog(ctx);    // 6. Depth/atmospheric overlay

    // HUD elements (always topmost)
    if (this.state === 'playing' || this.state === 'paused' ||
        this.state === 'gameOver' || this.state === 'levelComplete' ||
        this.state === 'chapterComplete' || this.state === 'bonusStage') {
        HUD.renderProgress(ctx);
        HUD.renderMessages(ctx);
        Modes.renderOverlay(ctx);
        HUD.renderSMS(ctx);
    }

    if (this.state === 'levelIntro') this.renderLevelIntro(ctx);
    if (this.state === 'chapterIntro') this.renderChapterIntro(ctx);
    if (this.state === 'dialogue') Story.renderDialogue(ctx);
    if (this.state === 'ending') { Story.renderGameEnding(ctx); Particles.render(ctx); }

    ctx.restore();
}
```

---

### BUG FIX 2: Completely Rewrite camera.js

Replace the entire contents of `camera.js` with the following. This fixes seams, fixes layer positions, adds pseudo-3D depth, and makes the player visible:

```javascript
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
            if (this.offsets[i] > 3200) this.offsets[i] -= 3200;
        }
    },

    render(ctx) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.themes[city] || this.themes.Lahore;
        const imgs = this.cityImages[city] || {};

        // ── LAYER 0: SKY ──────────────────────────────────────────
        // Fills top 55% of canvas (0 to 248px)
        this.renderSky(ctx, theme, city);

        // ── LAYER 1: FAR BUILDINGS / MOUNTAINS ────────────────────
        // Fills from 120px down to 395px (overlaps sky at top)
        // Scrolls at 0.15x speed
        const farKey = imgs[0];
        const farDrawn = farKey && this.drawLayer(ctx, farKey, this.offsets[0], 120, 275, 0.88);
        if (!farDrawn) {
            this.drawProceduralFar(ctx, theme, city, this.offsets[0]);
        }

        // ── LAYER 2: MID BUILDINGS ────────────────────────────────
        // Fills from 250px down to 395px
        // Scrolls at 0.45x speed
        const midKey = imgs[1];
        const midDrawn = midKey && this.drawLayer(ctx, midKey, this.offsets[1], 250, 145, 1.0);
        if (!midDrawn && city !== 'Murree' && city !== 'Naran') {
            // Use far image again at different position as mid layer fallback
            if (farKey) this.drawLayer(ctx, farKey, this.offsets[1] * 1.2, 270, 130, 0.95);
        }

        // ── LAYER 3: NEAR STREET / SHOP FRONTS ───────────────────
        // Fills from 330px down to 395px (just above ground)
        // Scrolls at 1.0x speed — fastest
        const nearKey = imgs[2];
        if (nearKey) {
            this.drawLayer(ctx, nearKey, this.offsets[2], 330, 65, 1.0);
        }
        // Near-layer decorations always drawn (lamp posts, pennants, etc.)
        this.renderNearDecorations(ctx, theme, city, this.offsets[3]);

        // ── GROUND ────────────────────────────────────────────────
        this.renderGround(ctx, theme, city);
    },

    // Draw one image layer with seamless tiling
    // imgKey: asset key | scrollOffset: parallax offset
    // dstY: top Y of this layer on canvas | dstH: height of this layer on canvas
    drawLayer(ctx, imgKey, scrollOffset, dstY, dstH, alpha) {
        const img = AssetLoader.get(imgKey);
        if (!img) return false;

        ctx.save();
        ctx.globalAlpha = alpha || 1;

        // Clip to only this layer's region — prevents overflow into other layers
        ctx.beginPath();
        ctx.rect(0, dstY, this.CANVAS_W, dstH);
        ctx.clip();

        // Scale image to fill the full canvas width while preserving aspect ratio crop
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
            ctx.fillStyle = '#FFD600';
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

        // ── Pavement surface (top 20px of ground) ──
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
                ctx.ellipse(sx, gTop + 6, 20 + (i%3)*8, 5, 0, 0, Math.PI * 2);
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

        // ── Shadow line at pavement top edge ──
        const shadowGrad = ctx.createLinearGradient(0, gTop - 10, 0, gTop);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, gTop - 10, this.CANVAS_W, 10);

        // ── Ground underside (below pavement) ──
        const underGrad = ctx.createLinearGradient(0, gTop + 20, 0, this.CANVAS_H);
        underGrad.addColorStop(0, theme.ground);
        underGrad.addColorStop(1, this.darken(theme.ground, 0.5));
        ctx.fillStyle = underGrad;
        ctx.fillRect(0, gTop + 20, this.CANVAS_W, gH - 20);
    },

    renderNearDecorations(ctx, theme, city, offset) {
        // These decorations are drawn just ABOVE the ground (y ~350–390)
        // and scroll at full speed (parallax speed 1.0)
        const tileOffset = offset % 200;

        if (city === 'Lahore') {
            // Lamp posts every 200px
            for (let x = -200 + tileOffset; x < this.CANVAS_W + 200; x += 200) {
                // Pole
                ctx.fillStyle = '#555';
                ctx.fillRect(x, 355, 5, 38);
                // Lamp head
                ctx.fillStyle = '#444';
                ctx.fillRect(x - 8, 351, 20, 6);
                // Warm lamp glow
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
                // String from this post to next (200px away)
                ctx.strokeStyle = 'rgba(100,100,100,0.6)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(x + 2, 355);
                ctx.quadraticCurveTo(x + 100, 365, x + 202, 355);
                ctx.stroke();
                // Pennant triangles along the string
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
                ctx.fillText('↑200', x + 7, 374);
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
                // Rounded top
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
        const bottomFog = ctx.createLinearGradient(0, 395, 0, 450);
        bottomFog.addColorStop(0, 'rgba(0,0,0,0)');
        bottomFog.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = bottomFog;
        ctx.fillRect(0, 395, this.CANVAS_W, 55);
    },

    // Procedural far-layer fallback for cities without images
    drawProceduralFar(ctx, theme, city, offset) {
        if (city === 'Murree') {
            // Dark mountain silhouettes
            ctx.fillStyle = '#0D1B3E';
            const pts = [0,390, 80,210, 160,280, 260,160, 360,240, 450,110, 550,200, 660,130, 760,210, 800,180, 800,390];
            ctx.beginPath();
            for (let i = 0; i < pts.length; i += 2) {
                i === 0 ? ctx.moveTo(pts[i] - offset * 0.15 % 800, pts[i+1]) : ctx.lineTo(pts[i] - offset * 0.15 % 800, pts[i+1]);
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
            const peakData = [{x: 100, y: 100, w: 220}, {x: 380, y: 60, w: 300}, {x: 660, y: 90, w: 260}];
            const mOff = offset * 0.08;
            for (const p of peakData) {
                const px = p.x - mOff % this.CANVAS_W;
                ctx.fillStyle = '#1C2F3A';
                ctx.beginPath();
                ctx.moveTo(px - p.w/2, 395);
                ctx.lineTo(px, p.y);
                ctx.lineTo(px + p.w/2, 395);
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
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgb(${Math.floor(r*factor)},${Math.floor(g*factor)},${Math.floor(b*factor)})`;
    },
};
```

---

### BUG FIX 3: Fix Player and Obstacle Ground Position

In `player.js`, find ALL occurrences of this pattern:
```javascript
this.groundY = 450 - this.foot.h - 16;
```
Replace every one with:
```javascript
this.groundY = 390 - this.foot.h;
```

Find ALL occurrences of:
```javascript
this.groundY = 450 - this.bike.h - 16;
```
Replace every one with:
```javascript
this.groundY = 390 - this.bike.h;
```

In `player.js` render function, add a drop shadow BEFORE drawing the player sprite:
```javascript
// Drop shadow — draws connection between player and ground
ctx.save();
ctx.globalAlpha = 0.35;
ctx.fillStyle = '#000';
ctx.beginPath();
ctx.ellipse(
    this.x + this.w / 2,
    390,
    this.w * 0.65,
    4,
    0, 0, Math.PI * 2
);
ctx.fill();
ctx.restore();
```

In `obstacles.js`, find the obstacle spawn y-position setting. For every ground-based obstacle (dog, gutter, rickshaw, carelessBike, constructionCone, truck), change:
```javascript
obs.y = 450 - obs.h - 16;
// or any variant like:
obs.y = 434 - obs.h;
// or:
obs.y = GROUND_Y - obs.h;
```
To:
```javascript
obs.y = 390 - obs.h;
```

For overhead obstacles (wires, speedCamera), keep them at their current y positions (they should be above the player).

---

### BUG FIX 4: Fix Collectible Rendering (Remove Plain Dots)

In `obstacles.js`, find the function that renders coins/collectibles. Replace the entire coin rendering switch with:

```javascript
renderCoin(ctx, coin) {
    if (!coin.active) return;

    const pulse = 0.82 + 0.18 * Math.sin(Date.now() * 0.006 + coin.x * 0.01);
    ctx.save();
    ctx.globalAlpha = pulse;

    // Try real sprite first
    if (coin.type === 'petrol' && AssetLoader.draw(ctx, 'petrol_bottle', coin.x, coin.y, coin.w, coin.h)) {
        ctx.restore(); return;
    }
    if (coin.type === 'bikeKey' && AssetLoader.draw(ctx, 'key', coin.x, coin.y, coin.w, coin.h)) {
        ctx.restore(); return;
    }
    if (['cash10','cash50','cash100','cash500'].includes(coin.type) && AssetLoader.draw(ctx, 'rupee_note', coin.x, coin.y, coin.w, coin.h)) {
        ctx.restore(); return;
    }

    // Colored fallback by type
    const typeColors = {
        cash10: '#9E9E9E', cash50: '#FF9800', cash100: '#2196F3',
        cash500: '#4CAF50', petrol: '#FF5722', bikeKey: '#FFD700',
        chai: '#8D6E63', hotChai: '#FF8F00', parchi: '#9C27B0',
        bhutta: '#FFC107', shawl: '#7E57C2', jugaadRepair: '#F44336',
        guava: '#66BB6A', jeepToken: '#26A69A', delivery: '#42A5F5',
    };
    const col = typeColors[coin.type] || '#FFD700';

    // Glow ring behind coin
    ctx.globalAlpha = pulse * 0.3;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.strokeRect(coin.x - 3, coin.y - 3, coin.w + 6, coin.h + 6);

    ctx.globalAlpha = pulse;

    // Coin body
    ctx.fillStyle = col;
    ctx.fillRect(coin.x, coin.y, coin.w, coin.h);

    // Inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(coin.x + 1, coin.y + 1, coin.w - 2, coin.h - 2);

    // Symbol text centered in coin
    const symbols = {
        cash10: '10', cash50: '50', cash100: '100', cash500: '500',
        petrol: '⛽', bikeKey: '🔑', chai: 'चाय', hotChai: '☕',
        parchi: 'P', bhutta: '🌽', shawl: 'S', guava: 'G',
        jugaadRepair: '🔧', jeepToken: 'J', delivery: '📦',
    };
    const sym = symbols[coin.type] || '₨';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.min(coin.w, coin.h) <= 12 ? 7 : 9}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(sym, coin.x + coin.w / 2, coin.y + coin.h - 3);
    ctx.textAlign = 'left';

    ctx.restore();
},
```

---

### BUG FIX 5: Remove Duplicate Wallet Display

In `index.html`, find and DELETE the HTML element that shows the wallet (probably looks like):
```html
<div id="walletContainer">Rs. <span id="walletAmount">0</span></div>
```
or similar. Remove it completely.

In `hud.js`, find any line that sets `walletAmount` text content:
```javascript
document.getElementById('walletAmount').textContent = ...
```
Remove those lines.

The wallet is already rendered on canvas by `HUD.renderProgress(ctx)` — no need for the HTML duplicate.

---

## PSEUDO-3D DEPTH IMPROVEMENTS (Do these after the bug fixes)

---

### 3D IMPROVEMENT 1: CSS Perspective on Canvas Container

In `index.html`, add this CSS to the `#gameContainer` element:

```css
#gameContainer {
    perspective: 800px;
    perspective-origin: 50% 30%;
}
#gameCanvas {
    /* Slight vertical tilt — makes ground feel like a floor receding into distance */
    transform: rotateX(2deg);
    transform-origin: center top;
    /* Compensate for slight size change */
    transform-style: preserve-3d;
}
```

This gives a very subtle floor-plane tilt that makes the 2D background art feel like a 3D world — because your PNGs are already rendered with 3D perspective, this CSS rotation aligns the canvas tilt with the art's vanishing point.

---

### 3D IMPROVEMENT 2: Depth-Based Obstacle Scaling

In `obstacles.js`, when drawing each obstacle, scale it based on its Y position. Objects closer to ground top (y ≈ 280) appear smaller (farther away). Objects at ground level (y ≈ 390) appear normal size.

Add this function to the Obstacles object:
```javascript
getDepthScale(y) {
    // y=280 (top of play area) → scale 0.65 (farther, smaller)
    // y=390 (ground level)    → scale 1.0 (normal)
    const minY = 280, maxY = 390;
    const minScale = 0.65, maxScale = 1.0;
    const t = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));
    return minScale + (maxScale - minScale) * t;
},
```

In the obstacle render function, before drawing each obstacle:
```javascript
const depthScale = this.getDepthScale(obs.y);
ctx.save();
ctx.translate(obs.x + obs.w / 2, obs.y + obs.h);
ctx.scale(depthScale, depthScale);
ctx.translate(-(obs.x + obs.w / 2), -(obs.y + obs.h));
// ... draw obstacle here ...
ctx.restore();
```

---

### 3D IMPROVEMENT 3: Obstacle Y-Range Expansion

Currently all obstacles spawn at the same Y (ground level). Add a Y-range so obstacles can spawn at different depths on screen, creating a 3D lane system.

In `obstacles.js` spawn function, add Y variation based on obstacle type:

```javascript
// Ground lane obstacles: vary Y slightly for depth illusion
if (['dog','rickshaw','carelessBike','constructionCone','mountainGoat'].includes(type)) {
    // 70% of time: normal ground lane
    // 30% of time: slightly higher (looks like farther lane)
    if (Math.random() < 0.3) {
        obs.y = 360 - obs.h;  // "far lane" — higher on screen, appears farther
        obs.x = 900;          // Start offscreen right
    } else {
        obs.y = 390 - obs.h;  // normal ground lane
    }
}
```

---

### 3D IMPROVEMENT 4: Camera Shake with Depth Response

In `utils.js`, update the screen shake to affect foreground and background differently:

```javascript
// In renderDepthFog or at top of camera render, apply subtle camera lean
// When screenShake is active, tilt the near layer slightly more than the far layer
// This sells the parallax 3D feel during impacts

// Add to Camera.update():
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
```

---

## FINAL CHECKLIST

After all changes, verify:

- [ ] Player is VISIBLE on screen during gameplay
- [ ] No vertical seam lines in the sky background
- [ ] Buildings appear in the MIDDLE of the screen (120px to 390px), not squashed at bottom
- [ ] Ground has city-specific texture (terracotta tiles for Lahore, asphalt for GT Road)
- [ ] Player shadow ellipse appears at ground level (y=390)
- [ ] Decorations (lamp posts, pennants, hedges) appear between y=340 and y=395
- [ ] Collectibles are colored boxes with symbols (not plain green circles)
- [ ] No duplicate wallet display (HTML and canvas)
- [ ] Murree levels show mountain silhouettes + pine trees (procedural)
- [ ] Naran levels show snow-capped peaks + boulders (procedural)
- [ ] Slight CSS perspective tilt on canvas gives 3D floor feel
- [ ] Obstacles farther up the screen (y=360) appear slightly smaller than ground-level ones
