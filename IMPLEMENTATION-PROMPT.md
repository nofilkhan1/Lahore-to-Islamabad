# LAHORE TO ISLAMABAD — FULL IMPLEMENTATION PROMPT
## Paste this entire prompt to your AI coding assistant

---

You are updating a Pakistani 2D side-scrolling platformer game called "Lahore to Islamabad".
The codebase already exists with these files: game.js, player.js, obstacles.js, levels.js, story.js, camera.js, modes.js, hud.js, economy.js, assets.js, utils.js, particles.js, audio.js, input.js, index.html

Make ALL of the following changes exactly as specified:

---

## CHANGE 1: HOME SCENE — Game Starts at Ali's House (Story Intro Before Any Level)

### In story.js — Add a full HOME SCENE before Chapter 1

Add a new scene type called `homeScene` that plays when the game first starts (before any dialogue, before any gameplay). This scene is drawn on the canvas — NOT a screen overlay.

The home scene renders:
- Background: Deep warm dark brown/maroon room interior (fill entire canvas `#1A0A00`)
- A single flickering overhead bulb (yellow circle at top-center, alpha oscillates 0.6–1.0 using `Math.sin(Date.now()*0.005)`)
- A charpoy (wooden bed) on the left: draw as a brown rectangle 200×40px at position (80, 340), with 4 legs (10×30px each)
- Ali is lying on the charpoy: draw as a horizontal white/cream rectangle 80×20px on top of the charpoy, slightly animated (bob up/down 2px)
- A small TV in the corner showing Islamabad (green rectangle 80×60px at position (650, 300), with a white inner rectangle showing "ISLAMABAD" text in tiny font, slight flicker)
- Mama enters from the RIGHT side of screen: draw as a DARK SILHOUETTE (pure black `#000000` filled shape)
  - Mama silhouette shape: head circle (r=18) at position that walks from x=800 to x=560 over 2 seconds
  - Body: filled rectangle 36×80px below head
  - Dupatta: filled irregular quadrilateral over head/shoulders using ctx.beginPath
  - Hands on hips: two small filled circles

The scene plays this sequence automatically with 1.5-second gaps between dialogue lines:

```
[Mama walks in from right — 2 second animation]

Mama (angry): "ALI! Uth ja. Subah ho gayi!"
[pause 1.5s]
Ali (sleepy, from charpoy): "...5 minute aur Ammi..."
[pause 1.5s]
Mama (louder): "DOODH LENA HAI. Uth ja ABHI. Rs. 500 rakh liye hain counter pe."
[pause 1.5s]
Ali (sitting up — change sprite to sitting): "Theek hai theek hai..."
[pause 1.5s]
Mama: "Aur seedha aana. Islamabad waisabad. Ghar mein reh."
[pause 1.5s]
Ali (standing now, looking at TV showing Islamabad): "...Ammi, Islamabad mein log khush hote hain."
[pause 1.5s]
Mama: "Tujhe pata nahi kuch. JA. Doodh le."
[pause 1s]
[Ali sprite walks toward RIGHT edge of screen]
[Screen fades to black over 1 second]
[Text appears center screen, white, monospace font 18px:]
"Ali ne Rs. 500 uthaye. Aur socha — pehle doodh. Phir... Islamabad."
[pause 2s]
[Fade to Chapter 1 intro]
```

### Dialogue Rendering for Home Scene:
- Draw dialogue box: semi-transparent black rectangle `rgba(0,0,0,0.8)` at bottom 25% of canvas (0, 340, 800, 110)
- Speaker name in colored text (Mama = `#FF6B6B`, Ali = `#87CEEB`), font `bold 13px monospace`
- Dialogue text in white, font `13px monospace`, word-wrapped at 70 chars per line
- Small animated cursor `▌` blinking at end of typed text
- Text types character-by-character at 35ms per character
- Click or Space to skip typing and show full line
- Click or Space again to advance to next line

### In game.js:
- Add state `'homeScene'` to the state machine
- When player clicks START on the start screen: set `this.state = 'homeScene'` and call `Story.startHomeScene()`
- In the game loop, when state is `'homeScene'`: call `Story.updateHomeScene(dt)` and `Story.renderHomeScene(ctx)`
- When home scene ends: transition to `this.showChapterIntro(0)`

---

