# LAHORE TO ISLAMABAD — MASTER GAME SPEC
**Version:** 5.2 — Story Mode + Pseudo-3D Depth System
**Genre:** 2D Side-Scrolling Platformer + Story Adventure
**Platform:** Web (PC + Mobile) -> Android App
**Visual Style:** 16-bit Pixel Art + Pseudo-3D Depth — Vibrant Pakistani Color Palette
**Canvas:** 800 x 450px internal resolution, CSS-scaled to fill viewport

---

## WHAT THIS GAME IS

A **story-driven 2D side-scrolling adventure** about Ali, a 16-year-old boy from Lahore who dreams of seeing Islamabad. The journey continues beyond Islamabad to Murree, then Naran Valley. The game has chapters, dialogue, a Mama character, an economy system, and a pseudo-3D depth effect.

**Core Loop:**
> Watch story beat -> Feel motivated -> Run level -> Earn money -> Unlock next chapter

---

## CURRENT IMPLEMENTATION STATUS

### What is DONE (playable)

| System | Status | Details |
|---|---|---|
| Game engine | DONE | game.js: loop, state machine (13 states), collision, scoring |
| Player | DONE | player.js: foot + bike modes, 8 sprite states, physics, shadows |
| Obstacles | DONE | obstacles.js: 19 hazard types, 4-state dog AI, depth scaling, lane variation |
| Camera/Background | DONE | camera.js: pseudo-3D parallax (4 layers), tiled image rendering, procedural Murree/Naran, ground textures per city |
| Levels | DONE | levels.js: 10 levels across 5 chapters, all 8000m, ~40% faster speeds |
| Story/Dialogue | DONE | story.js: home scene cutscene, chapter intros, level end beats, distance beats, SMS popups, typewriter text |
| HUD | DONE | hud.js: dynamic hearts (image icons), canvas wallet, fuel bar, progress, chapter name, SMS popup |
| Economy | DONE | economy.js: wallet tracking, toll guarantee (5000m), Sheeda fallback |
| Modes | DONE | modes.js: load shedding, chalaan, monsoon flood, bonus stage, toll, garage (6 upgrades) |
| Particles | DONE | particles.js: 100-particle pool, rain/dust/spark/snow |
| Input | DONE | input.js: keyboard + 5 virtual buttons (mobile) + just-pressed detection |
| Audio | DONE | audio.js: Web Audio API, .ogg/.mp3/.wav fallback |
| Utils | DONE | utils.js: AABB collision, lerp, clamp, localStorage, screen shake |
| Assets | DONE | assets.js: PNG loader with vector fallback, 30+ real files mapped |
| Start screen | DONE | index.html: Urdu title, story quote, styled buttons, PWA manifest |
| Home scene | DONE | story.js: Ali's house cutscene (charpoy, TV, Mama silhouette, typewriter dialogue) |
| Ground system | DONE | camera.js: 3-layer ground (pavement/edge/void), per-city textures (terracotta, asphalt, concrete, snow, rocks) |
| Near decorations | DONE | camera.js: lamp posts, pennants (Lahore), milestones, bushes (GT Road), hedges (Islamabad), pines (Murree), boulders (Naran) |
| Depth effects | DONE | camera.js: renderDepthFog (atmospheric haze + ground shadow), CSS perspective rotateX(2deg) |
| Collectibles | DONE | obstacles.js: type-colored boxes with symbols, pulse animation, glow rings, sprite-first |
| PWA | DONE | manifest.json: app metadata, Urdu font (Noto Nastaliq Urdu) |

### What is NOT DONE (missing assets / features)

| System | Status | Details |
|---|---|---|
| Audio files | MISSING | 0/25 sounds — audio directory has only .gitkeep |
| BGM | MISSING | No background music for any chapter |
| Mama silhouette art | MISSING | Using vector silhouette, not real PNG art |
| Chapter select screen | NOT BUILT | No UI to jump to specific chapters |
| Share Score button | NOT BUILT | Game ending has no share functionality |
| Delivery package mechanic | NOT BUILT | Level 1.2 feature (scripted in levels.js but no code) |
| Jeep Ride token | NOT BUILT | Level 5.1 feature (no code) |
| Local Guide buff | NOT BUILT | Level 5.1 feature (no code) |
| Crowd Surge mechanic | NOT BUILT | Level 4.2 feature (no code) |
| Traffic Signal hazard | NOT BUILT | Level 3.1 hazard (no code) |
| Mobile touch testing | NOT DONE | Touch controls exist but untested on real devices |
| Capacitor/Android | NOT DONE | No Android build configured |
| Obstacle group spawning | NOT BUILT | 20% chance pairs mentioned in MIMO-PROMPT |

