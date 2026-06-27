// ============================================================
// camera.js — 4-layer parallax scrolling with real BG images
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
        Islamabad: { sky: '#5B86E5', skyGrad: '#7BA4F0', far: '#2F4F4F', mid: '#2E8B57', near: '#708090', ground: '#6B8E23', pavement: '#A9A9A9', hills: '#2E4E3E', hillPeak: '#1A3A2A' },
        Murree: { sky: '#1A237E', skyGrad: '#283593', far: '#1B5E20', mid: '#2E7D32', near: '#4E342E', ground: '#3E2723', pavement: '#5D4037', snow: '#fff', pine: '#1B5E20' },
        Naran: { sky: '#0D47A1', skyGrad: '#1565C0', far: '#1A237E', mid: '#283593', near: '#3E2723', ground: '#4E342E', pavement: '#5D4037', river: '#1565C0', mountain: '#37474F' },
    },

    // City → image key mapping for each parallax layer
    cityImages: {
        Lahore:   { far: 'bg_lahore_far',  mid: null,  near: 'bg_lahore_near' },
        'GT Road': { far: 'bg_gtroad_far',  mid: 'bg_gtroad_mid', near: 'bg_gtroad_near' },
        Islamabad: { far: 'bg_isb_far',     mid: 'bg_isb_mid',    near: 'bg_isb_near' },
        Murree:   { far: null,              mid: null,  near: null },
        Naran:    { far: null,              mid: null,  near: null },
    },

    init(canvas) { this.canvas = canvas; },

    reset() { this.layers.forEach(l => l.offset = 0); },

    update(dt, scrollSpeed) {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].offset += scrollSpeed * this.layers[i].speed * (dt / 60);
            if (this.layers[i].offset > 1600) this.layers[i].offset -= 1600;
        }
    },

    // Helper: tile an image horizontally with parallax offset
    drawTiledLayer(ctx, imgKey, layerOffset, y, h, alpha) {
        const img = AssetLoader.get(imgKey);
        if (!img) return false;
        const W = 800;
        const imgW = img.width;
        const imgH = img.height;
        ctx.save();
        ctx.globalAlpha = alpha || 1;
        const offset = layerOffset % imgW;
        for (let drawX = -offset - imgW; drawX < W + imgW; drawX += imgW) {
            ctx.drawImage(img, drawX, y, imgW, h);
        }
        ctx.restore();
        return true;
    },

    render(ctx) {
        const city = Levels.currentLevelData ? Levels.currentLevelData.city : 'Lahore';
        const theme = this.cityThemes[city] || this.cityThemes.Lahore;
        const W = 800, H = 450;

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        skyGrad.addColorStop(0, theme.sky);
        skyGrad.addColorStop(1, theme.skyGrad);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, H * 0.5);

        this.renderFarLayer(ctx, theme, W, H, city);
        this.renderMidLayer(ctx, theme, W, H, city);
        this.renderNearLayer(ctx, theme, W, H, city);
        this.renderGround(ctx, theme, W, H, city);
    },

    renderFarLayer(ctx, theme, W, H, city) {
        const layer = this.layers[0];
        const baseY = H * 0.35;
        const imgs = this.cityImages[city] || {};

        // Try real background images first
        if (imgs.far && this.drawTiledLayer(ctx, imgs.far, layer.offset, 0, H * 0.6, 1)) {
            return;
        }

        // Islamabad: Faisal Mosque overlay
        if (city === 'Islamabad') {
            // Margalla Hills
            if (this.drawTiledLayer(ctx, 'bg_margalla', layer.offset, baseY - 80, 180, 0.8)) return;
            if (this.drawTiledLayer(ctx, 'bg_faisal_mosque', layer.offset, baseY - 40, 100, 0.6)) return;
        }

        // Vector fallback: procedural far layer
        if (city === 'Islamabad' && theme.hills) {
            ctx.fillStyle = theme.hills;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(0, baseY + 20);
            ctx.lineTo(100, baseY - 60);
            ctx.lineTo(200, baseY - 30);
            ctx.lineTo(350, baseY - 80);
            ctx.lineTo(500, baseY - 40);
            ctx.lineTo(650, baseY - 70);
            ctx.lineTo(800, baseY - 20);
            ctx.lineTo(800, baseY + 20);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(345, baseY - 80, 12, 6);
            ctx.fillRect(645, baseY - 70, 10, 5);
        }

        if (city === 'Murree') {
            ctx.fillStyle = theme.pine || '#1B5E20';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(0, baseY + 30);
            ctx.lineTo(80, baseY - 50);
            ctx.lineTo(160, baseY - 20);
            ctx.lineTo(300, baseY - 70);
            ctx.lineTo(450, baseY - 40);
            ctx.lineTo(600, baseY - 60);
            ctx.lineTo(800, baseY - 10);
            ctx.lineTo(800, baseY + 30);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(295, baseY - 70, 15, 8);
            ctx.fillRect(595, baseY - 60, 12, 6);
            ctx.fillStyle = '#1B5E20';
            ctx.globalAlpha = 0.7;
            for (let i = 0; i < 8; i++) {
                const tx = (i * 120 - layer.offset * 0.3) % 1600;
                const drawX = ((tx % 1600) + 1600) % 1600 - 200;
                if (drawX > -40 && drawX < W + 40) {
                    ctx.fillStyle = '#3E2723';
                    ctx.fillRect(drawX + 8, baseY - 20, 4, 20);
                    ctx.fillStyle = '#1B5E20';
                    ctx.beginPath();
                    ctx.moveTo(drawX + 10, baseY - 50);
                    ctx.lineTo(drawX, baseY - 20);
                    ctx.lineTo(drawX + 20, baseY - 20);
                    ctx.fill();
                }
            }
        }

        if (city === 'Naran') {
            ctx.fillStyle = theme.mountain || '#37474F';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(0, baseY + 20);
            ctx.lineTo(60, baseY - 80);
            ctx.lineTo(150, baseY - 40);
            ctx.lineTo(250, baseY - 90);
            ctx.lineTo(380, baseY - 50);
            ctx.lineTo(500, baseY - 100);
            ctx.lineTo(650, baseY - 60);
            ctx.lineTo(800, baseY - 30);
            ctx.lineTo(800, baseY + 20);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(245, baseY - 90, 18, 10);
            ctx.fillRect(495, baseY - 100, 20, 12);
            ctx.fillRect(645, baseY - 60, 14, 8);
            ctx.fillStyle = theme.river || '#1565C0';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(0, baseY + 10, W, 20);
            ctx.fillStyle = 'rgba(100, 181, 246, 0.3)';
            for (let i = 0; i < 5; i++) {
                const rx = (Date.now() * 0.02 + i * 160) % 900 - 50;
                ctx.fillRect(rx, baseY + 15, 80, 3);
            }
        }

        // Generic far skyline (all cities)
        ctx.fillStyle = theme.far;
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 20; i++) {
            const x = (i * 130 - layer.offset) % 1600;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;
            if (drawX > -120 && drawX < W + 120) {
                const h = 40 + (i * 17 % 40);
                if (i % 4 === 0) {
                    ctx.fillRect(drawX + 8, baseY - h, 6, h);
                    ctx.fillRect(drawX + 2, baseY - h, 18, 6);
                    ctx.fillRect(drawX + 5, baseY - h - 10, 12, 12);
                    ctx.beginPath();
                    ctx.arc(drawX + 11, baseY - h - 10, 8, Math.PI, 0);
                    ctx.fill();
                } else if (i % 4 === 1) {
                    ctx.beginPath();
                    ctx.moveTo(drawX - 10, baseY);
                    ctx.lineTo(drawX + 30, baseY - h);
                    ctx.lineTo(drawX + 50, baseY - h + 10);
                    ctx.lineTo(drawX + 80, baseY);
                    ctx.fill();
                } else if (i % 4 === 2) {
                    ctx.fillRect(drawX + 18, baseY - h * 0.3, 4, h * 0.3);
                    ctx.beginPath();
                    ctx.arc(drawX + 20, baseY - h * 0.4, h * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(drawX + 34, baseY - h * 0.35, h * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(drawX, baseY - h, 40, h);
                    ctx.fillRect(drawX + 45, baseY - h * 0.7, 30, h * 0.7);
                }
            }
        }
        ctx.globalAlpha = 1;
    },

    renderMidLayer(ctx, theme, W, H, city) {
        const layer = this.layers[1];
        const baseY = H * 0.55;
        const imgs = this.cityImages[city] || {};

        // Try real background images first
        if (imgs.mid && this.drawTiledLayer(ctx, imgs.mid, layer.offset, H * 0.2, H * 0.5, 1)) {
            return;
        }

        // Islamabad: sky_scrapper overlay
        if (city === 'Islamabad') {
            if (this.drawTiledLayer(ctx, 'bg_sky_scrapper', layer.offset, H * 0.15, H * 0.4, 0.5)) return;
        }

        // Vector fallback
        ctx.fillStyle = theme.mid;
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 20; i++) {
            const x = (i * 100 - layer.offset) % 1600;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;
            if (drawX > -100 && drawX < W + 100) {
                const h = 50 + (i * 13 % 40);
                const type = i % 3;
                if (type === 0) {
                    ctx.fillRect(drawX, baseY - h, 55, h);
                    ctx.fillStyle = '#FFFF88';
                    for (let wy = 8; wy < h - 6; wy += 14) {
                        for (let wx = 6; wx < 48; wx += 12) {
                            const lit = ((i * 7 + wx + wy) % 5) > 1;
                            ctx.fillStyle = lit ? '#FFFF88' : '#554400';
                            ctx.fillRect(drawX + wx, baseY - h + wy, 6, 8);
                        }
                    }
                    ctx.fillStyle = theme.mid;
                } else if (type === 1) {
                    ctx.fillStyle = '#5C3317';
                    ctx.fillRect(drawX + 18, baseY - h * 0.3, 6, h * 0.3);
                    ctx.fillStyle = '#228B22';
                    ctx.beginPath();
                    ctx.arc(drawX + 21, baseY - h * 0.4, h * 0.22, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#1B7A1B';
                    ctx.beginPath();
                    ctx.arc(drawX + 16, baseY - h * 0.35, h * 0.15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = theme.mid;
                } else {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(drawX + 4, baseY - h, 3, h);
                    ctx.fillRect(drawX - 10, baseY - h, 26, 3);
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(drawX - 8, baseY - h + 1);
                    ctx.quadraticCurveTo(drawX + 30, baseY - h + 8, drawX + 70, baseY - h + 1);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(drawX - 8, baseY - h + 2);
                    ctx.quadraticCurveTo(drawX + 25, baseY - h + 10, drawX + 70, baseY - h + 2);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    },

    renderNearLayer(ctx, theme, W, H, city) {
        const layer = this.layers[2];
        const baseY = H * 0.7;
        const imgs = this.cityImages[city] || {};

        // Try real background images first
        if (imgs.near && this.drawTiledLayer(ctx, imgs.near, layer.offset, H * 0.35, H * 0.45, 0.9)) {
            return;
        }

        // Vector fallback
        ctx.fillStyle = theme.near;
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 20; i++) {
            const x = (i * 80 - layer.offset) % 1600;
            const drawX = ((x % 1600) + 1600) % 1600 - 200;
            if (drawX > -80 && drawX < W + 80) {
                const type = i % 4;
                if (type === 0) {
                    const h = 30 + (i * 7 % 20);
                    ctx.fillRect(drawX, baseY - h, 50, h);
                    ctx.fillStyle = '#CC0000';
                    ctx.fillRect(drawX - 4, baseY - h - 6, 58, 8);
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(drawX - 4, baseY - h + 2, 58, 2);
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(drawX + 4, baseY - h + 4, 12, 10);
                    ctx.fillStyle = '#FF8C00';
                    ctx.fillRect(drawX + 20, baseY - h + 6, 8, 6);
                    ctx.fillStyle = theme.near;
                } else if (type === 1) {
                    ctx.fillStyle = '#555';
                    ctx.fillRect(drawX + 3, baseY - 45, 3, 45);
                    ctx.fillStyle = '#444';
                    ctx.fillRect(drawX - 2, baseY - 48, 13, 5);
                    ctx.fillStyle = '#FFFF88';
                    ctx.fillRect(drawX, baseY - 46, 9, 2);
                    ctx.fillStyle = 'rgba(255,255,136,0.15)';
                    ctx.beginPath();
                    ctx.arc(drawX + 5, baseY - 44, 20, 0, Math.PI * 2);
                    ctx.fill();
                } else if (type === 2) {
                    if (city === 'GT Road') {
                        ctx.fillStyle = '#333';
                        ctx.fillRect(drawX - 10, baseY - 55, 70, 40);
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(drawX - 8, baseY - 53, 66, 36);
                        ctx.fillStyle = '#CC0000';
                        ctx.fillRect(drawX - 6, baseY - 51, 62, 10);
                        ctx.fillStyle = '#fff';
                        ctx.font = '6px monospace';
                        const ads = ['CHAI Nahi CHALEGI!', 'SPEED KILLED THE CAT', 'PAY TOLL OR WALK', 'M-TAG = M-SAVING'];
                        ctx.fillText(ads[i % ads.length], drawX - 4, baseY - 44);
                        ctx.fillStyle = '#333';
                        ctx.fillRect(drawX - 6, baseY - 38, 62, 18);
                    } else {
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(drawX, baseY - 30, 30, 20);
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(drawX + 2, baseY - 28, 26, 16);
                        ctx.fillStyle = '#CC0000';
                        ctx.fillRect(drawX + 4, baseY - 24, 22, 8);
                    }
                } else {
                    ctx.fillStyle = '#8B6914';
                    ctx.fillRect(drawX, baseY - 10, 14, 10);
                    ctx.fillStyle = '#A0522D';
                    ctx.fillRect(drawX + 16, baseY - 8, 12, 8);
                    ctx.fillStyle = '#FF8C00';
                    ctx.fillRect(drawX + 4, baseY - 14, 6, 4);
                }
                ctx.fillStyle = theme.near;
            }
        }
        ctx.globalAlpha = 1;
    },

    renderGround(ctx, theme, W, H, city) {
        const groundY = H - 80;
        const levelData = Levels.currentLevelData;
        const isUphill = levelData && levelData.uphill;

        ctx.save();
        if (isUphill) {
            ctx.translate(0, H);
            ctx.rotate(-0.03);
            ctx.translate(0, -H);
        }
        ctx.fillStyle = theme.ground;
        ctx.fillRect(0, groundY, W, 80);

        ctx.fillStyle = theme.pavement;
        ctx.fillRect(0, groundY, W, 4);

        ctx.fillStyle = city === 'Murree' || city === 'Naran' ? '#4E342E' : '#555';
        ctx.fillRect(0, groundY + 30, W, 50);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let x = 0; x < W; x += 60) ctx.fillRect(x, groundY + 2, 2, 28);

        if (city === 'GT Road' || city === 'Islamabad') {
            ctx.fillStyle = '#FFD700';
            for (let x = -50; x < W + 50; x += 80) ctx.fillRect(x, groundY + 52, 40, 3);
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, groundY + 30, W, 1);
            ctx.fillRect(0, groundY + 78, W, 1);
        } else if (city === 'Murree') {
            ctx.fillStyle = '#fff';
            for (let x = -50; x < W + 50; x += 100) {
                ctx.fillRect(x, groundY + 50, 30, 2);
            }
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let x = 0; x < W; x += 120) {
                ctx.fillRect(x + 20, groundY + 32, 40, 4);
            }
        } else if (city === 'Naran') {
            ctx.fillStyle = '#3E2723';
            for (let x = 0; x < W; x += 50) {
                ctx.fillRect(x + 10, groundY + 32, 20, 3);
            }
            ctx.fillStyle = 'rgba(21, 101, 192, 0.3)';
            ctx.fillRect(0, groundY + 70, W, 10);
        } else {
            ctx.fillStyle = 'rgba(139, 119, 85, 0.3)';
            for (let x = 0; x < W; x += 40) {
                ctx.fillRect(x + Math.sin(x) * 5, groundY + 30, 20, 2);
            }
        }
        ctx.restore();
    },
};