## CHANGE 2: REDUCE ALL LEVEL DISTANCES TO 8000m

### In levels.js — Change ALL level distances

Change every level's distance field to exactly 8000:

```javascript
// Level 1.1 - Mama's Doodh Run
distance: 8000,
scrollSpeed: 80,

// Level 1.2 - Liberty Market Rush  
distance: 8000,
scrollSpeed: 100,
bikeKeyAt: 3000,       // was 5000
chalaanStart: 4000,    // was 6000

// Level 2.1 - Truck Art Gauntlet
distance: 8000,
scrollSpeed: 120,
loadSheddingAt: 3000,  // was 6000

// Level 2.2 - Jhelum Toll Plaza
distance: 8000,
scrollSpeed: 110,
tollDistance: 6000,    // was 14000

// Level 3.1 - Safe City Signal Sprint
distance: 8000,
scrollSpeed: 110,

// Level 3.2 - Final Climb to Monal
distance: 8000,
scrollSpeed: 80,

// Level 4.1 - Margalla Pass Night Ride
distance: 8000,
scrollSpeed: 90,

// Level 4.2 - Murree Bazaar Rush
distance: 8000,
scrollSpeed: 100,

// Level 5.1 - Kaghan Valley River Road
distance: 8000,
scrollSpeed: 75,

// Level 5.2 - Saif-ul-Malook Final Ascent
distance: 8000,
scrollSpeed: 60,
```

Also reduce trigger distances proportionally:
- `loadSheddingAt`: 3000 (was 6000)
- `loadSheddingInterval`: 4000 (was 7000)
- `chalaanStart`: 3000 (was 6000)
- `chalaanInterval`: 4000 (was 8000)
- `bikeKeyAt` for level 1.2: 3000 (was 5000)
- `tollDistance`: 6000 (was 14000)

Economy guarantee trigger:
- In economy.js: change `Game.distance >= 12000` to `Game.distance >= 5000` for the toll prep check

---

## CHANGE 3: COMPLETELY REBUILD THE VISUAL GROUND SYSTEM

### In camera.js — Remove flat ground, add PROPER layered ground with depth

Replace the `renderGround` function entirely with this system:

```
Ground = 3 visual layers stacked:

Layer A — Pavement/Road Surface (top of ground):
  - y position: 395 to 420 (25px thick)
  - For Lahore: warm terracotta/grey pavement #B8A898
    - Draw horizontal crack lines every 60px: ctx.strokeStyle = '#A09080', lineWidth=1
    - Draw random small pebble dots: 3px circles, color #888
  - For GT Road: asphalt #666666
    - White center line dashes: every 80px, 30px long, 3px thick, #FFFFFF
    - Road edge line: solid 2px yellow #FFC107 at y=395
  - For Islamabad: clean concrete #C0C0C0
    - Perfectly even tile joints every 40px: 1px lines #AAAAAA
  - For Murree: mountain path #8B7355
    - Scattered snow patches: white ellipses 20×6px, every 100px
    - Pine needle litter: thin brown lines at random angles
  - For Naran: rocky river path #6B5B45
    - River water visible at far right edge (animated blue strip)
    - Large rocks: grey ellipses 15×10px every 80px

Layer B — Ground Edge (shadow strip):
  - y: 420 to 430 (10px)
  - Dark shadow gradient: from rgba(0,0,0,0.5) to rgba(0,0,0,0)
  - This creates depth between ground and below

Layer C — Below ground (void/underside):
  - y: 430 to 450
  - For Lahore: dark earth #3B2A1A
  - For GT Road: packed gravel #4A4040
  - For Islamabad: concrete base #555
  - For Murree: frozen ground #3E2E2E
  - For Naran: river bank #2E2010
```

Also add these ground DETAIL elements that scroll with the background:

For all cities — add animated footstep dust puffs:
```javascript
// Every 200ms while player is running: emit small grey particle at player foot position
// Particle: circle r=4, color #DDD, alpha fades 1→0 over 0.5s, rises -20px
if (player is running && groundTimer <= 0) {
    Particles.emit(Player.x + Player.w/2, Player.y + Player.h, 1, '#DDCCBB', 4, -20, 0.5);
    groundTimer = 0.1;
}
```

---