---

## THE STORY

**Main Character:** Ali — a 16-year-old boy from a poor Lahore mohallah.

**The Dream:** Ali wants to see Islamabad — clean roads, green avenues, mountains. He has only seen it on TV.

**The Problem:** No money. No transport. Just his two feet and Dada's rusting CD-70 in the garage.

**The Journey:** Chapter by chapter, Ali works, earns, rides, struggles. Islamabad leads to Murree. Murree leads to Naran. The road never ends.

**Mama's Role:**
- Appears at the START as a **silhouette** (backlit by kitchen light)
- Speaks in Urdu, warm but practical
- Gives Ali his first task
- Her dialogue appears at chapter starts as memory/flashback
- She becomes more proud as Ali travels further

---

## CHAPTER STRUCTURE

| Chapter | Location | Theme | New Destination |
|---|---|---|---|
| **0 (Prologue)** | Ali's Home | Mama's silhouette, the dream begins | -> Lahore Streets |
| **1** | Lahore | Earn money, explore the city | -> GT Road |
| **2** | GT Road | The open highway, Pakistan's backbone | -> Islamabad |
| **3** | Islamabad | The capital dream realized — but there's more | -> Murree |
| **4** | Murree | Mountains, pine trees, the cold | -> Naran Valley |
| **5** | Naran / Kaghan | Rivers, snow-peaks, adventure | -> ??? (open ended) |

> **Design Rule:** The player never feels the game is "done." Every chapter ending teases the next.

---

## GAME FLOW

```
TITLE SCREEN (Urdu title, story quote, high score, controls)
  | [PRESS START]
HOME SCENE (Ali's house cutscene — charpoy, TV, Mama silhouette, typewriter dialogue)
  | [auto-fade]
CHAPTER INTRO (dialogue, Mama silhouette, story beat)
  | [auto-fade]
LEVEL INTRO (city, name, objective text overlay)
  | [auto-start]
GAMEPLAY (~1.5 minutes per level)
  | [win or game over]
  
  IF GAME OVER:
    Show: distance reached, wallet, chapter
    Buttons: [RETRY THIS LEVEL] [MAIN MENU]
    
  IF LEVEL COMPLETE:
    Level Complete screen
    [NEXT] -> BONUS STAGE (15s cash rain)
    [NEXT] -> GARAGE (every 2 levels)
    [NEXT] -> CHAPTER COMPLETE screen (story beat)
    [NEXT] -> NEXT CHAPTER INTRO
    
VICTORY (Level 5.2 complete):
  Full ending cutscene -> Final score
```

---

## LEVELS (ALL 10 — 8000m each)

### LEVEL 1.1 — Mama's Doodh Run
| Detail | Value |
|---|---|
| Mode | FOOT ONLY |
| Starting Wallet | Rs. 500 |
| Distance | 8,000 m |
| Scroll Speed | 110 px/s |
| Win Condition | Reach Milk Shop AND wallet >= Rs. 500 |

### LEVEL 1.2 — Liberty Market Rush
| Detail | Value |
|---|---|
| Mode | FOOT -> BIKE (Bike Key at 3,000m) |
| Distance | 8,000 m |
| Scroll Speed | 140 px/s |
| Chalaan starts | 4,000m |
| Win Condition | Reach distance + collect at least Rs. 800 total |

### LEVEL 2.1 — Truck Art Gauntlet
| Detail | Value |
|---|---|
| Mode | BIKE PRIMARY |
| Distance | 8,000 m |
| Scroll Speed | 165 px/s |
| Load Shedding triggers | 3,000m |
| Win Condition | Survive to end |

