# MASTER ENGINEERING SPECIFICATION: LAHORE TO ISLAMABAD
**Version:** 2.0 — Complete Master Spec (Consolidated)
**Target System:** 2D Side-Scrolling Platformer / Level-Based Endless Hybrid
**Visual Guide:** Modern Indie 16-bit Pixel Art — Vibrant Pakistani Color Palette
**Canvas:** Responsive (Mobile + PC) at 16:9 ratio
**Audio:** Mixed formats (.ogg, .mp3, .wav fallbacks)
**Deployment:** Web (GitHub Pages) → Android (Capacitor/PWA)

---

## TABLE OF CONTENTS
1. [PROJECT IDENTITY & CONFIRMED DECISIONS](#1-project-identity--confirmed-decisions)
2. [SYSTEM ARCHITECTURE & FILE STRUCTURE](#2-system-architecture--file-structure)
3. [CORE GAME LOOP & ENGINE](#3-core-game-loop--engine)
4. [PLAYER STATE MACHINE](#4-player-state-machine)
5. [CONTROLS SYSTEM](#5-controls-system)
6. [LEVEL & MISSION FLOW](#6-level--mission-flow)
7. [HAZARD SYSTEM & COLLISION PROTOCOLS](#7-hazard-system--collision-protocols)
8. [NEW CORE MISSION MODES](#8-new-core-mission-modes)
9. [BRAINSTORMED FEATURES & MECHANICS](#9-brainstormed-features--mechanics)
10. [ECONOMY & HEALTH FRAMEWORK](#10-economy--health-framework)
11. [PERFORMANCE OPTIMIZATION](#11-performance-optimization)
12. [COMPLETE ASSET MANIFEST](#12-complete-asset-manifest)
13. [ASSET SOURCE DIRECTORY](#13-asset-source-directory)
14. [BUILD SEQUENCE](#14-build-sequence)
15. [DEPLOYMENT PLAN](#15-deployment-plan)

---

## 1. PROJECT IDENTITY & CONFIRMED DECISIONS

| Decision | Choice |
|---|---|
| **Game Title** | Lahore to Islamabad |
| **Genre** | 2D Side-Scrolling Platformer / Endless Runner Hybrid |
| **Visual Style** | Modern Indie 16-bit Pixel Art (Celeste / Stardew Valley tier) |
| **Color Palette** | Vibrant Pakistani — turmeric yellow, emerald green, rickshaw orange, truck art magenta, deep sky blue, chai brown |
| **Canvas** | Responsive 16:9 — fills browser window while maintaining ratio |
| **Target FPS** | 60fps (with delta-time physics, works on 30-144Hz) |
| **Controls** | Keyboard (desktop) + Touch controls (mobile) |
| **Audio Format** | .ogg preferred, .mp3 as primary fallback, .wav as secondary fallback |
| **Art Pipeline** | Colored geometric shapes first → swap real 16-bit pixel art later |
| **Asset Location** | `assets/sprites/`, `assets/bg/`, `assets/audio/`, `assets/hud/` |

---

## 2. SYSTEM ARCHITECTURE & FILE STRUCTURE

```
C:\Lhr to isb\
├── MASTER-SPEC.md          ← THIS FILE — single source of truth
├── file1 .md               ← Original spec (reference)
├── file2.md                ← Expansion spec (reference)
├── index.html              ← Entry point: canvas + HUD overlay
├── game.js                 ← Core game loop (requestAnimationFrame, pause/play, delta-time)
├── player.js               ← Player class: states, physics, animation
├── obstacles.js            ← Obstacle pool & spawning system
├── levels.js               ← Level data, missions, city transitions
├── hud.js                  ← UI overlay: hearts, wallet, fuel gauge
├── audio.js                ← Audio manager (Web Audio API + fallbacks)
├── input.js               ← Input handler (keyboard + touch)
├── camera.js              ← 4-layer parallax camera system
├── particles.js           ← Particle effects (rain, dust, sparks)
├── utils.js               ← Helper functions (AABB collision, random, lerp)
├── modes.js               ← Special modes (load shedding, chalaan escape, bonus stage)
├── assets\
│   ├── sprites\           ← Player, enemies, items, NPCs (PNG sprite sheets)
│   ├── bg\                ← Background layers per level (PNG)
│   ├── audio\             ← SFX + BGM (.ogg / .mp3 / .wav)
│   └── hud\               ← Heart icons, fuel bar, rupee icon (PNG)
```

---

## 3. CORE GAME LOOP & ENGINE

### 3.1 Game Loop Architecture
```
requestAnimationFrame(timestamp)
  ├── Calculate deltaTime = (timestamp - lastTimestamp) / 16.67
  ├── if paused → skip update, still render static frame
  ├── UPDATE PHASE:
  │   ├── player.update(deltaTime)
  │   ├── obstacles.update(deltaTime)
  │   ├── camera.update(deltaTime)
  │   ├── particles.update(deltaTime)
  │   ├── collisions.check()
  │   ├── level.checkMission()
  │   └── audio.update()
  ├── RENDER PHASE:
  │   ├── canvas.clear()
  │   ├── camera.renderParallax(ctx)
  │   ├── obstacles.render(ctx)
  │   ├── player.render(ctx)
  │   ├── particles.render(ctx)
  │   ├── hud.render(ctx/HTML layer)
  │   └── specialMode.render(ctx)
  └── requestAnimationFrame(loop)
```

### 3.2 Delta-Time Physics (Δt)
- All movement, gravity, velocities, scroll speeds MULTIPLIED by deltaTime
- Base reference: 60fps = deltaTime of 1.0
- At 120fps: deltaTime = 0.5 (half movement per frame = same speed)
- At 30fps: deltaTime = 2.0 (double movement per frame = same speed)
- Formula: `position += velocity * deltaTime`

### 3.3 Canvas Sizing
- Internal resolution: 800x450 pixels (16:9)
- CSS scales canvas to fill viewport while maintaining 16:9
- `ctx.imageSmoothingEnabled = false` for crisp pixel art scaling at integer multiples
- On mobile: canvas fills width, height auto-calculated from 16:9 ratio
- Touch input coordinates scaled by `canvas.width / canvas.clientWidth`

---

## 4. PLAYER STATE MACHINE

### 4.1 States
```
PLAYER STATES:
├── FOOT_MODE
│   ├── IDLE (standing still)
│   ├── RUNNING (moving right)
│   ├── JUMPING (airborne)
│   ├── DUCKING (down arrow held, hitbox halves)
│   └── HURT (invulnerability flash, 1.5s)
└── BIKE_MODE
    ├── RIDING (moving right, 2.5x scroll speed)
    ├── JUMPING (airborne on bike)
    └── CRASHING (bike destroyed, demote to FOOT)
```

### 4.2 Physics Parameters

**FOOT_MODE:**
| Parameter | Value |
|---|---|
| Bounding Box | 32x64 px (1:2 ratio) |
| Walk Speed | 200 px/s |
| Jump Velocity | -450 px/s (upward) |
| Gravity | 980 px/s² |
| Ducking Box | 32x32 px |

**BIKE_MODE:**
| Parameter | Value |
|---|---|
| Bounding Box | 64x54 px (roughly square) |
| Ride Speed | 500 px/s (2.5x foot speed) |
| Jump Velocity | -350 px/s (lower jump) |
| Gravity | 1960 px/s² (double foot gravity) |
| Parallax Multiplier | 2.5x background scroll speed |

### 4.3 Mode Transitions
- **FOOT → BIKE:** Player overlaps "Bike Key" collectible. 0.5s transition animation (mounting bike).
- **BIKE → FOOT (Crash):** Obstacle collision in bike mode → `demoteToFoot()` → 1.5s invulnerability flash.
- **BIKE → FOOT (Fuel Empty):** Fuel gauge hits 0 → bike slows to stop → player dismounts (1s animation).
- **BIKE → FOOT (Manual):** Not allowed — bike persists until crash or fuel empty.

---

## 5. CONTROLS SYSTEM

### 5.1 Keyboard Controls (Desktop)
| Key | Action |
|---|---|
| Arrow Up / W / Space | Jump |
| Arrow Down / S | Duck (foot) / Brake (bike — future) |
| Arrow Left / A | Move left |
| Arrow Right / D | Move right (auto-scroll handles forward) |
| P / Escape | Pause |
| M | Toggle audio mute |

### 5.2 Touch Controls (Mobile)
- Left half of screen: **Left/Up/Down** touch zones
- Right half of screen: **Right/Jump** touch zones
- On-screen buttons rendered as semi-transparent overlays:
  - Bottom-left: Left arrow (rectangle, 60x60px)
  - Bottom-center: Down arrow (rectangle, 60x60px)
  - Bottom-right: Right arrow + Jump button (60x60px each)
- Buttons hide after 2 seconds of no touch, reappear on first tap
- Responsive positioning: buttons scale to viewport width

### 5.3 Input Manager Architecture
```
input.js:
├── keys: {}                     ← key state map
├── touches: []                  ← active touch points
├── touchButtons: {}
├── isPressed(key) → boolean
├── justPressed(key) → boolean   ← single-frame press detection
├── onKeyDown(event)
├── onKeyUp(event)
├── onTouchStart(event)
├── onTouchEnd(event)
└── update()                     ← process touch zones
```

---

## 6. LEVEL & MISSION FLOW

### 6.1 Level Overview

| Level | City | Theme | Visual Mood |
|---|---|---|---|
| 1 | Lahore | Mohallah / Local Hustle | Warm dawn, golden, chaotic streets |
| 2 | GT Road | Highway / Inter-City Sprint | Hot midday, open fields, dusty |
| 3 | Islamabad | Capital / Organized Finish | Cool dusk, clean, green, structured |

### 6.2 Level Transitions
- Each level = 3000 distance units
- Between levels: "Ammi's Pocket Money Hunt" bonus stage (15 seconds)
- After bonus: auto-transition to next city with loading screen

### 6.3 Sub-Level 1.1: Mama's Doodh Run
- **State Lock:** FOOT_MODE only
- **Starting Cash:** Rs. 500
- **Distance to clear:** 3,000 units
- **Win Condition:** Overlap milk shop asset AND wallet ≥ Rs. 500
- **Obstacles allowed:** Stray dogs (low density), gutters

### 6.4 Sub-Level 1.2: Liberty Market Rush
- **New Elements:** Bike Key collectible spawns at 1500 units
- **New Obstacles:** Qingqi rickshaws, moving vehicles
- **First bike unlock:** Player rides for first time
- **Distance to clear:** 3,000 units
- **Win Condition:** Reach distance threshold

### 6.5 Sub-Level 2.1: The Truck Art Gauntlet
- **Baseline Scroll:** High speed (1.5x normal)
- **New Element:** Petrol Bottle collectibles (restore 25% fuel)
- **Obstacle density:** High
- **Obstacles:** All previous + speed cameras (fine Rs. 500 in bike mode)

### 6.6 Sub-Level 2.2: Jhelum Toll Plaza Checkpoint
- **End Barrier:** Horizontal toll gate spawns at 2800 units
- **Scrolling freezes** at barrier
- **Two options:**
  - **A)** Pay Rs. 1000 to open gate (auto-clears)
  - **B)** Pixel-perfect max-velocity jump over barrier (high risk, high reward)
- **Distance to clear:** 3,500 units

### 6.7 Sub-Level 3.1: The Safe City Signal Sprint
- **New Hazard:** Speed cameras (overhanging)
- **Bike mode penalty:** Passing under camera in bike mode → flash + Rs. 500 fine
- **Distance to clear:** 3,000 units

### 6.8 Sub-Level 3.2: The Final Climb to Monal
- **Physics Modification:** Inverse incline — constant backward pull (-50 px/s²)
- **Visual:** Margalla Hills filling horizon, road tilts upward
- **Win Condition:** Reach 4,000 units trigger → MONAL restaurant asset
- **Victory Sequence:** Player stops, celebration particles, "BOHAT HARD!" text, final score

---

## 7. HAZARD SYSTEM & COLLISION PROTOCOLS

### 7.1 Hazard Definitions

| Hazard | Type | Size (px) | Behavior | Foot Damage | Bike Damage |
|---|---|---|---|---|---|
| Stray Dog (Gali Ka Kutta) | Moving (ground) | 40x28 | Idles right edge → sprints left when player in range | -1 Heart | Demote to Foot |
| Open Gutter (Gattar) | Static (ground pit) | 48x16 | Fixed rectangle in ground, must jump over | -1 Heart | Demote to Foot |
| Qingqi Rickshaw | Moving (mid-height) | 56x44 | Travels right→left, variable speed, alternating | -1 Heart | Demote to Foot |
| Careless Bike | Moving (mid-height) | 40x36 | Same as rickshaw, faster/smaller | -1 Heart | Demote to Foot |
| Speed Camera | Static (overhead) | 24x36 | Only active in bike mode → fine Rs. 500 + flash | No effect | Fine + flash |
| Toll Barrier | Static (ground) | 200x40 | Blocks path, must pay or jump over | Stops player | Stops player |
| Overhead Wires | Static (high) | 200x8 | High position, only hits if player is in bike jump | No effect | Demote to Foot |

### 7.2 Collision Detection — AABB (Axis-Aligned Bounding Box)
```
function checkAABB(rect1, rect2):
    return (rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y)
```

### 7.3 Collision Execution Branching
```
When AABB overlap detected:
  1. IF player state === BIKE_MODE:
     → call demoteToFoot()
     → remove obstacle from active array (pool recycle)
     → start 1.5s invulnerability (alpha blink 0.3s interval)
  2. IF player state === FOOT_MODE:
     → deduct 1 Heart from hearts array
     → trigger screen shake (2px offset, 0.2s decay)
     → IF hearts === 0 → trigger Game Over
```

### 7.4 Object Pooling System
```
Pool = {
    obstacles: [10 inactive slots],
    coins: [20 inactive slots],
    particles: [50 inactive slots]
}
Spawn(from pool):
  → find inactive object in pool
  → set active = true, reset position to right edge
  → set type/variant randomly
Recycle(object):
  → set active = false
  → move off-screen (x = -100)
  → reset velocity/state
```

---

## 8. NEW CORE MISSION MODES

### 8.1 "WAPDA Load Shedding" Survival Mode
- **Trigger:** Specific night sub-levels (flag: `isLoadSheddingActive: true`)
- **Effect:** Canvas tinted 90% black. ONLY area around player visible via cone of light.
- **Foot Mode Light:** Handheld torch cone (triangle, 60° spread, bright yellow)
- **Bike Mode Light:** Headlight beam (narrower 30° spread, farther reach, flickers when fuel low)
- **Audio:** Cricket chirps, distant generator hum, occasional dog bark
- **Hazards:** Only appear within light cone. Player reacts faster.

### 8.2 "Chalaan Escape" Time-Attack Mode
- **Trigger:** Flag `isChaseModeActive: true` in specific sub-levels
- **Mechanic:** Persistent "Traffic Warden" sprite chasing from left edge
- **Warden Speed:** Always 10% faster than player's current speed
- **Timer:** 45-second countdown displayed on HUD
- **Penalty:** Hitting any obstacle stuns player (0.5s slow) → Warden catches up → -Rs. 500 fine → timer resets to 45s
- **Visual:** Warden has flashing red/blue lights, angry face
- **Win:** Survive 45s without being caught → bonus Rs. 1000 reward

### 8.3 "Ammi's Pocket Money Hunt" Bonus Stage
- **Trigger:** After completing any major level milestone
- **Scene:** Transition to home/village backdrop (no hazards)
- **Duration:** 15 seconds
- **Mechanic:** Currency notes (Rs. 10, Rs. 100, Rs. 500) rain diagonally from sky
- **Controls:** Move left/right to collect as many as possible
- **Visual:** Bright celebratory colors, sparkle particles on collect
- **Audio:** Happy music, children laughing, "Ammi" voice saying "Shabash!"
- **End:** Timer hits 0 → sum collected added to wallet → next level auto-loads

---

## 9. BRAINSTORMED FEATURES & MECHANICS

### 9.1 Truck Art Customization Garage
- **When:** Between level screens
- **Spend:** Rs. to upgrade bike
- **Upgrades:**
  - Bigger fuel tank (+20% max fuel) = Rs. 500
  - Shield plate (one free bike save) = Rs. 800
  - Speed boost (+10% bike speed) = Rs. 300
  - Headlight upgrade (brighter in load shedding) = Rs. 200
- **Visual:** Simple 3-option shop screen with pixel art bike parts

### 9.2 Chai Power-Up
- **Collect:** Chai cup sprite (16x16)
- **Effect:** 5 seconds of double speed + invincibility
- **Visual:** Steam trail behind player, warm orange glow
- **Audio:** Sip sound + happy "Aaaah!" exclamation

### 9.3 Jugaad Repair
- **When:** Bike destroyed, player on foot
- **Search:** Roadside mechanic stall (rare spawn, ~5% chance per 500 units)
- **Cost:** Rs. 200 to repair bike
- **Visual:** Blue overalls NPC, tire pile, "Jugaad" sign

### 9.4 Parchi System (Lottery)
- **Collect:** "Parchi" tickets (rare spawn, ~2% chance per obstacle kill)
- **Trigger:** Collect 3 parchis → auto-lottery at level end
- **Reward:** Random: Rs. 200 / Rs. 500 / Rs. 1000 / nothing
- **Visual:** Small paper slip sprite with "PARCHI" text

### 9.5 Slippery Sabzi Mandi Zone
- **Trigger:** Random zone marker "Sabzi Mandi" appears on ground
- **Effect:** Ground friction drops 50% — player slides further on landing
- **Duration:** 200 units distance
- **Visual:** Vegetable crates, banana peels, wet ground texture

### 9.6 Monsoon Flood Mode
- **Trigger:** Flag `isMonsoonActive: true` in rain levels
- **Effect:** Water level rises 1px/sec from bottom of screen
- **Danger:** Standing water pools become deeper hazards
- **Counter:** Higher ground only reachable via bike mode jumps
- **Visual:** Rain particles, dark clouds, lightning flashes

### 9.7 SMS Notifications (Personality Popups)
- **Trigger:** Random intervals (every 500-1000 units)
- **Content:** Pakistani cultural text messages:
  - "Ammi: Doodh le aana, jaldi karo!"
  - "Abbu: GT Road pe dhyan se, speed mat karo"
  - "Dost: Kahan ho yar? Party hai aaj!"
  - "Wardan: Chalaan kat di, 500 fine"
- **Visual:** Phone notification bubble slides in from top, 2s display, fades out
- **No gameplay effect** — purely for immersion and humor

### 9.8 Billboard Ads (Pakistani Brand Parodies)
- **When:** Level 2 (GT Road) backgrounds
- **Content:** Parody ads on highway billboards:
  - "Cocomo — Biscuit nahi, journey ka saathi!"
  - "Tapal Danedar — Chay ke 2 minute, zindagi badal do"
  - "QMobile — Pakistan ka apna phone"
  - "Servis — Shoes that go the distance"
- **Visual:** Large billboard structures in mid-ground parallax layer

### 9.9 Crowd Reactions
- **When:** Near shop sprites in Lahore level
- **Behavior:** Small NPC sprites scatter when bike passes at speed
- **Types:**
  - Chai wala — ducks behind stall
  - Kids — wave and cheer
  - Old uncle — shakes fist angrily
  - Dog — barks and chases for 2 seconds

### 9.10 Road Construction Zone
- **Trigger:** Random zone marker
- **Visual:** Orange/white traffic cones, "Under Construction" board in Urdu
- **Effect:** 30% speed reduction in zone
- **Detour:** Upper path available via jumping onto raised platform

### 9.11 Leaderboard (localStorage)
- **Stored data:** High score (max distance), max wallet ever held, max level reached
- **Display:** End-game screen shows personal best
- **Future:** Firebase/API for global leaderboard

### 9.12 Daily Challenge Mode
- **Seed:** Date-based random seed (same level for everyone that day)
- **Start:** Always fresh, no upgrades carried over
- **Goal:** Highest distance + wallet combo
- **Share:** Auto-generates text: "Today I scored {x} in Lahore to Islamabad! Beat me!"

---

## 10. ECONOMY & HEALTH FRAMEWORK

### 10.1 Hearts (Lives)
- **Max:** 5 hearts
- **Display:** Array of 5 heart icons in HUD top-left
- **Loss:** -1 per obstacle collision in FOOT_MODE
- **Gain:** Not possible (permadeath health system)
- **Game Over:** All 5 hearts depleted → show "Game Over" screen with distance + wallet total

### 10.2 Wallet (Rs.)
- **Initial:** Rs. 0 (except Mama's Doodh Run: Rs. 500)
- **Gain:** Collect cash sprites scattered on ground (Rs. 10 / 50 / 100 variants)
- **Spend:** Toll plaza (Rs. 1000), bike repair (Rs. 200), upgrades (Rs. 200-800)
- **Fine:** Speed camera (Rs. 500), Chalaan catch (Rs. 500)
- **Display:** Top-right HUD — "Rs. XXXX" in bold pixel font

### 10.3 Fuel Gauge
- **Max:** 100.0 float
- **Active:** ONLY during BIKE_MODE
- **Decay:** 5 units/sec while riding
- **Restore:** Petrol Bottle collectible → +25 fuel
- **Empty:** Bike slows to stop → forced demote to FOOT
- **Display:** Top-center HUD — gradient bar (green→yellow→red), "FUEL" label

---

## 11. PERFORMANCE OPTIMIZATION

### 11.1 Delta-Time Physics (Δt)
- See Section 3.2 — all physics frame-independent

### 11.2 Object Pooling
- See Section 7.4 — no garbage collection spikes

### 11.3 4-Layer Parallax with Culling
- Only render tiles/objects within visible camera bounds
- Off-screen objects: skip both update AND render

### 11.4 Texture Atlas (Future — with real art)
- All sprites packed into single sprite sheet PNG
- Single `drawImage` call per layer instead of per-sprite
- Reduces GPU state changes

### 11.5 Dirty Rectangle Rendering (Optional)
- Track which screen regions changed
- Only redraw those regions instead of full canvas clear
- Helps on very low-end mobile devices

### 11.6 Preloading & Caching
- Preload screen: "Lahore → Islamabad" with retro loading bar
- Lazy-load: Only load current level's background assets
- Service Worker: Cache all assets after first load (instant replay)

### 11.7 Audio Optimization
- Load audio files on-demand (not all at startup)
- Use Web Audio API with decoded buffers (faster than `<audio>` elements)
- Audio sprites: combine short SFX into single file with offset timestamps

### 11.8 Compression
- Images: TinyPNG (50-80% size reduction)
- Code: Minify JS files for production
- Server: Enable gzip/Brotli compression

---

## 12. COMPLETE ASSET MANIFEST

### 12.1 SPRITES — Player & Vehicles

| # | Asset | Size (px) | Frames | Format | Description |
|---|---|---|---|---|---|
| P1 | Player Foot — Idle | 32x64 | 1 | PNG | Young Pakistani man, white shalwar kameez, sandals, facing right |
| P2 | Player Foot — Run Cycle | 32x64 | 4 | PNG | Sprint cycle: contact, push, swing, flight |
| P3 | Player Foot — Jump | 32x64 | 1 | PNG | Mid-air, legs tucked, arms up |
| P4 | Player Foot — Duck | 32x32 | 1 | PNG | Crouched, knees bent, half bounding box |
| P5 | Player Foot — Hurt | 32x64 | 1 | PNG | Recoil pose, blinking/flashing red tint |
| P6 | Player Bike — Idle | 64x54 | 1 | PNG | 70cc motorcycle (Honda CD 70), rider upright |
| P7 | Player Bike — Riding | 64x54 | 3 | PNG | Motion frames, slight wheel spin, lean |
| P8 | Player Bike — Jump | 64x54 | 1 | PNG | Airborne, both wheels off ground |
| P9 | Player Bike — Crash | 64x54 | 1 | PNG | Skidding, sparks, rider falling |

### 12.2 SPRITES — Collectibles

| # | Asset | Size (px) | Description |
|---|---|---|---|
| C1 | Bike Key | 16x16 | Golden key with bike icon, sparkle glow |
| C2 | Petrol Bottle | 16x24 | Green bottle, red POL label |
| C3 | Cash (Rs. 10) | 12x16 | Small green note, "10" visible |
| C4 | Cash (Rs. 50) | 12x16 | Medium green note, "50" visible |
| C5 | Cash (Rs. 100) | 12x16 | Large green note, "100" visible |
| C6 | Chai Cup | 16x16 | Red chai cup, steam wisps |
| C7 | Parchi Ticket | 12x16 | Small paper slip, "PARCHI" text |
| C8 | Petrol Can (full) | 24x24 | Larger can, 100% restore future use |

### 12.3 SPRITES — Hazards

| # | Asset | Size (px) | Description |
|---|---|---|---|
| H1 | Stray Dog — Idle | 40x28 | Brown/gray street dog, sitting, side profile |
| H2 | Stray Dog — Sprinting | 40x28 | Running, mouth open, aggressive |
| H3 | Open Gutter (Gattar) | 48x16 | Dark pit, broken concrete edges, slime |
| H4 | Qingqi Rickshaw | 56x44 | Green/yellow 3-wheeler, driver silhouette |
| H5 | Careless Bike Rider | 40x36 | Rider on bike, no helmet |
| H6 | Speed Camera | 24x36 | White box, metal pole, flash indicator |
| H7 | Toll Barrier | 200x40 | Red/yellow striped boom gate |
| H8 | Overhead Wires | 200x8 | Thick black cable bundle |
| H9 | Traffic Warden (Chalaan) | 48x56 | Khaki uniform, helmet, waving baton |
| H10 | Construction Cone | 16x24 | Orange/white traffic cone |

### 12.4 SPRITES — Background Layers (Per Level)

| # | Asset | Size (px) | Level | Layer |
|---|---|---|---|---|
| B1 | Lahore — Sky + Dawn | 800x200 | L1 | 4 (far) |
| B2 | Lahore — Badshahi Masjid silhouette | 800x200 | L1 | 4 (far detail) |
| B3 | Lahore — Mid buildings | 800x200 | L1 | 3 (mid) |
| B4 | Lahore — Orange Line Metro | 800x200 | L1 | 3 (mid transit) |
| B5 | Lahore — Shops + Street | 800x120 | L1 | 2 (near) |
| B6 | Lahore — Pavement + Details | 800x60 | L1 | 1 (foreground) |
| B7 | GT Road — Sky + Haze | 800x200 | L2 | 4 (far) |
| B8 | GT Road — Fields + Farms | 800x200 | L2 | 3 (mid) |
| B9 | GT Road — Highway + Trucks | 800x200 | L2 | 2 (near) |
| B10 | GT Road — Roadside + Gravel | 800x60 | L2 | 1 (foreground) |
| B11 | Islamabad — Sky + Margalla Hills | 800x200 | L3 | 4 (far) |
| B12 | Islamabad — Faisal Mosque silhouette | 800x200 | L3 | 4 (far detail) |
| B13 | Islamabad — Green avenues | 800x200 | L3 | 3 (mid) |
| B14 | Islamabad — Corporate buildings | 800x200 | L3 | 2 (near) |
| B15 | Islamabad — Clean sidewalk | 800x60 | L3 | 1 (foreground) |
| B16 | Home/Village — Bonus Stage BG | 800x450 | Bonus | Full |

### 12.5 SPRITES — HUD & UI

| # | Asset | Size (px) | Description |
|---|---|---|---|
| U1 | Heart — Full | 12x12 | Red pixel heart |
| U2 | Heart — Empty | 12x12 | Gray outline heart |
| U3 | Fuel Bar Background | 120x16 | Dark gray bar frame |
| U4 | Fuel Bar Fill — Green | 120x16 | Green gradient fill |
| U5 | Fuel Bar Fill — Yellow | 120x16 | Yellow gradient fill |
| U6 | Fuel Bar Fill — Red | 120x16 | Red gradient fill |
| U7 | Rupee Icon | 12x12 | "Rs." logo for wallet |
| U8 | Touch Button — Arrow Up | 60x60 | Semi-transparent up arrow |
| U9 | Touch Button — Arrow Down | 60x60 | Semi-transparent down arrow |
| U10 | Touch Button — Arrow Left | 60x60 | Semi-transparent left arrow |
| U11 | Touch Button — Arrow Right | 60x60 | Semi-transparent right arrow |
| U12 | Touch Button — Jump | 60x60 | Semi-transparent jump icon |

### 12.6 SPRITES — NPCs & Decorative

| # | Asset | Size (px) | Description |
|---|---|---|---|
| N1 | Chai Wala NPC | 24x40 | White suit, tea tray in hand |
| N2 | Old Uncle NPC | 24x40 | Older man, stick, sitting on charpoy |
| N3 | Kid NPC | 16x24 | Small boy/girl waving |
| N4 | Fruit Vendor | 32x40 | Man behind cart of oranges/mangoes |
| N5 | Milk Shop (Doodh Wala) | 64x56 | Traditional shop, clay pots, hand-painted sign |
| N6 | Billboard Structure | 80x32 | Highway billboard frame |
| N7 | Dhaba / Chaap Shop | 80x64 | Rustic roadside eatery |
| N8 | Milestone Sign | 40x48 | Green sign "ISLAMABAD 200 KM" |
| N9 | Monal Restaurant Sign | 64x48 | Finish line, "MONAL" text, lanterns |

### 12.7 PARTICLES

| # | Asset | Size (px) | Description |
|---|---|---|---|
| X1 | Rain Drop | 4x8 | Blue-white streak |
| X2 | Dust Particle | 4x4 | Brown circle |
| X3 | Spark | 2x2 | Yellow/white dot |
| X4 | Coin Sparkle | 3x3 | Gold star shape |
| X5 | Smoke Puff | 8x8 | Gray circle, semi-transparent |
| X6 | Light Cone (Load Shedding) | Dynamic | Procedurally drawn (see modes.js) |

### 12.8 AUDIO — ALL SOUNDS

| # | Asset | Type | Duration | Format | Description |
|---|---|---|---|---|---|
| A1 | Footstep Loop | SFX Loop | 0.4s | .ogg / .mp3 | Quick slap-slap of chappal on concrete, lo-fi |
| A2 | Jump Up | SFX | 0.3s | .ogg / .mp3 | Upward swoosh + "huh!" grunt, 8-bit chirp |
| A3 | Landing Thud | SFX | 0.15s | .ogg / .mp3 | Dull thump, slight reverb |
| A4 | Bike Kickstart | SFX | 1.5s | .ogg / .mp3 | Metal kick → sputter → chug-chug idle |
| A5 | Bike Engine Loop | SFX Loop | 2.0s | .ogg / .mp3 | Low 70cc hum, rattly, seamless |
| A6 | Bike Engine Sputter (low fuel) | SFX Loop | 1.5s | .ogg / .mp3 | Cutting in/out, desperate |
| A7 | Bike Crash | SFX | 0.8s | .ogg / .mp3 | Scrape + sparks + thud |
| A8 | Collect Cash | SFX | 0.2s | .ogg / .mp3 | "Ka-ching" two-note chime |
| A9 | Collect Bike Key | SFX | 0.3s | .ogg / .mp3 | Metallic jingle + ignition click |
| A10 | Collect Petrol | SFX | 0.25s | .ogg / .mp3 | "Glug-glug" + rev up |
| A11 | Dog Bark + Sprint | SFX | 0.5s | .ogg / .mp3 | Sharp "BHOW!" + paw patter |
| A12 | Gutter Splash | SFX | 0.3s | .ogg / .mp3 | Wet splash, gross squelch |
| A13 | Rickshaw Horn | SFX | 0.4s | .ogg / .mp3 | "PAAAMP" loud horn, distorted |
| A14 | Speed Camera Flash | SFX | 0.2s | .ogg / .mp3 | "BZZT" + high whine |
| A15 | Heart Loss | SFX | 0.3s | .ogg / .mp3 | Low thud + flatline beep |
| A16 | Game Over | SFX | 2.0s | .ogg / .mp3 | Slow harmonium note fading, "sab khatam" |
| A17 | Level Complete | SFX | 1.5s | .ogg / .mp3 | Dhol beat + crowd cheer "BOHAT HARD!" |
| A18 | Chai Power-Up | SFX | 0.4s | .ogg / .mp3 | Hot sip sound + "Aaaah!" |
| A19 | Parchi Collect | SFX | 0.2s | .ogg / .mp3 | Paper flutter + ding |
| A20 | Warden Siren | SFX Loop | 3.0s | .ogg / .mp3 | "Pee-poo pee-poo" police siren |
| A21 | Lahore Ambient BGM | BGM Loop | 30s | .ogg / .mp3 | Azaan echo, traffic, vendors, dogs, warm chaotic |
| A22 | GT Road Ambient BGM | BGM Loop | 30s | .ogg / .mp3 | Whooshing trucks, wind, dhaba radio, dry open |
| A23 | Islamabad Ambient BGM | BGM Loop | 30s | .ogg / .mp3 | Bird chirps, wind through trees, city hum, peaceful |
| A24 | Bonus Stage Music | BGM Loop | 15s | .ogg / .mp3 | Happy carnival music, children laughing |
| A25 | Menu Theme | BGM Loop | 15s | .ogg / .mp3 | Relaxed sitar + tabla, welcoming |

---

## 13. ASSET SOURCE DIRECTORY

### 13.1 Free Image / Sprite Creation
| Source | URL | Best For |
|---|---|---|
| Leonardo.ai | https://leonardo.ai | AI-generate base art → downscale to 16-bit. 150 free tokens/day |
| Bing Image Creator | https://bing.com/create | Free AI art generation for concepts |
| Aseprite | https://aseprite.org | Best 16-bit pixel art editor. $20 (highly recommended) |
| LibreSprite | https://libresprite.github.io | Free Aseprite fork — all features, open source |
| Piskel | https://piskelapp.com | Free browser-based pixel art + animation |
| Pixelorama | https://github.com/Orama-Interactive/Pixelorama | Free open source pixel art editor |
| Lospec Palette List | https://lospec.com/palette-list | Curated 16-bit color palettes |
| Kenney.nl | https://kenney.nl | 40,000+ free CC0 game assets |
| OpenGameArt.org | https://opengameart.org | Community pixel art, tilesets, characters |
| itch.io Game Assets | https://itch.io/game-assets | Free/PWYW sprite packs |
| Game-icons.net | https://game-icons.net | 4000+ free icons for HUD/UI |
| TinyPNG | https://tinypng.com | Compress PNGs 50-80% for web |

### 13.2 Free Audio Creation
| Source | URL | Best For |
|---|---|---|
| Freesound.org | https://freesound.org | Real recordings: engines, dogs, rain, traffic (CC0/BY) |
| JSFXR | https://sfxr.me | 8-bit/retro SFX generator — jumps, coins, hits (browser) |
| ChipTone | https://sfbgames.com/chiptone | Advanced retro SFX synth (browser) |
| Audacity | https://audacityteam.org | Free audio editor — trim, loop, layer, mix |
| Pixabay Audio | https://pixabay.com/music | Royalty-free music + SFX, no attribution needed |
| Bensound | https://bensound.com | Royalty-free game music with attribution |
| Mixkit | https://mixkit.co | Free SFX + music, no attribution |
| ElevenLabs Sound Effects | https://elevenlabs.io | AI sound generation from text prompts (free tier) |
| OggConverter | https://oggconverter.com | Convert .wav/.mp3 to .ogg |
| Your Phone Recorder | Built-in | Record real 70cc bike, dogs, horns for authenticity |

### 13.3 Free Deployment Tools
| Source | URL | Best For |
|---|---|---|
| GitHub Pages | https://pages.github.com | Free static web hosting for the game |
| Vercel | https://vercel.com | Free web deployment from GitHub repo |
| Netlify | https://netlify.com | Free drag-and-drop web deployment |
| Capacitor | https://capacitorjs.com | Wrap HTML5 game into Android APK (free) |
| PWA Builder | https://pwabuilder.com | Convert web game to Android/iOS app (free) |
| Canva | https://canva.com | Store screenshots, LinkedIn posts (free) |
| OBS Studio | https://obsproject.com | Record gameplay trailers (free) |

---

## 14. BUILD SEQUENCE

### Phase 1: Engine Foundation (Colored Shapes Mode)
```
Step 1: index.html — canvas setup + HTML overlay HUD structure
Step 2: game.js — game loop, deltaTime, pause, state manager
Step 3: input.js — keyboard + touch control mapping
Step 4: player.js — foot mode, bike mode, state machine
Step 5: obstacles.js — object pool, 4 hazard types, AABB collision
Step 6: levels.js — level data, distance tracking, mission conditions
Step 7: camera.js — 4-layer parallax rendering with colored rects
Step 8: hud.js — hearts, wallet, fuel gauge render
Step 9: audio.js — sound manager with format fallback chain
Step 10: particles.js — rain, dust, sparks, coin sparkle
Step 11: modes.js — load shedding, chalaan escape, bonus stage
Step 12: utils.js — AABB collision, random, lerp, clamp
```

### Phase 2: Polish & Integration
```
Step 13: Level completion gate logic (milk shop, toll plaza, climb)
Step 14: "Ammi's Pocket Money" bonus stage integration
Step 15: WAPDA Load Shedding cone rendering + physics
Step 16: Chalaan Escape chase logic + timer
Step 17: UI polish — transitions between levels, game over screen
Step 18: Particle effect integration with modes
Step 19: Pause menu + audio mute toggle
Step 20: Game balance — spawn rates, distances, cash values
```

### Phase 3: Art Replacement (When Assets Are Ready)
```
Step 21: Replace colored rects with sprite sheets (player, hazards)
Step 22: Replace colored BG rects with parallax tile PNGs
Step 23: Replace HUD shapes with UI sprite icons
Step 24: Integrate audio files into audio.js
Step 25: Texture atlas creation (single sprite sheet)
```

### Phase 4: Deployment
```
Step 26: Minify all JS files
Step 27: Compress all PNGs via TinyPNG
Step 28: Set up GitHub repo + push
Step 29: Enable GitHub Pages
Step 30: Test on mobile browser
Step 31: Wrap with Capacitor → generate Android APK
Step 32: Publish to Play Store
```

---

## 15. DEPLOYMENT PLAN

### 15.1 Web (GitHub Pages)
1. Create GitHub repo: `LahoreToIslamabad`
2. Push all code
3. Enable Pages from `main` branch root
4. Game live at: `https://{username}.github.io/LahoreToIslamabad/`

### 15.2 Android (Capacitor)
1. `npm install @capacitor/cli @capacitor/core @capacitor/android`
2. `npx cap init LahoreToIslamabad`
3. `npx cap add android`
4. Copy game files to `www/` folder
5. `npx cap sync`
6. `npx cap open android` → Build APK in Android Studio

### 15.3 PWA (Alternative to Play Store)
1. Add `manifest.json` with icons + app name
2. Add Service Worker for offline caching
3. Users can "Add to Home Screen" from browser
4. PWABuilder.com can turn this into APK without Android Studio

### 15.4 Play Store Upload
1. Generate signed APK/Bundle via Capacitor
2. Create Play Store account ($25 one-time fee)
3. Upload with screenshots (Canva), description, category
4. Game name: "Lahore to Islamabad — The Desi Road Trip"

---

## APPENDIX: HOW TO USE THIS SPEC WITH AN AI

### For OpenCode / Any AI Assistant
1. Start each session by referencing: "Read MASTER-SPEC.md"
2. Work through BUILD SEQUENCE step by step (Phase 1 → Phase 4)
3. Each step = one atomic commit to GitHub
4. For sprite generation: share ASSET MANIFEST with AI, ask it to generate prompts for Leonardo/Bing
5. For questions: refer to this spec. If something isn't covered, AI asks you.
6. After every meaningful change, you say "commit and push" → AI runs:
   ```
   git add .
   git commit -m "[Phase X Step Y]: Description"
   git push origin main
   ```

### Atomic Commit Convention
| Prefix | Meaning |
|---|---|
| `[P1S1]` | Phase 1, Step 1 |
| `[P1S2]` | Phase 1, Step 2 |
| `[FIX]` | Bug fix |
| `[ASSET]` | Art/sound integration |
| `[DEPLOY]` | Deployment configuration |

---

*End of MASTER-SPEC.md — Version 2.0 — Single Source of Truth for Lahore to Islamabad*