## CHANGE 4: FIX BACKGROUND IMAGE RENDERING (Fix Seams, Fix Scale, Fix Depth)

### In camera.js — Rewrite the entire background rendering pipeline

**Problem being fixed:** Images tile with visible hard seams, background is one flat layer with no depth, character looks pasted on top rather than inside the world.

**New rendering approach:**

```
Canvas: 800 × 450px

SKY ZONE (0 to 160px — top 35%):
  - Render only the TOP portion of the far background image
  - Use: ctx.drawImage(img, 0, 0, imgWidth, imgHeight*0.4, 0, 0, 800, 160)
  - This crops to just the sky/top of buildings
  - Scroll speed multiplier: 0.05 (barely moves)

FAR BUILDINGS ZONE (120px to 340px — overlapping sky):
  - Render MIDDLE portion of far background image  
  - Use: ctx.drawImage(img, offset%imgWidth, imgHeight*0.3, imgWidth, imgHeight*0.5, 0, 120, 800, 220)
  - Scroll speed multiplier: 0.2
  - Apply slight darkening: ctx.globalAlpha = 0.85

MID BUILDINGS ZONE (260px to 400px — overlapping far):
  - Render the near/mid background image
  - Scroll speed multiplier: 0.5
  - Full brightness, tiled

GROUND ZONE (395px to 450px):
  - Rendered by the ground system (Change 3 above)
  - This is where the CHARACTER RUNS

NEAR DECORATION ZONE (340px to 420px — in front of mid buildings):
  - Random decorative elements that scroll fast (1.0×)
  - Lahore: market stall canopies (coloured triangles), pushcarts
  - GT Road: roadside dhaba silhouettes, mile markers
  - Islamabad: hedges (green rectangles), lamp posts
  - Render these as simple geometric shapes for now
```

**Seam Fix — Smooth tiling:**
Replace current tiling with this:
```javascript
drawTiledLayer(ctx, imgKey, layerOffset, srcY, srcH, dstY, dstH, alpha) {
    const img = AssetLoader.get(imgKey);
    if (!img) return false;
    
    ctx.save();
    ctx.globalAlpha = alpha || 1;
    
    // Use canvas clipRect to prevent overflow
    ctx.beginPath();
    ctx.rect(0, dstY, 800, dstH);
    ctx.clip();
    
    const drawW = 800; // Stretch to full width always
    const offset = layerOffset % drawW;
    
    // Draw twice: once offset, once shifted right by drawW
    // This eliminates visible seams
    ctx.drawImage(img, 0, srcY, img.width, srcH, -offset, dstY, drawW, dstH);
    ctx.drawImage(img, 0, srcY, img.width, srcH, drawW - offset, dstY, drawW, dstH);
    
    ctx.restore();
    return true;
}
```

**City-specific background configuration:**
```javascript
const bgConfig = {
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
    // Murree and Naran: use procedural vector art (no images yet)
    Murree: { procedural: true },
    Naran:  { procedural: true },
};
```

**Procedural Murree background (since no images):**
```javascript
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
    ctx.moveTo(0, 280);
    const mPoints = [0,280, 80,160, 150,220, 250,120, 320,200, 420,90, 500,180, 620,100, 720,200, 800,150, 800,280];
    for (let i = 0; i < mPoints.length; i += 2) {
        i === 0 ? ctx.moveTo(mPoints[i], mPoints[i+1]) : ctx.lineTo(mPoints[i], mPoints[i+1]);
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

    // Snow: white horizontal streaks in sky
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const snowOffset = (layerOffsets[2] * 1.2) % 800;
    for (let i = 0; i < 30; i++) {
        const sx = (i * 150 + snowOffset) % 850 - 25;
        const sy = (i * 37) % 380;
        ctx.fillRect(sx, sy, 3 + (i % 4), 1);
    }
}
```