### LEVEL 2.2 — Jhelum Toll Plaza
| Detail | Value |
|---|---|
| Mode | BIKE or FOOT |
| Distance | 8,000 m |
| Scroll Speed | 150 px/s |
| Toll barrier at | 6,000m |
| Win Condition | Pass toll AND reach 8,000m |

### LEVEL 3.1 — Safe City Signal Sprint
| Detail | Value |
|---|---|
| Mode | BIKE PRIMARY |
| Distance | 8,000 m |
| Scroll Speed | 150 px/s |
| Speed cameras | Every 1,500m |

### LEVEL 3.2 — Final Climb to Monal
| Detail | Value |
|---|---|
| Mode | FOOT (forced dismount at 500m) |
| Distance | 8,000 m |
| Scroll Speed | 110 px/s |
| Gravity Modifier | -40 px/s2 uphill pull |

### LEVEL 4.1 — Margalla Pass Night Ride
| Detail | Value |
|---|---|
| Mode | BIKE (rented CD-70) |
| Distance | 8,000 m |
| Scroll Speed | 125 px/s |
| Special | LOAD SHEDDING for entire level |

### LEVEL 4.2 — Murree Bazaar Rush
| Detail | Value |
|---|---|
| Mode | FOOT (Bazaar — no bike) |
| Distance | 8,000 m |
| Scroll Speed | 140 px/s |

### LEVEL 5.1 — Kaghan Valley River Road
| Detail | Value |
|---|---|
| Mode | FOOT ONLY (bike is dead) |
| Distance | 8,000 m |
| Scroll Speed | 105 px/s |
| Special | MONSOON FLOOD MODE |

### LEVEL 5.2 — Saif-ul-Malook Final Ascent
| Detail | Value |
|---|---|
| Mode | FOOT ONLY |
| Distance | 8,000 m |
| Scroll Speed | 85 px/s |
| Gravity Modifier | -60 px/s2 steepest uphill |

---

## RENDERING PIPELINE (Current Architecture)

### Game Loop States

| State | Updates | Renders |
|---|---|---|
| `loading` | AssetLoader | nothing |
| `menu` | nothing | Camera only |
| `homeScene` | Story.updateHomeScene | Story.renderHomeScene |
| `chapterIntro` | Timer countdown | Camera + Decorations + Obstacles + Player + DepthFog + ChapterIntro overlay |
| `levelIntro` | Timer countdown | Camera + Decorations + Obstacles + Player + DepthFog + LevelIntro overlay |
| `playing` | Full game update | Camera + Decorations + Obstacles + Player + Particles + DepthFog + HUD + Modes overlay |
| `dialogue` | Story.update | Camera + Decorations + Obstacles + Player + DepthFog + Story.renderDialogue |
| `paused` | nothing | Same as playing |
| `gameOver` | nothing | Same as playing |
| `levelComplete` | nothing | Same as playing |
| `chapterComplete` | nothing | Same as playing |
| `bonusStage` | Modes.update | Camera + Decorations + Obstacles + Player + Particles + DepthFog + Modes overlay |
| `ending` | nothing | Story.renderGameEnding + Particles |

### Render Order (within playing/dialogue states)

```
1. Camera.render(ctx)           — Sky + far buildings + mid buildings + near street + decorations + ground
2. Levels.renderDecorations     — Milk shop, signs, toll plazas, etc.
3. Obstacles.render             — All hazards + coins (with depth scaling)
4. Player.render                — Foot or bike sprite + drop shadow
5. Particles.render             — Rain, sparks, dust, snow
6. Camera.renderDepthFog        — Atmospheric haze + ground shadow overlay
7. HUD.renderProgress           — Hearts + wallet + fuel bar + progress bar
8. HUD.renderMessages           — Floating message text
9. Modes.renderOverlay          — Load shedding darkness / toll barrier / chalaan timer
10. HUD.renderSMS               — Mama's SMS popups
```

### Camera System (camera.js — Pseudo-3D Depth)

