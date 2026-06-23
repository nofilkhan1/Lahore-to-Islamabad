// ============================================================
// camera.js — 4-layer parallax scrolling background
// ============================================================

const Camera = {
    canvas: null,
    layers: [
        { offset: 0, speed: 0.05 },
        { offset: 0, speed: 0.3 },
        { offset: 0, speed: 0.6 },
        { offset: 0, speed: 1.0 },
    ],
    cityThemes: {
        Lahore: { sky: '#FF8C42', skyGrad: '#FFB366', far: '#C4956A', mid: '#8B6914', near: '#5C4033', ground: '#8B7355', pavement: '#A0A0A0' },
        'GT Road': { sky: '#87CEEB', skyGrad: '#B0E0E6', far: '#4CAF50', mid: '#388E3C', near: '#555555', ground: '#D2B48C', pavement: '#777777' },
        Islamabad: { sky: '#5B86E5', skyGrad: '#7BA4F0', far: '#2F4F4F', mid: '#2E8B57', near: '#708090', ground: '#6B8E23', pavement: '#A9A9A9' },
    },

    init(canvas) { this.canvas = canvas; },

    reset() { this.layers.forEach(l => l.offset = 0); },

    update(dt, scrollSpeed) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].offset += scrollSpeed * this.layers[i].speed * (dt / 60);
            if (this.layers[i].offset > 1600) this.layers[i].offset -= 1600;
        }
    },

    render(ctx) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.cityThemes[city] || this.cityThemes.Lahore;
        const W = 800, H = 450;

        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        skyGrad.addColorStop(0, theme.sky);
        skyGrad.addColorStop(1, theme.skyGrad);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H * 0.5);

        this.renderFarLayer(ctx, theme, W, H);
        this.renderMidLayer(ctx, theme, W, H);
        this.renderNearLayer(ctx, theme, W, H);
        this.renderGround(ctx, theme, W, H);
    },

    renderFarLayer(ctx, theme, W, H) {
        const layer = this.layers[0];
        const baseY = H * 0.3;
        ctx.fillStyle = theme.far;
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 20; i++) {
            const x = (i * 120 - layer.offset) % 1600;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;
            if (drawX > -100 && drawX < W + 100) {
                const h = 30 + (i * 17 % 30);
                if (i % 3 === 0) {
                    ctx.fillRect(drawX, baseY - h, 12, h);
                    ctx.fillRect(drawX - 6, baseY - h, 24, 8);
                } else if (i % 3 === 1) {
                    ctx.beginPath();
                    ctx.moveTo(drawX, baseY);
                    ctx.lineTo(drawX + 40, baseY - h);
                    ctx.lineTo(drawX + 80, baseY);
                    ctx.fill();
                } else {
                    ctx.fillRect(drawX, baseY - h, 50, h);
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
        for (let i = 0; i < 20; i++) {
            const x = (i * 100 - layer.offset) % 1600;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;
            if (drawX > -100 && drawX < W + 100) {
                const h = 40 + (i * 13 % 40);
                ctx.fillRect(drawX, baseY - h, 60, h);
                ctx.fillStyle = '#FFFF88';
                for (let wy = 6; wy < h - 6; wy += 16) {
                    for (let wx = 6; wx < 54; wx += 14) {
                        ctx.fillRect(drawX + wx, baseY - h + wy, 6, 8);
                    }
                }
                ctx.fillStyle = theme.mid;
            }
        }
        ctx.globalAlpha = 1;
    },

    renderNearLayer(ctx, theme, W, H) {
        const layer = this.layers[2];
        const baseY = H * 0.7;
        ctx.fillStyle = theme.near;
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 20; i++) {
            const x = (i * 80 - layer.offset) % 1600;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;
            if (drawX > -80 && drawX < W + 80) {
                const h = 20 + (i * 11 % 30);
                ctx.fillRect(drawX, baseY - h, 40, h);
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(drawX - 4, baseY - h - 6, 48, 8);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(drawX - 4, baseY - h + 2, 48, 3);
                ctx.fillStyle = theme.near;
            }
        }
        ctx.globalAlpha = 1;
    },

    renderGround(ctx, theme, W, H) {
        const groundY = H - 80;
        ctx.fillStyle = theme.ground;
        ctx.fillRect(0, groundY, W, 80);
        ctx.fillStyle = theme.pavement;
        ctx.fillRect(0, groundY, W, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let x = 0; x < W; x += 60) ctx.fillRect(x, groundY + 2, 2, 38);
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        if (city === 'GT Road' || city === 'Islamabad') {
            ctx.fillStyle = '#FFD700';
            for (let x = -50; x < W + 50; x += 80) ctx.fillRect(x, groundY + 50, 40, 3);
        }
    },
};