**Procedural Naran background:**
```javascript
renderNaranProcedural(ctx, layerOffsets) {
    // Sky: dawn blue
    const skyG = ctx.createLinearGradient(0, 0, 0, 200);
    skyG.addColorStop(0, '#0D47A1');
    skyG.addColorStop(0.6, '#1976D2');
    skyG.addColorStop(1, '#B3E5FC');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, 800, 200);

    // Snow-capped mountain peaks (white tips)
    const peakData = [
        {x: 100, peakY: 60, baseY: 280, w: 200},
        {x: 320, peakY: 20, baseY: 290, w: 280},
        {x: 600, peakY: 50, baseY: 275, w: 240},
    ];
    const mtOffset = (layerOffsets[0] * 0.1) % 800;
    for (const p of peakData) {
        const px = p.x - mtOffset;
        // Rock body
        ctx.fillStyle = '#37474F';
        ctx.beginPath();
        ctx.moveTo(px - p.w/2, p.baseY);
        ctx.lineTo(px, p.peakY);
        ctx.lineTo(px + p.w/2, p.baseY);
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
}
```

---

## CHANGE 5: FIX PLAYER SCALE AND GROUND ALIGNMENT

### In player.js — Fix ground position calculation

Change the `groundY` calculation throughout:
```javascript
// OLD:
this.groundY = 450 - this.foot.h - 16;

// NEW (character stands ON the pavement, not floating):
this.groundY = 395 - this.foot.h; // 395 is top of pavement layer
```

For bike mode:
```javascript
this.groundY = 395 - this.bike.h;
```

This makes the character appear to be walking ON the textured ground rather than floating above a bar.

### Player rendering — Add a DROP SHADOW under the character

In the player render function, before drawing the sprite, draw a shadow ellipse:
```javascript
// Ground shadow (creates sense of contact with floor)
ctx.save();
ctx.globalAlpha = 0.3;
ctx.fillStyle = '#000';
ctx.beginPath();
ctx.ellipse(this.x + this.w/2, 395, this.w * 0.7, 4, 0, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
```

---

## CHANGE 6: FIX OBSTACLE GROUND ALIGNMENT

### In obstacles.js — Fix all obstacle y positions

All ground-based obstacles (dog, gutter, rickshaw, biker, construction cone) must be positioned at:
```javascript
obs.y = 395 - obs.h; // Stand on pavement, not floating
```

Overhead obstacles (wires, speed camera) stay at their current y positions.

---

## CHANGE 7: ADD NEAR-LAYER DECORATIONS THAT SCROLL FAST

### In camera.js — Add fast-scrolling foreground elements

These render ON TOP of the background but BEHIND the player, creating depth.

Add function `renderNearDecorations(ctx, theme, city, layerOffset)`:

**Lahore near decorations:**
```javascript
// Lamp posts every 200px
const postOffset = layerOffset % 200;
for (let x = -200 + postOffset; x < 900; x += 200) {
    // Pole
    ctx.fillStyle = '#444';
    ctx.fillRect(x, 340, 5, 60);
    // Lamp head
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x - 8, 335, 20, 8);
    // Warm glow
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x, 340, 30, 20, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
}
// Random hanging banners between poles
// Coloured triangular pennants
for (let x = -150 + postOffset; x < 850; x += 200) {
    const colours = ['#E53935','#43A047','#1E88E5','#FFD600'];
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
```

**GT Road near decorations:**
```javascript
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
    ctx.ellipse(x, 390, 18, 10, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.ellipse(x + 8, 386, 12, 8, 0, 0, Math.PI*2);
    ctx.fill();
}
```

**Islamabad near decorations:**
```javascript
// Manicured hedges
const hedgeOffset = layerOffset % 120;
for (let x = -120 + hedgeOffset; x < 900; x += 120) {
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(x, 375, 80, 22);
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(x, 375, 80, 5);
}
// Clean lamp posts (different style from Lahore)
const lampOffset = layerOffset % 250;
for (let x = -250 + lampOffset; x < 900; x += 250) {
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x, 330, 6, 70);
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(x - 12, 326, 30, 6);
    ctx.fillStyle = 'rgba(200,230,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 3, 330, 25, 18, 0, 0, Math.PI*2);
    ctx.fill();
}
```

---

## CHANGE 8: FIX HUD LAYOUT — REMOVE DUPLICATE WALLET DISPLAY

### In hud.js and index.html

Currently the wallet shows TWICE — once in the canvas (Rs.865 top-right) and once in the HTML overlay (Rs. 865 top-right yellow box). Remove the HTML overlay wallet box completely.

Keep only the canvas-rendered wallet (in `renderProgress`).