| Property | Value |
|---|---|
| GROUND_TOP | 390px |
| CANVAS_W | 800px |
| CANVAS_H | 450px |
| Parallax speeds | [0.04, 0.15, 0.45, 1.0] |
| Layers | 4 scroll offsets (far=0 to near=3) |
| Sky zone | 0 to 250px (top 55%) |
| Far buildings | 120px to 390px (scrolls at 0.04x) |
| Mid buildings | 250px to 390px (scrolls at 0.15x) |
| Near street | 330px to 390px (scrolls at 0.45x) |
| Near decorations | y=340 to 390 (scrolls at 1.0x) |
| Ground | 390px to 450px (scrolls at 1.0x) |

**City-specific backgrounds:**
- Lahore: bg_lahore_far + bg_lahore_near images, procedural fallback
- GT Road: bg_gtroad_far + bg_gtroad_mid + bg_gtroad_near images
- Islamabad: bg_isb_far + bg_isb_mid + bg_isb_near images
- Murree: Procedural (dark mountains, pine trees, snow streaks, stars)
- Naran: Procedural (snow-capped peaks, river, waves)

**Depth effects:**
- `renderDepthFog()`: Upper atmosphere (0.22 alpha), horizon haze (0.06 alpha), ground shadow (0.55 alpha)
- CSS: `perspective: 800px` on container, `rotateX(2deg)` on canvas
- Camera shake: Near layers shake more than far layers (depth response)

### Ground System (camera.js)

3-layer ground at y=390:
- **Layer A (390-410):** Pavement surface with per-city textures
  - Lahore: Terracotta tiles with cracks and pebble dots
  - GT Road: Asphalt with white center dashes and yellow edge line
  - Islamabad: Clean concrete tiles with grout lines
  - Murree: Rocky path with snow patches
  - Naran: Rocky river-bank with stones
- **Layer B (410-420):** Ground edge shadow (gradient)
- **Layer C (420-450):** Below-ground void (dark per-city color)

---

## PLAYER STATS

### FOOT MODE
| Stat | Value |
|---|---|
| Hitbox | 32x64 px |
| Walk Speed | 200 px/s |
| Acceleration | lerp 0.25 |
| Jump Force | -450 px/s |
| Gravity | 980 px/s2 |
| Duck Hitbox | 32x32 px |
| Coyote Time | 0.12 seconds |
| Ground Y | 390 - hitbox height |
| Shadow | Ellipse at y=390, alpha 0.35 |

### BIKE MODE
| Stat | Value |
|---|---|
| Hitbox | 64x54 px |
| Ride Speed | 400 px/s |
| Jump Force | -350 px/s |
| Gravity | 1,960 px/s2 |
| Fuel Capacity | 150 units |
| Fuel Drain | 3 units/sec |
| Ground Y | 390 - hitbox height |
| Shadow | Ellipse at y=390, alpha 0.35 |

### Sprite States (8 for foot, 5 for bike)
- Foot: idle, run_01, run_02, jump, duck, flight, speed, hurt
- Bike: idle, run_01, run_02, jump, destroyed

---

## HAZARDS (19 types)

### Base Hazards (All Levels)
| Hazard | Size | Behavior |
|---|---|---|
| Stray Dog (4-state AI) | 40x28 | Idle -> Alert -> Chase -> Tired |
| Open Gutter | 48x16 | Pit in ground, jump over |
| Qingqi Rickshaw | 56x44 | Right->left, variable speed |
| Careless Biker | 40x36 | Same, faster |
| Speed Camera | 24x36 | Overhead, bike mode only |
| Toll Barrier | 200x40 | Blocks path, choice required |
| Construction Cone | 16x24 | Static |
| Truck | 64x48 | Wide, slow |
| Overhead Wires | 200x8 | Overhead |

### Chapter-Specific Hazards
| Hazard | Chapter | Behavior |
|---|---|---|
| Mountain Goat | 3-5 | Like dog but headbutts |
| Falling Rock | 3-5 | Drops from above |
| Tourist Selfie Stick | 4 | Mid-height extend |
| Ice Patch | 4 | Slippery landing |
| Murree Monkey | 4 | Steals Rs. 100 |
| Flash Flood Puddle | 5 | Rising water |
| Rolling Rock | 5 | Barrel-style rolling |
| Narrow Bridge | 5 | 1/3 width |
| Lightning Zone | 5 | Glowing column |
| Snow Patch | 4-5 | Slippery ground |

