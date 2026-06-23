# Lahore to Islamabad — Game Spec
**Version:** 4.0 (Post-Major Overhaul)
**Genre:** 2D Side-Scrolling Platformer + Endless Runner Hybrid
**Platform:** Web (PC + Mobile) → Android App
**Visual Style:** 16-bit Pixel Art with vibrant Pakistani colors

---

## QUICK SUMMARY (Read This First)

You are building a Pakistani-themed 2D runner game where the player travels from **Lahore → GT Road → Islamabad** as a young man on foot and motorbike. Think *Subway Surfers* meets *Celeste*, but desi.

**Core loop:**
> Run → Avoid obstacles → Collect cash → Survive 2-3 minutes per level → Reach the finish line.

**Story (shown on start screen):**
> "Beghairat Government ne metro ka budget kha liya hai. Ab sirf ek purani Honda CD 70 hai aur GT Road ka safar. Lahore se Islamabad — 400 km of pure Pakistani chaos."

---

## TABLE OF CONTENTS

1. [What the Game Is](#1-what-the-game-is)
2. [File Structure](#2-file-structure)
3. [How the Game Engine Works](#3-how-the-game-engine-works)
4. [The Player](#4-the-player)
5. [Controls](#5-controls)
6. [Levels & Story Flow](#6-levels--story-flow)
7. [Hazards & Enemies](#7-hazards--enemies)
8. [Special Game Modes](#8-special-modes)
9. [Extra Features](#9-extra-features)
10. [Economy — Money, Health & Fuel](#10-economy--money-health--fuel)
11. [Performance Rules](#11-performance-rules)
12. [All Assets Needed](#12-all-assets-needed)
13. [Where to Get Free Assets](#13-where-to-get-free-assets)
14. [Build Order (Step-by-Step)](#14-build-order-step-by-step)
15. [How to Deploy / Publish](#15-how-to-deploy--publish)
16. [Issues & Improvements](#16-issues--improvements)

---

## 1. What the Game Is

| Detail | Answer |
|---|---|
| **Game Title** | Lahore to Islamabad |
| **Genre** | 2D side-scroller + runner |
| **Art Style** | 16-bit pixel art (like Celeste / Stardew Valley) |
| **Colors** | Turmeric yellow, emerald green, rickshaw orange, truck art magenta, chai brown |
| **Screen Size** | 800x450 pixels (16:9), scales to fill any screen |
| **Target FPS** | 60fps (works on 30-144Hz screens too) |
| **Controls** | Keyboard (PC) + on-screen touch buttons (mobile) |
| **Sound** | .ogg files (primary), .mp3 (fallback), .wav (backup) |
| **Art Approach** | Build with colored shapes first → replace with real pixel art later |
| **Assets Folder** | `assets/sprites/`, `assets/bg/`, `assets/audio/`, `assets/hud/` |

---

## 2. File Structure

```
LahoreToIslamabad/
|
+-- index.html          <- The webpage: canvas + HUD overlay + all screens
+-- game.js             <- Main game loop (runs 60 times/sec)
+-- player.js           <- Player: walk, jump, bike, animations
+-- obstacles.js        <- Spawns & manages all hazards + dog AI
+-- levels.js           <- Level data, distances, city transitions
+-- hud.js              <- Screen UI: hearts, wallet, fuel bar, mission progress
+-- audio.js            <- Plays all sounds with fallback chain
+-- input.js            <- Reads keyboard + touch input
+-- camera.js           <- 4-layer parallax scrolling background
+-- particles.js        <- Visual effects (rain, sparks, dust)
+-- utils.js            <- Helper functions (collision, math, localStorage)
+-- modes.js            <- Special modes (load shedding, chalaan, bonus, garage)
+-- assets.js           <- Asset loader with PNG + vector fallback
|
+-- assets/
    +-- sprites/        <- Player, enemies, items (PNG files)
    +-- bg/             <- Background images per level (PNG)
    +-- audio/          <- All sound effects + music (.ogg/.mp3)
    +-- hud/            <- Heart icons, fuel bar, rupee icon (PNG)
```

---

## 3. How the Game Engine Works

### 3.1 The Game Loop
Every frame (1/60th of a second), the game does this in order:

```
1. Calculate time since last frame (deltaTime)
2. If PAUSED -> skip, just show frozen frame
3. UPDATE everything:
   - Accumulate distance (distance += scrollSpeed * dt / 60)
   - Check multi-event triggers (load shedding, chalaan repeats)
   - Move player (acceleration/deceleration with lerp)
   - Move obstacles (scrollSpeed + obstacle.speed)
   - Dog AI state machine (idle/alert/chase/tired)
   - Move camera (4-layer parallax)
   - Update particles
   - Check collisions (AABB)
   - Check near-misses (CLOSE CALL combo)
   - Check if level is complete
4. DRAW everything:
   - Clear screen
   - Draw backgrounds (far -> near, 4 layers)
   - Draw obstacles + coins
   - Draw decorations (milestones, shops, Monal)
   - Draw player (with hit flash effect)
   - Draw particles
   - Draw mission progress bar
   - Draw floating messages
   - Draw special mode overlays (load shedding, chalaan)
5. Repeat -> next frame
```

### 3.2 Delta-Time

Every movement value is **multiplied by deltaTime** so the game feels identical at 30fps or 144fps.

Formula: `position += velocity * deltaTime`

### 3.3 Screen Scaling

- Internal canvas: **800x450 px** (never changes)
- CSS stretches this to fit any screen while keeping 16:9 ratio
- Pixel art stays sharp: `ctx.imageSmoothingEnabled = false`

### 3.4 Distance Formula

```
distance += (scrollSpeed * dt) / 60
```

At 60fps with dt=1.0: distance increases by `scrollSpeed` per second.

**scrollSpeed = meters per second of level progress.**

---

## 4. The Player

### 4.1 Two Modes

```
FOOT MODE:
  - IDLE       -> standing still
  - RUNNING    -> moving right (acceleration: 0.25 lerp)
  - JUMPING    -> in the air (coyote time: 0.12s, jump buffer: 0.1s)
  - DUCKING    -> crouching (hitbox becomes half height)
  - HURT       -> flashing after taking damage (1.5 seconds, red hit flash)

BIKE MODE:
  - RIDING     -> moving fast (1.8x foot speed)
  - JUMPING    -> in the air on bike (lower jump)
  - CRASHING   -> bike destroyed, return to FOOT MODE
  - DISMOUNT   -> press E (costs 1 heart + 2s stun)
```

### 4.2 Player Stats

**Foot Mode:**
| Stat | Value |
|---|---|
| Hitbox | 32x64 px |
| Walk Speed | 200 px/s |
| Acceleration | 0.25 lerp (was 0.1) |
| Deceleration | 0.3 lerp (was 0.15) |
| Jump Force | -450 px/s (upward) |
| Gravity | 980 px/s^2 |
| Duck Hitbox | 32x32 px (half height) |
| Coyote Time | 0.12 seconds (grace period after leaving ground) |
| Jump Buffer | 0.1 seconds (remember jump press before landing) |

**Bike Mode:**
| Stat | Value |
|---|---|
| Hitbox | 64x54 px |
| Ride Speed | 400 px/s (was 500) |
| Jump Force | -350 px/s (smaller jump) |
| Gravity | 1960 px/s^2 (falls faster) |
| Background Speed | 1.8x faster scroll (was 2.5x) |
| Fuel Capacity | 150 units (was 100) |
| Fuel Drain | 3 units/sec (was 5) |
| Bike Duration | ~50 seconds of riding |

### 4.3 Switching Modes

| Trigger | What Happens |
|---|---|
| Player collects **Bike Key** | 0.5s mounting animation -> enters BIKE MODE |
| Bike hits an obstacle (no shield) | `demoteToFoot()` -> 1.5s invincibility flash |
| Bike hits an obstacle (has shield) | Shield consumed, bike stays |
| Fuel runs out | Forced back to FOOT MODE + message |
| Player presses **E** (dismount) | -1 heart + 2s stun -> FOOT MODE (risky!) |
| Player collects **Jugaad Repair** | Pay Rs. 200 -> get bike back (if foot mode) |

### 4.4 Movement Feel

The game uses smooth acceleration curves:

```
Move Right: velX = lerp(velX, maxSpeed, 0.25)   // Snappy acceleration
Move Left:  velX = lerp(velX, -maxSpeed*0.5, 0.25)
Release:    velX = lerp(velX, 0, 0.3)            // Quick deceleration
```

**Coyote Time:** 0.12 seconds after leaving ground, jump still works.
**Jump Buffer:** 0.1 seconds before landing, jump press is remembered.

---

## 5. Controls

### 5.1 Keyboard (PC)

| Key | Action |
|---|---|
| `Left/Right Arrows` or `A/D` | Move / Accelerate |
| `Up Arrow` / `W` / `Space` | Jump |
| `Down Arrow` / `S` | Duck (foot mode) |
| `E` | Dismount Bike (costs 1 heart + 2s stun) |
| `P` / `Escape` | Pause |
| `M` | Mute/unmute |

### 5.2 Touch Buttons (Mobile)

5 on-screen buttons: Left, Right, Up, Down, Jump (60x60 px, semi-transparent)

---

## 6. Levels & Story Flow

### 6.1 Game Flow

```
START SCREEN (story + controls + high score)
  -> Click START
  -> LEVEL INTRO (2.5s overlay: city, name, objective)
  -> GAMEPLAY (2-3 minutes per level)
  -> LEVEL COMPLETE screen
  -> Click NEXT LEVEL
  -> BONUS STAGE (15s cash rain)
  -> GARAGE (every 2 levels: upgrade shop)
  -> NEXT LEVEL INTRO -> repeat
  -> VICTORY SCREEN (after level 6)
```

### 6.2 The Six Levels

| # | Name | City | Distance | scrollSpeed | Duration | Special |
|---|---|---|---|---|---|---|
| 1 | Mama's Doodh Run | Lahore | 15,000m | 100 | ~2.5 min | Foot only, start Rs.500 |
| 2 | Liberty Market Rush | Lahore | 16,500m | 110 | ~2.5 min | Bike key at 5000m, chalaan |
| 3 | Truck Art Gauntlet | GT Road | 18,000m | 120 | ~3 min | Load shedding repeats |
| 4 | Jhelum Toll Plaza | GT Road | 18,000m | 110 | ~3 min | Toll at 14000m |
| 5 | Signal Sprint | Islamabad | 18,000m | 110 | ~3 min | Standard |
| 6 | Final Climb to Monal | Islamabad | 16,200m | 90 | ~3 min | Uphill (-40px/s^2) |

### 6.3 Level Details

**Level 1.1 — Mama's Doodh Run (Lahore)**
- Foot mode ONLY (no bike)
- Start with Rs. 500 in wallet
- Win: reach distance AND have >= Rs. 500
- Hazards: stray dogs, open gutters
- Milk Shop decoration near end

**Level 1.2 — Liberty Market Rush (Lahore)**
- Bike Key collectible appears at 5,000 units
- Chalaan mode triggers at 6000m, repeats every 8000m
- New hazards: rickshaws, careless bikers, construction cones

**Level 2.1 — Truck Art Gauntlet (GT Road)**
- Scroll speed 120 (faster than Lahore)
- Load shedding triggers at 6000m, repeats every 7000m
- New hazard: speed cameras (fine Rs. 500 in bike mode)
- High obstacle density

**Level 2.2 — Jhelum Toll Plaza (GT Road)**
- Toll barrier appears at 14,000 units
- Player must choose: Pay Rs. 1,000 OR jump over (velX > 150)
- M-Tag pass makes toll free

**Level 3.1 — Signal Sprint (Islamabad)**
- Clean visuals, lower density hazards
- Standard obstacles

**Level 3.2 — Final Climb to Monal (Islamabad)**
- Gravity pulls player backward (-40 px/s^2) — uphill feel
- Margalla Hills visible in background, road tilts upward
- Reach 16,200m -> Monal Restaurant -> VICTORY

---

## 7. Hazards & Enemies

### 7.1 All Hazards

| Hazard | Size | Behavior | Foot Damage | Bike Damage |
|---|---|---|---|---|
| **Stray Dog** | 40x28 | 4-state AI (idle/alert/chase/tired) | -1 Heart | Demote to Foot |
| **Open Gutter** | 48x16 | Pit in ground, must jump | -1 Heart | Demote to Foot |
| **Qingqi Rickshaw** | 56x44 | Moves right->left, variable speed | -1 Heart | Demote to Foot |
| **Careless Biker** | 40x36 | Same as rickshaw, faster | -1 Heart | Demote to Foot |
| **Speed Camera** | 24x36 | Overhead, only hits bike mode | No effect | -Rs. 500 fine |
| **Toll Barrier** | 200x40 | Blocks path entirely | Stops you | Stops you |
| **Overhead Wires** | 200x8 | High up, only hits bike jump | No effect | Demote to Foot |
| **Construction Cone** | 16x24 | Static obstacle | -1 Heart | Demote to Foot |

### 7.2 Dog AI System (4 States)

Dogs have a state machine with per-level difficulty:

```
IDLE -> ALERT -> CHASE -> TIRED -> IDLE (repeat)
```

| State | Behavior |
|---|---|
| **Idle** | Dog wanders, no threat |
| **Alert** | Spots player, barks ("!" indicator), 0.5s preparation |
| **Chase** | Acceleration curve: gradually speeds up over time |
| **Tired** | Slows down, pants ("..." indicator), eventually stops |

**Per-level parameters:**

| Level | Chase Duration | Accel Rate | Detect Range |
|---|---|---|---|
| 1 | 3 seconds | 0.8x | 196px |
| 2 | 4 seconds | 1.0x | 200px |
| 3 | 5 seconds | 1.2x | 204px |
| 4 | 4 seconds | 1.0x | 200px |
| 5 | 5 seconds | 1.3x | 206px |
| 6 | 6 seconds | 1.5x | 210px |

### 7.3 Collision System

**AABB** (box vs. box) collision detection:
- If on **bike** (no shield) -> demote to foot + invincibility
- If on **bike** (has shield) -> shield consumed
- If on **foot** -> lose 1 heart + screen shake + red hit flash
- If hearts reach **0** -> Game Over

### 7.4 Near-Miss System

When player narrowly avoids an obstacle (within 20px but no collision):
- "CLOSE CALL!" floating text
- Combo multiplier: x2, x3, etc.
- Cash bonus: combo x 10 Rs.
- 2-second combo timer

### 7.5 Object Pooling

- 10 obstacle slots
- 20 coin slots
- 100 particle slots (was 50)

---

## 8. Special Modes

### 8.1 WAPDA Load Shedding Mode
**When:** Level 3 (GT Road) at 6000m, repeats every 7000m

- Screen goes **90% black**
- Foot: torch cone (60-degree triangle, yellow)
- Bike: headlight (30-degree narrower, flickers when fuel is low)
- Hazards only visible inside the light cone

### 8.2 Chalaan Escape Mode
**When:** Level 2 (Liberty Market) at 6000m, repeats every 8000m

- Traffic Warden chases from left edge
- Warden speed: always **10% faster** than the player
- 45-second countdown on HUD
- Hit obstacle -> 0.5s stun -> Warden catches up -> -Rs. 500 fine
- Survive 45 seconds -> win Rs. 1,000 bonus

### 8.3 Bonus Stage (Cash Rain)
**When:** After every level completion (before garage/next level)

- 15 seconds only
- Currency notes rain diagonally from the sky (Rs. 10, 50, 100)
- Move left/right to collect
- Total collected -> added to wallet -> garage or next level

### 8.4 Truck Art Garage
**When:** After levels 2 and 4 (every 2 levels)

Available upgrades:

| Upgrade | Cost | Max | Effect |
|---|---|---|---|
| Bigger Fuel Tank | Rs. 400 | 3 | +50 fuel capacity per level |
| Bike Shield | Rs. 600 | 2 | Survive 1 extra crash |
| Speed Boost | Rs. 500 | 3 | +10% top speed per level |
| M-Tag Pass | Rs. 800 | 1 | Skip toll plaza fees |

---

## 9. Extra Features

| Feature | Status | Description |
|---|---|---|
| **Truck Art Garage** | Built | Between levels: spend Rs. on bike upgrades |
| **Chai Power-Up** | Built | Chai cup -> 5s double speed + invincibility |
| **Jugaad Repair** | Built | 5% rare spawn, pay Rs. 200 to get bike back |
| **Parchi Lottery** | Built | Collect 3 parchis -> random Rs. reward |
| **Billboard Parody Ads** | Built | "CHAI Nahi CHALEGI!", "PAY TOLL OR WALK" |
| **Bike Manual Dismount** | Built | Press E (costs 1 heart + 2s stun) |
| **Near-Miss Combo** | Built | CLOSE CALL! +Rs.X per dodge, combo multiplier |
| **Multi-Event Triggers** | Built | Load shedding/chalaan repeat at intervals |
| **Level Intro Transitions** | Built | 2.5s overlay with city, name, objective |
| **Hit Flash Effect** | Built | Red tint on damage for visual feedback |
| **Mission Progress Bar** | Built | Shows objective, distance, meters remaining |
| **High Score Display** | Built | Shown on start screen |
| **Desi Story Intro** | Built | Funny narrative on start screen |
| **Controls Guide** | Built | "How to Play" section on start screen |
| **Save System** | Built | localStorage: progress, wallet, upgrades, leaderboard |

---

## 10. Economy — Money, Health & Fuel

### Hearts (Lives)
- You have **5 hearts**
- Lose 1 heart per collision in **foot mode**
- Hearts **cannot be recovered** (permadeath system)
- 0 hearts -> Game Over screen

### Wallet (Rs.)
| Action | Effect |
|---|---|
| Start game | Rs. 0 (or Rs. 500 in Level 1.1) |
| Collect cash sprite | +Rs. 10 / 50 / 100 / 500 |
| Near-miss combo | +Rs. combo x 10 |
| Toll plaza | -Rs. 1,000 |
| Speed camera | -Rs. 500 |
| Chalaan caught | -Rs. 500 |
| Bike repair (jugaad) | -Rs. 200 |
| Upgrades | -Rs. 400 to 800 |
| Wallet floor | Cannot go below Rs. 0 |

### Fuel Gauge
- **Only active in Bike Mode**
- Max: **150 units** (was 100)
- Drains at **3 units/second** (was 5)
- Petrol Bottle collectible: **+25 fuel**
- At 0 -> bike stops -> forced back to Foot Mode
- HUD bar: gradient green -> yellow -> red
- Low fuel warning: screen flashes red when < 20

---

## 11. Performance Rules

| Rule | Why |
|---|---|
| **Delta-time on all movement** | Same speed on every device |
| **Object pooling** | 10 obstacles, 20 coins, 100 particles |
| **Parallax culling** | Only draw things visible on screen |
| **Asset loader with fallback** | PNGs when available, vector shapes as backup |
| **Lazy-load backgrounds** | Only load current level's assets |
| **Audio graceful degradation** | Silently fails if sound files missing |

---

## 12. All Assets Needed

### Player Sprites

| ID | Sprite | Size | Frames |
|---|---|---|---|
| P1 | Foot - Idle | 32x64 | 1 |
| P2 | Foot - Running | 32x64 | 4 |
| P3 | Foot - Jumping | 32x64 | 1 |
| P4 | Foot - Ducking | 32x32 | 1 |
| P5 | Foot - Hurt | 32x64 | 1 |
| P6 | Bike - Idle | 64x54 | 1 |
| P7 | Bike - Riding | 64x54 | 3 |
| P8 | Bike - Jumping | 64x54 | 1 |

### Collectibles

| ID | Item | Size |
|---|---|---|
| C1 | Bike Key | 16x16 |
| C2 | Petrol Bottle | 16x24 |
| C3 | Cash Rs. 10 | 12x16 |
| C4 | Cash Rs. 50 | 12x16 |
| C5 | Cash Rs. 100 | 12x16 |
| C6 | Cash Rs. 500 | 12x16 |
| C7 | Chai Cup | 16x16 |
| C8 | Parchi Ticket | 12x16 |
| C9 | Jugaad Repair (Wrench) | 24x24 |

### Hazard Sprites

| ID | Hazard | Size |
|---|---|---|
| H1 | Stray Dog (4 states) | 40x28 |
| H2 | Open Gutter | 48x16 |
| H3 | Qingqi Rickshaw | 56x44 |
| H4 | Careless Biker | 40x36 |
| H5 | Speed Camera | 24x36 |
| H6 | Toll Barrier | 200x40 |
| H7 | Overhead Wires | 200x8 |
| H8 | Construction Cone | 16x24 |
| H9 | Traffic Warden | 48x56 |

### Backgrounds (4 Layers Per City)

| Layer | What It Shows | Scroll Speed |
|---|---|---|
| Layer 4 (far) | Sky, landmarks (Badshahi, Faisal Mosque, Margalla Hills) | Slowest |
| Layer 3 (mid) | Buildings, trees, GT road vehicles | Medium |
| Layer 2 (near) | Shops, street-level details | Fast |
| Layer 1 (foreground) | Pavement, ground details | Fastest |

### Audio Files (15 Defined)

| ID | Sound | Status |
|---|---|---|
| A1 | Jump | Defined (no file yet) |
| A2 | Landing | Defined |
| A3 | Collect Cash | Defined |
| A4 | Collect Key | Defined |
| A5 | Collect Petrol | Defined |
| A6 | Chai Power | Defined |
| A7 | Bike Start | Defined |
| A8 | Bike Crash | Defined |
| A9 | Heart Loss | Defined |
| A10 | Dog Bark | Defined |
| A11 | Camera Flash | Defined |
| A12 | Game Over | Defined |
| A13 | Level Complete | Defined |
| A14 | Warden Siren | Defined |
| A15 | Collect Parchi | Defined |

**Note:** All audio files are defined but not yet created. Game runs silently (graceful degradation).

---

## 13. Where to Get Free Assets

### Sprites & Art

| Tool | URL | Use For |
|---|---|---|
| Piskel | piskelapp.com | Free browser pixel art editor |
| LibreSprite | libresprite.github.io | Free Aseprite clone |
| Kenney.nl | kenney.nl | Free CC0 game assets |
| OpenGameArt | opengameart.org | Community pixel art |
| Leonardo.ai | leonardo.ai | AI art -> downscale to pixel |

### Audio

| Tool | URL | Use For |
|---|---|---|
| JSFXR | sfxr.me | 8-bit jump/coin/hit sounds |
| Freesound.org | freesound.org | Real recordings |
| Audacity | audacityteam.org | Edit, loop, trim audio |

---

## 14. Build Order

### Phase 1 - Working Game with Colored Shapes

| Step | File | Status |
|---|---|---|
| 1 | `index.html` - Canvas + HUD + screens | DONE |
| 2 | `game.js` - Game loop, state machine | DONE |
| 3 | `input.js` - Keyboard + touch | DONE |
| 4 | `player.js` - Foot/bike, physics | DONE |
| 5 | `obstacles.js` - Pool, hazards, dog AI | DONE |
| 6 | `levels.js` - 6 levels, win conditions | DONE |
| 7 | `camera.js` - 4-layer parallax | DONE |
| 8 | `hud.js` - Hearts, wallet, fuel, progress | DONE |
| 9 | `audio.js` - Sound manager | DONE |
| 10 | `particles.js` - Effects | DONE |
| 11 | `modes.js` - Load shedding, chalaan, bonus, garage | DONE |
| 12 | `utils.js` - Helpers | DONE |
| 13 | `assets.js` - Asset loader with fallback | DONE |

### Phase 2 - Polish & Complete Game Logic

| Step | What | Status |
|---|---|---|
| 14 | Level durations (2-3 min each) | DONE |
| 15 | Multi-event triggers (load shedding, chalaan repeat) | DONE |
| 16 | Near-miss combo system | DONE |
| 17 | Level intro transitions | DONE |
| 18 | Mission progress bar | DONE |
| 19 | Hit flash effect | DONE |
| 20 | Coyote time + jump buffer | DONE |
| 21 | Dog AI per-level parameters | DONE |
| 22 | Garage upgrade system | DONE |
| 23 | Save system (localStorage) | DONE |
| 24 | High score display | DONE |
| 25 | Desi story home screen | DONE |
| 26 | Victory screen (separate from game over) | DONE |

### Phase 3 - Replace Shapes with Real Pixel Art

| Step | What |
|---|---|
| 27 | Replace colored boxes with player/hazard sprite sheets |
| 28 | Replace colored BG boxes with parallax tile PNGs |
| 29 | Replace HUD shapes with icon sprites |
| 30 | Create all audio files |
| 31 | Create texture atlas (single sprite sheet) |

### Phase 4 - Publish

| Step | What |
|---|---|
| 32 | Minify all JS files |
| 33 | Compress all PNGs via TinyPNG |
| 34 | Test on real mobile browser |
| 35 | Wrap with Capacitor -> generate Android APK |
| 36 | Publish to Play Store |

---

## 15. How to Deploy / Publish

### Option A: GitHub Pages (Free)

```
1. Create GitHub repo: "Lahore-to-Islamabad"
2. Push all game files
3. Go to Settings -> Pages -> select "master" branch root
4. Game lives at: https://nofilkhan1.github.io/Lahore-to-Islamabad/
```

### Option B: Android App (Capacitor)

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android
npx cap init LahoreToIslamabad
npx cap add android
# Copy game files to www/ folder
npx cap sync
npx cap open android   # Opens Android Studio -> Build APK
```

### Git Commit Convention

| Prefix | Meaning |
|---|---|
| `[P1S1]` | Phase 1, Step 1 |
| `[P2]` | Phase 2 feature |
| `[FIX]` | Bug fix |
| `[ASSET]` | New art or sound added |
| `[DEPLOY]` | Deployment config |

---

## 16. Issues & Improvements

### Fixed (v4.0)

| Issue | Fix |
|---|---|
| Garage screen never appeared (display:none bug) | Removed inline style |
| Game won screen showed "GAME OVER" title | Separate victory screen |
| Level complete flow broken (auto-bonus) | User clicks NEXT LEVEL |
| Levels too short (10-15 seconds) | Distances increased to 15000-18000m |
| Toll jump impossible (threshold 450) | Fixed to 150 |
| No story or instructions on home screen | Added desi story + controls guide |
| Dog AI too simple (instant speed) | 4-state machine with per-level params |
| No save system | localStorage for progress/upgrades/leaderboard |
| Bike dismount impossible | Added E key (costs 1 heart + stun) |
| No visual feedback on hit | Red hit flash effect |
| No movement feel improvement | Coyote time, jump buffer, smooth acceleration |
| Bonus stage auto-started (dead button) | User clicks NEXT LEVEL to start bonus |
| No high score display | Shown on start screen |
| Load shedding/chalaan only triggered once | Multi-event repeat system |
| Particle pool too small (50) | Increased to 100 |
| Loading screen hardcoded timeout | Tracks actual asset progress |
| No mission objective display | Progress bar with objective + meters remaining |

### Still TODO

| Issue | Priority |
|---|---|
| No audio files (all 15 sounds undefined) | HIGH |
| No image assets (all vector shapes) | HIGH |
| No Urdu language support | LOW |
| No Firebase leaderboard | LOW |
| No difficulty select (Easy/Normal/Hard) | LOW |
| No checkpoint system | LOW |

---

*Spec v4.0 - Lahore to Islamabad*
*Updated after Major Overhaul (P5)*