Also fix this in hud.js renderProgress:
```javascript
// Move wallet display to top-right corner of canvas
ctx.textAlign = 'right';
ctx.fillStyle = '#FFD700';
ctx.font = 'bold 12px monospace';
// Draw small background for readability
ctx.fillStyle = 'rgba(0,0,0,0.5)';
ctx.fillRect(690, 4, 100, 18);
ctx.fillStyle = Player.wallet > 0 ? '#FFD700' : '#ff4444';
ctx.font = 'bold 12px monospace';
ctx.fillText('Rs. ' + Utils.formatRupees(Player.wallet), 786, 16);
```

Remove the HTML element with id "walletAmount" from index.html and remove its CSS.

---

## CHANGE 9: ADD DEPTH GRADIENT OVERLAY

### In game.js render() — After drawing everything, before HUD

Add this after `Player.render(ctx)` in the render function:

```javascript
// Atmospheric depth — darken top and bottom slightly
const topGrad = ctx.createLinearGradient(0, 0, 0, 120);
topGrad.addColorStop(0, 'rgba(0,0,0,0.25)');
topGrad.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = topGrad;
ctx.fillRect(0, 0, 800, 120);

// Ground shadow at very bottom
const bottomGrad = ctx.createLinearGradient(0, 380, 0, 450);
bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
bottomGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
ctx.fillStyle = bottomGrad;
ctx.fillRect(0, 380, 800, 70);
```

This creates the illusion of depth and makes the ground feel grounded.

---

## CHANGE 10: MAKE COLLECTIBLES VISIBLE AND ATTRACTIVE

### In obstacles.js — Fix coin/collectible rendering

Currently collectibles are small green "+" circles. Replace with:

```javascript
renderCoin(ctx, coin) {
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() * 0.005 + coin.x);
    
    switch(coin.type) {
        case 'cash10':
        case 'cash50':
        case 'cash100':
        case 'cash500':
            // Draw rupee note as green rectangle with details
            ctx.save();
            ctx.globalAlpha = pulse;
            
            // Try real sprite first
            const noteKey = coin.type === 'cash500' ? 'rupee_note' : 'rupee_note';
            if (AssetLoader.draw(ctx, 'rupee_note', coin.x, coin.y, coin.w, coin.h)) {
                ctx.restore();
                return;
            }
            
            // Fallback: stylized rupee note
            // Background
            ctx.fillStyle = coin.type === 'cash500' ? '#4CAF50' : 
                            coin.type === 'cash100' ? '#2196F3' :
                            coin.type === 'cash50'  ? '#FF9800' : '#9E9E9E';
            ctx.fillRect(coin.x, coin.y, coin.w, coin.h);
            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(coin.x + 1, coin.y + 1, coin.w - 2, coin.h - 2);
            // ₨ symbol
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.min(coin.w, coin.h) - 4}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('₨', coin.x + coin.w/2, coin.y + coin.h - 3);
            
            // Glow ring
            ctx.globalAlpha = pulse * 0.3;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(coin.x - 3, coin.y - 3, coin.w + 6, coin.h + 6);
            
            ctx.restore();
            break;
            
        case 'petrol':
            // Red/orange petrol bottle shape
            ctx.save();
            ctx.globalAlpha = pulse;
            if (AssetLoader.draw(ctx, 'petrol_bottle', coin.x, coin.y, coin.w, coin.h)) {
                ctx.restore(); return;
            }
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(coin.x + 4, coin.y + 4, coin.w - 8, coin.h - 4);
            ctx.fillStyle = '#F44336';
            ctx.fillRect(coin.x + 7, coin.y, coin.w - 14, 6);
            ctx.restore();
            break;
            
        case 'bikeKey':
            // Yellow key with glow
            ctx.save();
            ctx.globalAlpha = pulse;
            if (AssetLoader.draw(ctx, 'key', coin.x, coin.y, coin.w, coin.h)) {
                ctx.restore(); return;
            }
            // Glow
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.w/2, coin.y + 8, 6, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#FFA000';
            ctx.fillRect(coin.x + coin.w/2 - 1, coin.y + 12, 2, coin.h - 12);
            ctx.shadowBlur = 0;
            ctx.restore();
            break;
    }
    
    ctx.textAlign = 'left'; // Reset alignment
}
```

---

## CHANGE 11: FIX STORY SYSTEM — CHAPTER 0 PROLOGUE TRIGGERS CORRECTLY