### Dog AI (4-State)
```
IDLE -> ALERT (spots player) -> CHASE (accelerates) -> TIRED (slows, stops)
```
Detection range: 196-210px depending on chapter.

### Depth Scaling
Obstacles scale from 0.65x (y=280) to 1.0x (y=390) based on Y position.

### Lane Variation
30% of ground obstacles (dog, rickshaw, carelessBike, constructionCone, mountainGoat) spawn at y=360 ("far lane") instead of y=390 ("near lane").

---

## ECONOMY

### Toll Guarantee
```
At Level 2.1, distance >= 5,000m:
  IF wallet < 1,200:
    SPAWN: Rs. 300 cash bundle (guaranteed)
    REPEAT every 1,000m until wallet >= 1,200
```

### Sheeda Fallback
```
At Level 2.2 toll barrier (6,000m):
  IF wallet < 1,000:
    Trigger "Sheeda Ki Madad":
      - Friend tosses Rs. 500
      - Toll reduces to Rs. 500
```

### Cash Distribution
| Level | Min Cash | Why |
|---|---|---|
| 1.1 | Rs. 200 extra | Tutorial confidence |
| 1.2 | Rs. 800 total | Sets up Chapter 2 |
| 2.1 | Rs. 1,200 by 5km | Toll prep |
| 2.2 | Rs. 500 fallback | Toll safety net |
| 3.1 | Rs. 600 | Garage funding |
| 3.2 | Rs. 300 | Chapter 4 rent |
| 4.1 | Rs. 400 | Bazaar spending |
| 4.2 | Rs. 600 | Chapter 5 prep |
| 5.1-5.2 | Rs. 200 | Final stretch |

### Wallet Actions
| Action | Effect |
|---|---|
| Collect Rs. 10/50/100/500 | +amount |
| Near-miss combo | +combo x 10 |
| Toll Plaza | -1,000 (or 500 with fallback) |
| Speed Camera | -500 |
| Chalaan caught | -500 |
| Monkey steal (Ch.4) | -100 |
| Bike rent (Ch.4) | -300 |
| Garage upgrade | -400 to 800 |
| Wallet floor | Cannot go below Rs. 0 |

### Fuel
| Stat | Value |
|---|---|
| Max Fuel | 150 units |
| Drain | 3 units/sec |
| Petrol Bottle | +25 fuel |
| Total bike time | ~50 seconds per tank |
| Empty | Forced dismount to foot |

---

## HEARTS (LIVES)

| Rule | Value |
|---|---|
| Max Hearts | 5 |
| Lose on collision | -1 Heart |
| Game Over | 0 hearts |
| Heart restore | Bhutta (corn) in Ch.4+ restores 1 |
| Max hearts bonus | Woolen Shawl: +1 max (temp) |

---

## GARAGE UPGRADES

| Upgrade | Cost | Max | Effect |
|---|---|---|---|
| Bigger Fuel Tank | Rs. 400 | 3 | +50 fuel capacity |
| Bike Shield | Rs. 600 | 2 | Survive 1 extra crash |
| Speed Boost | Rs. 500 | 3 | +10% top speed |
| M-Tag Pass | Rs. 800 | 1 | Toll plaza FREE |
| Garam Jacket | Rs. 300 | 1 | +1 heart max in Ch.4+ |
| Better Headlight | Rs. 250 | 1 | Wider light cone |

---

## SPECIAL MODES

### Load Shedding Mode
- Active: Level 2.1 (triggers at 3,000m), all of Level 4.1
- Screen goes 90% black
- Foot: torch cone (60 degree, yellow)
- Bike: headlight (30 degree, flickers when fuel < 20)
- Better Headlight upgrade: wider 50 degree cone

### Chalaan Escape Mode
- Active: Level 1.2 (triggers at 4,000m)
- Warden: always 10% faster than player
- 45-second countdown
- Hit obstacle: 0.5s stun -> warden catches -> -500 + timer resets
- Survive 45s: +1,000 bonus

