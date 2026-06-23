# 🎮 Lahore to Islamabad — Game Spec
**Version:** 3.0 (Clean & Readable)
**Genre:** 2D Side-Scrolling Platformer + Endless Runner Hybrid
**Platform:** Web (PC + Mobile) → Android App
**Visual Style:** 16-bit Pixel Art with vibrant Pakistani colors

---

## 📌 QUICK SUMMARY (Read This First)

You are building a Pakistani-themed 2D runner game where the player travels from **Lahore → GT Road → Islamabad** as a young man on foot and motorbike. Think *Subway Surfers* meets *Celeste*, but desi.

**Core loop:**
> Run → Avoid obstacles → Collect cash → Reach the finish line.

---

## 🗂 TABLE OF CONTENTS

1. [What the Game Is](#1-what-the-game-is)
2. [File Structure](#2-file-structure)
3. [How the Game Engine Works](#3-how-the-game-engine-works)
4. [The Player](#4-the-player)
5. [Controls](#5-controls)
6. [Levels & Story Flow](#6-levels--story-flow)
7. [Hazards & Enemies](#7-hazards--enemies)
8. [Special Game Modes](#8-special-game-modes)
9. [Extra Features (Brainstorm List)](#9-extra-features-brainstorm-list)
10. [Economy — Money, Health & Fuel](#10-economy--money-health--fuel)
11. [Performance Rules](#11-performance-rules)
12. [All Assets Needed](#12-all-assets-needed)
13. [Where to Get Free Assets](#13-where-to-get-free-assets)
14. [Build Order (Step-by-Step)](#14-build-order-step-by-step)
15. [How to Deploy / Publish](#15-how-to-deploy--publish)
16. [⚠️ Issues & Recommended Improvements](#16-️-issues--recommended-improvements)

---

## 1. What the Game Is

| Detail | Answer |
|---|---|
| **Game Title** | Lahore to Islamabad |
| **Genre** | 2D side-scroller + runner |
| **Art Style** | 16-bit pixel art (like Celeste / Stardew Valley) |
| **Colors** | Turmeric yellow, emerald green, rickshaw orange, truck art magenta, chai brown |
| **Screen Size** | 800×450 pixels (16:9), scales to fill any screen |
| **Target FPS** | 60fps (works on 30–144Hz screens too) |
| **Controls** | Keyboard (PC) + on-screen touch buttons (mobile) |
| **Sound** | .ogg files (primary), .mp3 (fallback), .wav (backup) |
| **Art Approach** | Build with colored shapes first → replace with real pixel art later |
| **Assets Folder** | `assets/sprites/`, `assets/bg/`, `assets/audio/`, `assets/hud/` |

---

## 2. File Structure

```
LahoreToIslamabad/
│
├── index.html          ← The webpage: canvas + HUD overlay
├── game.js             ← Main game loop (runs 60 times/sec)
├── player.js           ← Player: walk, jump, bike, animations
├── obstacles.js        ← Spawns & manages all hazards
├── levels.js           ← Level data, distances, city transitions
├── hud.js              ← Screen UI: hearts, wallet, fuel bar
├── audio.js            ← Plays all sounds with fallback chain
├── input.js            ← Reads keyboard + touch input
├── camera.js           ← 4-layer parallax scrolling background
├── particles.js        ← Visual effects (rain, sparks, dust)
├── utils.js            ← Helper functions (collision, math)
├── modes.js            ← Special modes (load shedding, chalaan chase, bonus)
│
└── assets/
    ├── sprites/        ← Player, enemies, items (PNG files)
    ├── bg/             ← Background images per level (PNG)
    ├── audio/          ← All sound effects + music (.ogg/.mp3)
    └── hud/            ← Heart icons, fuel bar, rupee icon (PNG)
```

> **One rule:** Each file does only ONE thing. Don't mix logic.

---

## 3. How the Game Engine Works

### 3.1 The Game Loop
Every frame (1/60th of a second), the game does this in order:

```
1. Calculate time since last frame (deltaTime)
2. If PAUSED → skip, just show frozen frame
3. UPDATE everything:
   - Move player
   - Move obstacles
   - Move camera
   - Update particles
   - Check collisions
   - Check if level is complete
   - Update audio
4. DRAW everything:
   - Clear screen
   - Draw backgrounds (far → near, 4 layers)
   - Draw obstacles
   - Draw player
   - Draw particles
   - Draw HUD (hearts, cash, fuel)
   - Draw any special mode overlays
5. Repeat → next frame
```

### 3.2 Delta-Time (Why the Game Runs at the Same Speed on All Devices)

Every movement value is **multiplied by deltaTime** so the game feels identical at 30fps or 144fps.

| FPS | deltaTime | Effect |
|---|---|---|
| 60fps (standard) | 1.0 | Normal speed |
| 120fps (gaming monitor) | 0.5 | Half movement per frame = same speed |
| 30fps (low-end phone) | 2.0 | Double movement per frame = same speed |

Formula: `position += velocity × deltaTime`

### 3.3 Screen Scaling

- Internal canvas: **800×450 px** (never changes)
- CSS stretches this to fit any screen while keeping 16:9 ratio
- Pixel art stays sharp: `ctx.imageSmoothingEnabled = false`
- Touch coordinates are adjusted with: `canvas.width / canvas.clientWidth`

---

## 4. The Player

### 4.1 Two Modes

The player can be in **Foot Mode** or **Bike Mode** at any time.

```
FOOT MODE:
  - IDLE       → standing still
  - RUNNING    → moving right
  - JUMPING    → in the air
  - DUCKING    → crouching (hitbox becomes half height)
  - HURT       → flashing after taking damage (1.5 seconds)

BIKE MODE:
  - RIDING     → moving fast (2.5× foot speed)
  - JUMPING    → in the air on bike (lower jump)
  - CRASHING   → bike destroyed, return to FOOT MODE
```

### 4.2 Player Stats

**Foot Mode:**
| Stat | Value |
|---|---|
| Hitbox | 32×64 px |
| Walk Speed | 200 px/s |
| Jump Force | −450 px/s (upward) |
| Gravity | 980 px/s² |
| Duck Hitbox | 32×32 px (half height) |

**Bike Mode:**
| Stat | Value |
|---|---|
| Hitbox | 64×54 px |
| Ride Speed | 500 px/s |
| Jump Force | −350 px/s (smaller jump) |
| Gravity | 1960 px/s² (falls faster) |
| Background Speed | 2.5× faster scroll |

### 4.3 Switching Modes

| Trigger | What Happens |
|---|---|
| Player collects **Bike Key** | 0.5s mounting animation → enters BIKE MODE |
| Bike hits an obstacle | `demoteToFoot()` → 1.5s invincibility flash |
| Fuel runs out | Bike slows and stops → 1s dismount animation → FOOT MODE |
| Player presses "dismount" | ❌ NOT allowed — bike stays until crash or fuel runs out |

---

## 5. Controls

### 5.1 Keyboard (PC)

| Key | Action |
|---|---|
| `↑` / `W` / `Space` | Jump |
| `↓` / `S` | Duck (foot) / Brake future |
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `P` / `Escape` | Pause |
| `M` | Mute/unmute |

### 5.2 Touch Buttons (Mobile)

- Screen is split: **left half** = directional zone, **right half** = jump zone
- 4 on-screen arrows + jump button (all 60×60 px, semi-transparent)
- Buttons **hide after 2 seconds** of no touch, reappear on first tap
- Button size scales with screen width on different phones

---

## 6. Levels & Story Flow

### 6.1 The Three Cities

| Level | City | Vibe | Time of Day |
|---|---|---|---|
| 1 | **Lahore** | Local street hustle | Warm dawn, golden chaos |
| 2 | **GT Road** | Highway sprint | Hot midday, dusty fields |
| 3 | **Islamabad** | Capital finish line | Cool dusk, clean and green |

Each city = **3,000 distance units** to cross.

Between cities: **"Ammi's Pocket Money Hunt"** bonus stage (15 seconds, collect falling notes).

### 6.2 All Sub-Levels

**Level 1.1 — Mama's Doodh Run (Lahore)**
- Foot mode ONLY (no bike)
- Start with Rs. 500 in wallet
- Win condition: reach the Milk Shop AND still have ≥ Rs. 500
- Hazards: stray dogs, open gutters

**Level 1.2 — Liberty Market Rush (Lahore)**
- Bike Key collectible appears at 1,500 units (first bike unlock)
- New hazards: Qingqi rickshaws, moving cars
- Win: survive to 3,000 units

**Level 2.1 — Truck Art Gauntlet (GT Road)**
- Scroll speed is 1.5× faster than normal
- New collectibles: Petrol Bottles (restore 25% fuel)
- New hazard: Speed cameras (fine Rs. 500 in bike mode)
- High obstacle density

**Level 2.2 — Jhelum Toll Plaza (GT Road)**
- Toll gate barrier appears at 2,800 units, **screen stops**
- Player must choose:
  - Pay Rs. 1,000 → gate opens automatically
  - OR attempt a pixel-perfect max-speed jump over the barrier
- Total distance: 3,500 units

**Level 3.1 — Safe City Signal Sprint (Islamabad)**
- Speed cameras overhead (only penalize bike mode)
- Clean visuals, lower density hazards
- Distance: 3,000 units

**Level 3.2 — Final Climb to Monal (Islamabad)**
- Gravity pulls player backward (−50 px/s²) — uphill feel
- Margalla Hills visible in background, road tilts upward
- Win: reach 4,000 units → Monal Restaurant asset → game victory
- End screen: celebration particles, "BOHAT HARD!" text, final score

---

## 7. Hazards & Enemies

### 7.1 All Hazards

| Hazard | Moves? | Size | Behavior | Foot Damage | Bike Damage |
|---|---|---|---|---|---|
| **Stray Dog** | Yes | 40×28 | Idles, then sprints at player | −1 Heart | Demote to Foot |
| **Open Gutter** | No | 48×16 | Pit in ground, must jump | −1 Heart | Demote to Foot |
| **Qingqi Rickshaw** | Yes | 56×44 | Moves right→left, variable speed | −1 Heart | Demote to Foot |
| **Careless Biker** | Yes | 40×36 | Same as rickshaw, faster | −1 Heart | Demote to Foot |
| **Speed Camera** | No | 24×36 | Overhead, only hits bike mode | No effect | −Rs. 500 fine |
| **Toll Barrier** | No | 200×40 | Blocks path entirely | Stops you | Stops you |
| **Overhead Wires** | No | 200×8 | High up, only hits bike jump | No effect | Demote to Foot |

### 7.2 How Collision Works

The game uses **AABB** (box vs. box) collision detection — simple and fast:

```javascript
function checkAABB(a, b) {
    return (a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y);
}
```

**What happens on collision:**
- If on **bike** → demote to foot + 1.5s invincibility
- If on **foot** → lose 1 heart + screen shake
- If hearts reach **0** → Game Over

### 7.3 Object Pooling (Performance)

Instead of creating and deleting objects (which causes lag), the game **reuses** a fixed set of slots:

- 10 obstacle slots
- 20 coin slots
- 50 particle slots

When something goes off-screen, it's "recycled" back into the pool — not deleted.

---

## 8. Special Game Modes

### 8.1 WAPDA Load Shedding Mode 🔦
**When:** Night-time sub-levels

- Screen goes **90% black**
- Foot: torch cone (60° triangle, yellow)
- Bike: headlight (30° narrower, flickers when fuel is low)
- Hazards only visible inside the light cone
- Audio: crickets, generator hum, occasional dog bark

### 8.2 Chalaan Escape Mode 🚔
**When:** Specific sub-levels with `isChaseModeActive: true`

- Traffic Warden chases you from the left edge
- Warden speed: always **10% faster** than the player
- 45-second countdown on HUD
- Hit an obstacle → 0.5s stun → Warden catches up → −Rs. 500 fine → timer resets
- Survive 45 seconds → win Rs. 1,000 bonus

### 8.3 Ammi's Pocket Money Hunt 💸
**When:** After each major level

- Background changes to home/village scene (no hazards)
- 15 seconds only
- Currency notes rain diagonally from the sky (Rs. 10, 100, 500)
- Move left/right to collect
- Total collected → added to wallet → next level loads

---

## 9. Extra Features (Brainstorm List)

> These are ideas — not all confirmed for MVP. Prioritize ones marked ✅

| Feature | Status | Description |
|---|---|---|
| **Truck Art Garage** | ✅ Build this | Between levels: spend Rs. on bike upgrades (bigger tank, shield, speed boost) |
| **Chai Power-Up** | ✅ Build this | Chai cup collectible → 5 seconds of double speed + invincibility |
| **Jugaad Repair** | ✅ Build this | Rare roadside mechanic (5% spawn) → pay Rs. 200 to get bike back |
| **Parchi Lottery** | 🔁 Optional | Collect 3 parchis → random Rs. reward at level end |
| **Sabzi Mandi Zone** | 🔁 Optional | Slippery zone for 200 units (banana peels, vegetable crates) |
| **Monsoon Flood Mode** | 🔁 Optional | Rising water level, must stay on high platforms |
| **SMS Notifications** | ✅ Easy win | Funny cultural popups ("Ammi: doodh le aana!") — no gameplay effect |
| **Billboard Parody Ads** | ✅ Easy win | Pakistani brand parodies on GT Road billboards |
| **Crowd Reactions** | 🔁 Optional | NPCs react when player speeds by |
| **Road Construction Zone** | 🔁 Optional | −30% speed zone, detour path available |
| **Leaderboard** | ✅ Build this | localStorage: high score, max distance, max wallet |
| **Daily Challenge** | 🔁 Optional | Same seed every day, shareable score text |

---

## 10. Economy — Money, Health & Fuel

### ❤️ Hearts (Lives)
- You have **5 hearts**
- Lose 1 heart per collision in **foot mode**
- Hearts **cannot be recovered** (permadeath system)
- 0 hearts → Game Over screen showing distance + wallet total

### 💰 Wallet (Rs.)
| Action | Effect |
|---|---|
| Start game | Rs. 0 (or Rs. 500 in Level 1.1) |
| Collect cash sprite | +Rs. 10 / 50 / 100 |
| Toll plaza | −Rs. 1,000 |
| Speed camera | −Rs. 500 |
| Chalaan caught | −Rs. 500 |
| Bike repair | −Rs. 200 |
| Upgrades | −Rs. 200 to 800 |

### ⛽ Fuel Gauge
- **Only active in Bike Mode**
- Max: 100 units
- Drains at **5 units/second** while riding
- Petrol Bottle collectible: **+25 fuel**
- At 0 → bike stops → forced back to Foot Mode
- HUD bar: gradient green → yellow → red

---

## 11. Performance Rules

| Rule | Why |
|---|---|
| **Delta-time on all movement** | Same speed on every device |
| **Object pooling for obstacles, coins, particles** | No memory lag from creating/deleting objects |
| **Parallax culling** | Only draw things visible on screen |
| **Texture atlas (future)** | Pack all sprites into 1 image for speed |
| **Lazy-load backgrounds** | Only load current level's assets |
| **Service Worker caching** | Instant load after first visit |
| **Audio sprites** | Combine short sounds into one file |
| **TinyPNG compression** | 50–80% smaller image files |
| **JS minification** | Smaller code file for faster load |

---

## 12. All Assets Needed

### 🧍 Player Sprites

| ID | Sprite | Size | Frames |
|---|---|---|---|
| P1 | Foot — Idle | 32×64 | 1 |
| P2 | Foot — Running | 32×64 | 4 |
| P3 | Foot — Jumping | 32×64 | 1 |
| P4 | Foot — Ducking | 32×32 | 1 |
| P5 | Foot — Hurt | 32×64 | 1 |
| P6 | Bike — Idle | 64×54 | 1 |
| P7 | Bike — Riding | 64×54 | 3 |
| P8 | Bike — Jumping | 64×54 | 1 |
| P9 | Bike — Crashing | 64×54 | 1 |

### 🎯 Collectibles

| ID | Item | Size |
|---|---|---|
| C1 | Bike Key | 16×16 |
| C2 | Petrol Bottle | 16×24 |
| C3 | Cash Rs. 10 | 12×16 |
| C4 | Cash Rs. 50 | 12×16 |
| C5 | Cash Rs. 100 | 12×16 |
| C6 | Chai Cup | 16×16 |
| C7 | Parchi Ticket | 12×16 |
| C8 | Petrol Can (full) | 24×24 |

### 💥 Hazard Sprites

| ID | Hazard | Size |
|---|---|---|
| H1 | Stray Dog — Idle | 40×28 |
| H2 | Stray Dog — Sprinting | 40×28 |
| H3 | Open Gutter | 48×16 |
| H4 | Qingqi Rickshaw | 56×44 |
| H5 | Careless Biker | 40×36 |
| H6 | Speed Camera | 24×36 |
| H7 | Toll Barrier | 200×40 |
| H8 | Overhead Wires | 200×8 |
| H9 | Traffic Warden | 48×56 |
| H10 | Construction Cone | 16×24 |

### 🖼 Backgrounds (4 Layers Per City)

| Layer | What It Shows | Scroll Speed |
|---|---|---|
| Layer 4 (far) | Sky, distant landmarks (Badshahi, Faisal Mosque, Margalla Hills) | Slowest |
| Layer 3 (mid) | Buildings, trees, GT road vehicles | Medium |
| Layer 2 (near) | Shops, street-level details | Fast |
| Layer 1 (foreground) | Pavement, ground details | Fastest |

### 🖥 HUD UI Elements

| ID | Element | Size |
|---|---|---|
| U1–U2 | Heart (full / empty) | 12×12 |
| U3–U6 | Fuel bar (bg + 3 fill states) | 120×16 |
| U7 | Rupee "Rs." icon | 12×12 |
| U8–U12 | Touch arrow buttons (×5) | 60×60 |

### 🔊 Audio Files (25 Total)

| ID | Sound | Type | Length |
|---|---|---|---|
| A1 | Footstep loop | SFX loop | 0.4s |
| A2 | Jump grunt | SFX | 0.3s |
| A3 | Landing thud | SFX | 0.15s |
| A4 | Bike kickstart | SFX | 1.5s |
| A5 | Bike engine loop | SFX loop | 2.0s |
| A6 | Bike engine (low fuel sputter) | SFX loop | 1.5s |
| A7 | Bike crash | SFX | 0.8s |
| A8 | Collect cash | SFX | 0.2s |
| A9 | Collect bike key | SFX | 0.3s |
| A10 | Collect petrol | SFX | 0.25s |
| A11 | Dog bark + sprint | SFX | 0.5s |
| A12 | Gutter splash | SFX | 0.3s |
| A13 | Rickshaw horn | SFX | 0.4s |
| A14 | Speed camera flash | SFX | 0.2s |
| A15 | Heart loss | SFX | 0.3s |
| A16 | Game Over jingle | SFX | 2.0s |
| A17 | Level Complete cheer | SFX | 1.5s |
| A18 | Chai power-up | SFX | 0.4s |
| A19 | Parchi collect | SFX | 0.2s |
| A20 | Warden siren loop | SFX loop | 3.0s |
| A21 | Lahore ambient BGM | Music loop | 30s |
| A22 | GT Road ambient BGM | Music loop | 30s |
| A23 | Islamabad ambient BGM | Music loop | 30s |
| A24 | Bonus Stage music | Music loop | 15s |
| A25 | Main Menu theme | Music loop | 15s |

---

## 13. Where to Get Free Assets

### Sprites & Art

| Tool | URL | Use For |
|---|---|---|
| Piskel | piskelapp.com | Free browser pixel art editor |
| LibreSprite | libresprite.github.io | Free Aseprite clone (best option) |
| Kenney.nl | kenney.nl | Free CC0 game assets |
| OpenGameArt | opengameart.org | Community pixel art |
| itch.io Assets | itch.io/game-assets | Free sprite packs |
| Leonardo.ai | leonardo.ai | AI art → downscale to pixel (150 free/day) |
| TinyPNG | tinypng.com | Compress your PNG files |

### Audio

| Tool | URL | Use For |
|---|---|---|
| JSFXR | sfxr.me | 8-bit jump/coin/hit sounds |
| Freesound.org | freesound.org | Real recordings (engines, dogs, horns) |
| ElevenLabs SFX | elevenlabs.io | AI-generate sounds from text |
| Audacity | audacityteam.org | Edit, loop, trim audio (free) |
| Mixkit | mixkit.co | Free music + SFX |
| OggConverter | oggconverter.com | Convert .mp3/.wav to .ogg |
| Your Phone | Built-in recorder | Record real 70cc bike, dogs, traffic |

---

## 14. Build Order (Step-by-Step)

### ✅ Phase 1 — Working Game with Colored Shapes (No Art Yet)

| Step | File | What You Build |
|---|---|---|
| 1 | `index.html` | Canvas element + HUD HTML structure |
| 2 | `game.js` | Game loop, deltaTime, pause/play, state manager |
| 3 | `input.js` | Keyboard + touch input mapping |
| 4 | `player.js` | Foot mode, bike mode, state machine, physics |
| 5 | `obstacles.js` | Object pool, 4 hazard types, AABB collision |
| 6 | `levels.js` | Level data, distance tracking, win conditions |
| 7 | `camera.js` | 4-layer parallax with colored rectangles |
| 8 | `hud.js` | Hearts, wallet display, fuel gauge |
| 9 | `audio.js` | Sound manager with .ogg → .mp3 → .wav fallback |
| 10 | `particles.js` | Rain, dust, sparks, coin sparkle effects |
| 11 | `modes.js` | Load shedding, chalaan escape, bonus stage |
| 12 | `utils.js` | AABB function, random, lerp, clamp helpers |

### 🎨 Phase 2 — Polish & Complete Game Logic

| Step | What You Build |
|---|---|
| 13 | Level gate logic (milk shop, toll plaza, final climb) |
| 14 | Ammi's Pocket Money bonus stage integration |
| 15 | Load Shedding light cone rendering |
| 16 | Chalaan warden chase + timer logic |
| 17 | UI transitions (level complete, game over screen) |
| 18 | Particles tied to mode events |
| 19 | Pause menu + mute toggle |
| 20 | Game balance: spawn rates, distances, cash values |

### 🖼 Phase 3 — Replace Shapes with Real Pixel Art

| Step | What You Do |
|---|---|
| 21 | Replace colored boxes with player/hazard sprite sheets |
| 22 | Replace colored BG boxes with parallax tile PNGs |
| 23 | Replace HUD shapes with icon sprites |
| 24 | Add all audio files to `audio.js` |
| 25 | Create texture atlas (single sprite sheet file) |

### 🚀 Phase 4 — Publish

| Step | What You Do |
|---|---|
| 26 | Minify all JS files |
| 27 | Compress all PNGs via TinyPNG |
| 28 | Create GitHub repo + push all code |
| 29 | Enable GitHub Pages |
| 30 | Test on real mobile browser |
| 31 | Wrap with Capacitor → generate Android APK |
| 32 | Publish to Play Store |

---

## 15. How to Deploy / Publish

### 🌐 Option A: Website (GitHub Pages — Free)

```
1. Create GitHub repo: "LahoreToIslamabad"
2. Push all game files
3. Go to Settings → Pages → select "main" branch root
4. Game lives at: https://yourusername.github.io/LahoreToIslamabad/
```

### 📱 Option B: Android App (Capacitor — Free)

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android
npx cap init LahoreToIslamabad
npx cap add android
# Copy game files to www/ folder
npx cap sync
npx cap open android   # Opens Android Studio → Build APK
```

### 📲 Option C: PWA (No App Store Needed)

```
1. Add manifest.json (app name, icons, theme color)
2. Add a Service Worker (for offline play)
3. Users tap "Add to Home Screen" from browser
4. OR use PWABuilder.com to generate APK without Android Studio
```

### 🏪 Option D: Google Play Store

```
1. Generate signed APK via Capacitor
2. Google Play Developer account ($25 one-time fee)
3. Upload APK, screenshots, description
4. Game name: "Lahore to Islamabad — The Desi Road Trip"
```

### Git Commit Convention

| Prefix | Meaning |
|---|---|
| `[P1S3]` | Phase 1, Step 3 |
| `[FIX]` | Bug fix |
| `[ASSET]` | New art or sound added |
| `[DEPLOY]` | Deployment config |

---

## 16. ⚠️ Issues & Recommended Improvements

These are gaps in the original spec that should be addressed:

### 🔴 Critical (Must Fix Before Building)

| Issue | Problem | Fix |
|---|---|---|
| **No save system** | Player progress is lost on refresh | Add localStorage save for level reached, wallet, upgrades |
| **No MVP scope** | Section 9 mixes "confirmed" and "maybe" features — unclear what to actually build | Mark each feature as MVP / Post-launch / Stretch goal |
| **No difficulty scaling formula** | Obstacle spawn rate isn't defined as a curve | Define: `spawnRate = baseRate + (distance / 500) * 0.1` |
| **No error handling plan** | Audio files might fail to load, images might 404 | Add try/catch for all asset loads, show placeholder on fail |

### 🟡 Important (Fix Soon)

| Issue | Problem | Fix |
|---|---|---|
| **Wallet floor not defined** | Can wallet go negative? Can player be broke at Rs. −500? | Define: wallet cannot go below Rs. 0 |
| **No Urdu language support** | Game has Urdu phrases in story, but no language toggle | Add Urdu font support and simple i18n string map |
| **Asset naming is inconsistent** | Original file uses "file1.md", "file2.md" for references | Standardize all asset filenames: `player_foot_idle.png`, etc. |
| **Touch button overlap on small screens** | 60×60 buttons may overlap on 4" phones | Use `vw`-based sizing, test on 360px width screen |
| **Leaderboard only local** | No global competition | Add Firebase Firestore as a stretch goal |

### 🟢 Nice to Have (Improvements)

| Improvement | Why |
|---|---|
| **Difficulty level select** (Easy / Normal / Hard) | Accessibility for younger players or beginners |
| **Checkpoint system** | On long levels, let player restart from a midpoint |
| **Bike manual dismount** | Currently impossible — add as a risky mechanic |
| **Screen reader / accessibility hints** | Good practice for wider audience |
| **Analytics** (Firebase / Plausible) | Track where players die most, optimize those sections |
| **Offline-first from Day 1** | Service Worker should be in Phase 1, not Phase 4 |
| **Monetization plan** | Banner ad? One-time unlock? Cosmetics? Define early |

---

## 🧠 How to Work on This with an AI (Like Claude or ChatGPT)

1. Start every session: *"Read CLEAN-SPEC.md. Let's continue from Phase X, Step Y."*
2. Complete **one step at a time** — one step = one commit
3. Test each step before moving to next
4. For sprites: share the asset manifest, ask AI to write image generation prompts
5. After each working change: commit with the right prefix

```bash
git add .
git commit -m "[P1S4]: Add player state machine and physics"
git push origin main
```

---

*Clean Spec v3.0 — Lahore to Islamabad*
*Simplified from MASTER-SPEC v2.0 for clarity and completeness*