### In game.js setupMenuListeners():

Change the START button handler:
```javascript
// OLD:
document.getElementById('btnStart').onclick = () => { Audio.resume(); this.showChapterIntro(0); };

// NEW:
document.getElementById('btnStart').onclick = () => { 
    Audio.resume(); 
    this.hideAllScreens();
    this.state = 'homeScene';
    Story.startHomeScene(() => {
        // Called when home scene finishes
        this.showChapterIntro(0);
    });
};
```

### In game.js loop():
```javascript
} else if (this.state === 'homeScene') {
    Story.updateHomeScene(this.deltaTime);
}
```

### In game.js render():
```javascript
if (this.state === 'homeScene') {
    Story.renderHomeScene(ctx);
    return; // Don't render anything else during home scene
}
```

---

## CHANGE 12: SPEED UP SCROLL SPEED GLOBALLY (Game Feels Slow)

### In levels.js — Increase all scroll speeds by 40%

```javascript
Level 1.1: scrollSpeed: 110   (was 80)
Level 1.2: scrollSpeed: 140   (was 100)
Level 2.1: scrollSpeed: 165   (was 120)
Level 2.2: scrollSpeed: 150   (was 110)
Level 3.1: scrollSpeed: 150   (was 110)
Level 3.2: scrollSpeed: 110   (was 80)
Level 4.1: scrollSpeed: 125   (was 90)
Level 4.2: scrollSpeed: 140   (was 100)
Level 5.1: scrollSpeed: 105   (was 75)
Level 5.2: scrollSpeed: 85    (was 60)
```

### In game.js startGame():
```javascript
// OLD:
this.scrollSpeed = 100;
this.targetScrollSpeed = 100;

// NEW:
const levelData = Levels.levels[0];
this.scrollSpeed = levelData ? levelData.scrollSpeed : 110;
this.targetScrollSpeed = this.scrollSpeed;
```

---

## CHANGE 13: ADD OBSTACLE DENSITY NEAR-MISSES — MAKE GAME DANGEROUS

### In obstacles.js — Tighten spawn intervals

The game currently feels safe. Obstacles are too sparse.

```javascript
// Change base spawn interval
this.obstacleSpawnInterval = Math.max(40, 80 / this.currentLevelData.obstacleDensity);
// (was: Math.max(60, 120 / density))

// For high density levels (>= 0.8): add a second obstacle type spawning on a separate timer
if (levelData.obstacleDensity >= 0.8) {
    this.secondarySpawnInterval = Math.max(60, 120 / levelData.obstacleDensity);
    // Spawn secondary obstacles (coins, cameras) independently
}
```

Also: ensure obstacles can be in GROUPS (2 at once with 150px gap):
```javascript
// 20% chance: spawn a pair of obstacles
if (Math.random() < 0.2 && this.canSpawnSecondary()) {
    const primary = this.spawnObstacle(levelData);
    // 150-200px after the primary
    this.queueSecondarySpawn(levelData, 150 + Math.random() * 50);
}
```

---

## CHANGE 14: MAKE THE START SCREEN LOOK GOOD

### In index.html — Update start screen visual

Replace the current start screen HTML with this structure:

```html
<div id="startScreen" class="screen-overlay active">
    <div class="start-inner">
        <div class="game-title-urdu">لاہور سے اسلام آباد</div>
        <div class="game-title">LAHORE TO ISLAMABAD</div>
        <div class="game-subtitle">ایک لڑکے کا سفر · A Boy's Journey</div>
        <div class="story-quote">
            "Har safar ghar se shuru hota hai."<br>
            <span class="quote-en">Every journey begins at home.</span>
        </div>
        <div class="highscore-display" id="highscoreDisplay"></div>
        <button class="btn-main" id="btnStart">▶ SAFAR SHURU KARO</button>
        <button class="btn-secondary" id="btnMuteStart">Sound: OFF</button>
        <div class="controls-hint">
            <span>↑ / SPACE — Jump</span>
            <span>↓ — Duck</span>
            <span>← → — Move</span>
            <span>E — Dismount</span>
            <span>P — Pause</span>
        </div>
    </div>
</div>
```