### Monsoon Flood Mode
- Active: Level 5.1
- Water rises 1px/sec from bottom
- Standing pools = hazards (land in one: -1 heart)
- Lightning zones: -2 hearts if hit

### Bonus Stage
- After every level: 15 seconds of cash rain
- Left/right only, no hazards
- Rs. 10/100/500 notes rain diagonally

---

## AUDIO (25 sounds — ALL MISSING)

| ID | Sound | When |
|---|---|---|
| A1 | Footstep loop | Foot running |
| A2 | Jump grunt | Any jump |
| A3 | Landing thud | Any landing |
| A4 | Bike kickstart | Mount bike |
| A5 | Bike engine loop | Bike riding |
| A6 | Bike sputter | Fuel < 20 |
| A7 | Bike crash | Bike collision |
| A8 | Collect cash | Rs. pickup |
| A9 | Collect bike key | Bike key |
| A10 | Collect petrol | Petrol bottle |
| A11 | Dog bark | Dog alerts |
| A12 | Heart loss | Take damage |
| A13 | Game Over | 0 hearts |
| A14 | Level Complete | Win level |
| A15 | Warden siren loop | Chalaan mode |
| A16 | Camera flash | Speed camera |
| A17 | Chai sip | Chai cup |
| A18 | Collect parchi | Parchi pickup |
| A19 | Monkey screech | Monkey steal |
| A20 | Thunder crack | Lightning hit |
| A21-A25 | BGM per location | Lahore/GT Road/ISB/Murree/Naran |

---

## FILE STRUCTURE

```
Lahore-to-Islamabad/
|
+-- index.html          Canvas + HUD + all screen overlays + CSS
+-- game.js             Main loop, state machine (13 states), chapter system
+-- player.js           Foot/bike modes, 8+5 sprite states, physics, shadows
+-- obstacles.js        19 hazard types, dog AI, depth scaling, lane variation, collectibles
+-- camera.js           Pseudo-3D parallax (4 layers), tiled images, procedural BGs, ground textures, depth fog
+-- levels.js           10 levels across 5 chapters (all 8000m)
+-- story.js            Home scene cutscene, chapter intros, dialogue, SMS, typewriter
+-- hud.js              Hearts (image icons), canvas wallet, fuel bar, progress, chapter name
+-- audio.js            Web Audio API, .ogg/.mp3/.wav fallback
+-- input.js            Keyboard + 5 virtual touch buttons
+-- particles.js        100-particle pool, rain/dust/spark/snow
+-- modes.js            Load shedding, chalaan, monsoon, bonus, toll, garage
+-- utils.js            AABB collision, lerp, clamp, localStorage, screen shake
+-- assets.js           PNG loader with vector fallback, 30+ files mapped
+-- economy.js          Wallet tracking, toll guarantee (5000m), Sheeda fallback
+-- manifest.json       PWA manifest (Urdu, landscape, fullscreen)
|
+-- IMPLEMENTATION-PROMPT.md   15-change implementation checklist
+-- MIMO-PROMPT-v1.md          Pseudo-3D depth system prompt
+-- AI-ART-PROMPTS.md          42+ sprite generation prompts
+-- MASTER-SPEC-v5.md          This file
|
+-- assets/
    +-- sprites/
    |   +-- player/        foot_idle, foot_run_01/02, foot_jump, foot_duck, foot_hurt, foot_flight
    |   +-- bike/          bike_idle, bike_run_01/02, bike_jump, bike_destroyed
    |   +-- obstacles/     dog_sit, dog_run_01/02, rickshaw_01, careless_biker, truck, gutter, wires_pole
    |   +-- collectibles/  rupee_note, petrol_bottle, key
    |   +-- decorations/   milk_shop, chai_ka_dhaba, sign_board, toll_plaza_01/02
    |   +-- special/       rain drop, GT_road layer 2/3, islamabad layer 2/3
    +-- bg/                lahore_layer 1/2, GT_road layer 1, islamabad_layer 1, faisal_mosque, margala_hills, sky_scrapper
    +-- hud/               heart icon, fuel icon
    +-- audio/             (empty — all sounds missing)
```

---

## BUILD PHASES — STATUS