### In the CSS (index.html `<style>` tag) add:
```css
.game-title-urdu {
    font-family: 'Noto Nastaliq Urdu', serif;
    font-size: 28px;
    color: #FFD700;
    text-align: center;
    margin-bottom: 4px;
    text-shadow: 0 0 20px rgba(255,215,0,0.5);
}
.game-title {
    font-family: monospace;
    font-size: 32px;
    font-weight: bold;
    color: #fff;
    text-align: center;
    letter-spacing: 3px;
    text-shadow: 3px 3px 0 #FF6F00, 6px 6px 0 rgba(0,0,0,0.3);
}
.game-subtitle {
    font-size: 13px;
    color: #FFB300;
    text-align: center;
    margin: 8px 0 20px;
    font-family: monospace;
}
.story-quote {
    background: rgba(0,0,0,0.5);
    border-left: 3px solid #FFD700;
    padding: 12px 16px;
    margin: 0 auto 24px;
    max-width: 380px;
    font-family: monospace;
    font-size: 13px;
    color: #eee;
    font-style: italic;
}
.quote-en {
    color: #aaa;
    font-size: 11px;
}
.btn-main {
    display: block;
    margin: 0 auto 12px;
    padding: 14px 48px;
    background: linear-gradient(135deg, #FF6F00, #FF8F00);
    color: #fff;
    font-family: monospace;
    font-size: 18px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    letter-spacing: 2px;
    box-shadow: 0 4px 0 #BF360C, 0 6px 12px rgba(0,0,0,0.4);
    transition: transform 0.1s, box-shadow 0.1s;
}
.btn-main:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #BF360C, 0 8px 16px rgba(0,0,0,0.4);
}
.btn-main:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #BF360C;
}
.controls-hint {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 20px;
    font-family: monospace;
    font-size: 11px;
    color: #888;
}
```

---

## CHANGE 15: ADD GOOGLE FONT FOR URDU + ADD MANIFEST FOR PWA

### In index.html `<head>`:
```html
<!-- Urdu font -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">

<!-- PWA manifest -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#FF6F00">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

### Create new file: manifest.json
```json
{
    "name": "Lahore to Islamabad",
    "short_name": "LHR to ISB",
    "description": "A Pakistani 2D adventure game — Ali's journey from Lahore to Saif-ul-Malook",
    "start_url": "/index.html",
    "display": "fullscreen",
    "orientation": "landscape",
    "background_color": "#1A0A00",
    "theme_color": "#FF6F00",
    "icons": [
        { "src": "assets/hud/heart icon.png", "sizes": "192x192", "type": "image/png" },
        { "src": "assets/hud/heart icon.png", "sizes": "512x512", "type": "image/png" }
    ],
    "categories": ["games"],
    "lang": "ur-PK"
}
```

---

## SUMMARY OF ALL CHANGES

| # | Change | Files Modified |
|---|---|---|
| 1 | Home scene with Mama scolding Ali (canvas cutscene) | story.js, game.js |
| 2 | Reduce all level distances to 8000m | levels.js, economy.js |
| 3 | Textured ground system (per-city pavement details) | camera.js |
| 4 | Fix background rendering (seams, depth, scale) | camera.js |
| 5 | Fix player ground alignment (stands on pavement) | player.js |
| 6 | Fix obstacle ground alignment | obstacles.js |
| 7 | Near-layer fast-scrolling decorations (lamp posts, hedges, bushes) | camera.js |
| 8 | Remove duplicate wallet HUD display | hud.js, index.html |
| 9 | Depth gradient overlay (atmospheric depth) | game.js |
| 10 | Better collectible rendering (coloured rupee notes, glowing key) | obstacles.js |
| 11 | Home scene wired into game start flow | game.js |
| 12 | Faster scroll speed (40% increase) | levels.js, game.js |
| 13 | Tighter obstacle spacing (more danger) | obstacles.js |
| 14 | New start screen design (Urdu title, quote, styled button) | index.html |
| 15 | PWA manifest + Urdu Google Font | index.html, manifest.json |

Make ALL 15 changes. Do not skip any. After all changes are done, test that:
- Game starts with home scene (Mama silhouette scolding Ali)
- Level 1.1 takes approximately 60-90 seconds to complete
- Background renders without visible seams
- Player stands ON the pavement (not above a purple bar)
- Collectibles are visible and attractive (not plain green dots)
- No duplicate wallet display