### Phase 1 — Core Engine: COMPLETE (all 14 JS files + index.html)

### Phase 2 — Story & Polish: MOSTLY COMPLETE
| Step | What | Status |
|---|---|---|
| 16 | Home scene cutscene (Ali's house) | DONE |
| 17 | Chapter intro overlays (all 5) | DONE |
| 18 | Level end story beats (all 10) | DONE |
| 19 | Dialogue subtitle system | DONE |
| 20 | SMS popup system | DONE |
| 21 | Sheeda fallback event | DONE |
| 22 | Ch.4 hazards (monkey, ice, selfie sticks) | CODE EXISTS, NEEDS TESTING |
| 23 | Ch.5 hazards (rocks, flood, lightning) | CODE EXISTS, NEEDS TESTING |
| 24 | Bhutta collectible (heart restore) | CODE EXISTS |
| 25 | Woolen Shawl collectible | NOT BUILT |
| 26 | Jeep Ride token | NOT BUILT |
| 27 | Delivery package mechanic | NOT BUILT |
| 28 | Game ending cutscene | DONE |
| 29 | Chapter select screen | NOT BUILT |
| 30 | Garage upgrades (Garam Jacket, Headlight) | DONE |

### Phase 3 — Real Art: PARTIALLY DONE
| Step | What | Status |
|---|---|---|
| 31 | Player sprites (8 foot + 5 bike) | DONE (PNGs exist) |
| 32 | Hazard sprites (9 base + new) | PARTIAL (7/19 PNGs exist) |
| 33 | Background layers (5 cities x 4 layers) | PARTIAL (6/20 PNGs exist) |
| 34 | HUD icons (heart, fuel) | DONE (PNGs exist) |
| 35 | Mama silhouette art | NOT DONE (vector only) |
| 36 | Audio files (25 sounds) | NOT DONE (0/25) |

### Phase 4 — Publish: NOT STARTED
| Step | What | Status |
|---|---|---|
| 37 | Minify JS | NOT DONE |
| 38 | Compress PNGs | NOT DONE |
| 39 | GitHub Pages | DONE (repo exists) |
| 40 | Mobile test | NOT DONE |
| 41 | Capacitor -> Android | NOT DONE |
| 42 | Play Store upload | NOT DONE |

---

## COMMITS LOG

| Commit | Message |
|---|---|
| `f9fce68` | [v5] Pseudo-3D depth system + critical render fixes |
| `90cdc1d` | [FIX] Economy toll prep distance corrected (12000 -> 5000) |
| `47f630a` | [FIX] 10 runtime bugs — 3 critical, 2 moderate, 5 minor |
| `20c0a18` | [DOC] Updated MASTER-SPEC-v5 with implementation prompt changes |
| `9adf48d` | [v5] Implementation prompt — 15 visual + gameplay changes |
| `c7ea32f` | [v5] Asset integration — all sprites, backgrounds, HUD icons |
| `1ad33d9` | [FIX] Critical runtime fixes |
| `7f1ebce` | [FIX] Fix broken Story/Game method references |
| `77c827a` | [v5] Story Mode Overhaul - 10 levels, 5 chapters, dialogue |
| `8f71920` | [FIX] 3 bugs found during spec cross-reference |
| `226a364` | [DOC] Updated instructions complete.md to v4.0 |

---

## DEPLOYMENT

```
GitHub: https://github.com/nofilkhan1/Lahore-to-Islamabad
GitHub Pages: https://nofilkhan1.github.io/Lahore-to-Islamabad/
Branch: master

Capacitor (Android — not yet configured):
  npm install @capacitor/cli @capacitor/core @capacitor/android
  npx cap init LahoreToIslamabad
  npx cap add android
  npx cap sync
  npx cap open android
```

**Git commit convention:**
| Prefix | Meaning |
|---|---|
| `[v5]` | Version 5 feature |
| `[FIX]` | Bug fix |
| `[DOC]` | Documentation |
| `[ASSET]` | New art or sound |
| `[DEPLOY]` | Deploy config |

---

*MASTER-SPEC v5.2 — Lahore to Islamabad — Story Mode + Pseudo-3D Depth*
*Last updated: June 27, 2026*
