# 🎮 LAHORE TO ISLAMABAD — MASTER GAME SPEC
**Version:** 5.0 — Story Mode Overhaul + Chapter System
**Genre:** 2D Side-Scrolling Platformer + Story Adventure
**Platform:** Web (PC + Mobile) → Android App
**Visual Style:** 16-bit Pixel Art — Vibrant Pakistani Color Palette

---

## 📌 WHAT THIS GAME IS NOW

This is no longer just a runner game. It is a **story-driven adventure** with chapters, a main character with a goal, emotional moments between levels, and a journey that keeps going far beyond Islamabad.

**The feel:** Think *Dave the Diver* or *Celeste* — a simple 2D game that has a real story beating through it.

**Core Loop:**
> Watch a story beat → Feel motivated → Run the level → Earn money → Unlock the next chapter

---

## 📖 THE MAIN STORY (Big Picture)

**Main Character:** Ali — a young boy from a poor Lahore mohallah, maybe 16–17 years old.

**The Dream:** Ali has always wanted to see Islamabad — the big city he has only seen on TV. Clean roads, green avenues, mountains in the background. He wants to go.

**The Problem:** No money. No transport. Just his two feet and his Dada's rusting CD-70 in the garage.

**The Journey:** Chapter by chapter, Ali works, earns, rides, struggles — and discovers that every destination he reaches just reveals the next one he wants to reach. Islamabad leads to Murree. Murree leads to Naran. The road never truly ends.

**Mama's Role:**
- Appears at the START of the game as a **shadow/silhouette** (backlit by kitchen light, standing in a doorway)
- Speaks in Urdu, warm but practical
- Gives Ali his first task to earn travel money
- Her dialogue is shown at the start of each chapter as a memory/flashback
- She becomes more proud as Ali travels further

---

## 🗺️ CHAPTER STRUCTURE OVERVIEW

| Chapter | Location | Theme | New Destination Revealed |
|---|---|---|---|
| **0 (Prologue)** | Ali's Home | Mama's shadow, the dream begins | → Lahore Streets |
| **1** | Lahore | Earn money, explore the city | → GT Road |
| **2** | GT Road | The open highway, Pakistan's backbone | → Islamabad |
| **3** | Islamabad | The capital dream realized — but there's more | → Murree |
| **4** | Murree | Mountains, pine trees, the cold | → Naran Valley |
| **5** | Naran / Kaghan Valley | Rivers, snow-peaks, adventure | → ??? (open ended) |

> **Design Rule:** The player never feels like the game is "done." Every chapter ending teases the next.

---

## 📜 CHAPTER 0 — THE PROLOGUE (Home Screen / Intro)

This is not a playable level. It is a **cutscene/story screen** shown before the player hits START.

### What the Player Sees:

**Scene:** A small house in a Lahore mohallah. Night. A single bulb flickering. Ali sits on the charpoy looking at a TV showing a news segment about Islamabad's wide roads and beautiful Faisal Mosque.

**Mama enters** — shown as a **warm silhouette** (backlit from the kitchen, no face, just the outline of a woman in a dupatta carrying a steel glass of chai).

**Dialogue (appears as subtitles, one line at a time):**

```
Mama: "Ali, TV band karo. Subah uthna hai."

Ali:  "Ammi... Islamabad kaisa hota hai?"

Mama: [pause] "Door hai. Aur teri jeb mein kuch nahi."

Ali:  "Main kamaaunga. Khud jaunga."

Mama: [sets chai down, half-smiling shadow]
      "Theek hai. Kal subah sabse pehle doodh le aana.
       Aur koi kaam aata hai toh bata dena.
       Safar apne aap shuru hota hai, chotay."
```

**Then the screen fades to black.**

Text appears:

```
CHAPTER 1: LAHORE
"Har safar ghar se shuru hota hai."
(Every journey begins at home.)
```

**→ PRESS START / TAP TO PLAY**

---

## 🏙️ CHAPTER 1: LAHORE — "Ghar Se Nikal"

**Story:** Ali wakes up early. He has no money for the journey. Mama has given him two jobs — run the morning errands to prove he's serious, then hustle in Liberty Market. Every rupee he earns brings him one step closer to the road.

**Chapter Intro Screen (before Level 1.1):**
```
[Mama's shadow silhouette in doorway]
"Ali, doodh le aana — aur haath paint mat karna is baar."
500 Rupees in Ali's pocket. Milk Shop: 3 km ahead.
```

---

### LEVEL 1.1 — Mama's Doodh Run

| Detail | Value |
|---|---|
| **Mode** | FOOT ONLY (no bike ever) |
| **Starting Wallet** | Rs. 500 |
| **Distance** | 8,000 m |
| **Scroll Speed** | 140 px/s |
| **Duration** | ~1.5 minutes |
| **Win Condition** | Reach Milk Shop AND wallet ≥ Rs. 500 |

**Hazards (gentle — tutorial level):**
- Stray dogs (slow, idle state only)
- Small gutters (easy to jump)
- A neighbor's kid who runs in front of you

**Collectibles:**
- Loose coins on the ground (Rs. 10, Rs. 20)
- A guava fallen from a tree (bonus Rs. 30 if collected)

**Environment:**
- Dawn. Orange sky. Narrow mohallah street.
- Neighbors' houses, a masjid in the background, a chai wala just opening his stall.
- Milestone sign: "DOODH WALA: 500m"

**Level End (Story Beat):**
```
Ali reaches the Milk Shop.
[Milestone sprite: clay pots, hand-painted "DOODH" sign]
"Doodh le liya. Ammi khush."
+Rs. 50 bonus (correct change returned)
```

**Transition to 1.2:**
```
[Mama's silhouette, sitting at kitchen table]
"Acha kiya. Ab thoda aur kamaao — kal ka safar nahi hoga
 aise hi 500 mein. Liberty Market ja, kuch kaam dhoondh."
```

---

### LEVEL 1.2 — Liberty Market Rush

| Detail | Value |
|---|---|
| **Mode** | FOOT → BIKE (Bike Key at 3,000m) |
| **Starting Wallet** | Carried over from 1.1 |
| **Distance** | 8,000 m |
| **Scroll Speed** | 150 px/s |
| **Duration** | ~1.5 minutes |
| **Win Condition** | Reach distance + collect at least Rs. 800 total |

**Story Beat (intro):**
```
Ali is doing delivery runs through Liberty Market.
Packages to deliver. Crowds everywhere.
At 3,000m: he spots Dada's CD-70 parked outside a shop.
Key is in the ignition. "Koi nahi dekhega..."
[Bike Key collectible spawns]
```

**Hazards:**
- Qingqi Rickshaws (weaving, fast)
- Careless bikers
- Construction cones (Liberty Market is always under construction)
- **Traffic Warden (Chalaan)** triggers at 4,000m — chases for 45 seconds

**New Mechanic:** Delivery Packages
- Random crates appear on the ground (collect them)
- Deliver to a marked shopfront (distance marker)
- Reward: Rs. 100-200 per delivery

**Level End Story Beat:**
```
[Ali stops. Wallet shows: Rs. 1,200+]
"Paise ho gaye. Ab bas ek cheez chahiye — petrol."
```

**Chapter 1 Complete Screen:**
```
★ CHAPTER 1 COMPLETE ★
Ali has earned his travel money.
The road is calling.

Mama (shadow, from behind):
"Tera wallet toh bhar gaya. Par GT Road pe apna dimaag bhi rakh."

[NEXT CHAPTER → GT ROAD]
```

---

## 🛣️ CHAPTER 2: GT ROAD — "Asli Imtehaan"

**Story:** Ali gets on Dada's CD-70, stuffs his wallet in his shalwar kameeez pocket, and hits the GT Road — the ancient highway that has carried armies, poets, and truck art for centuries. It's loud, it's dusty, it's alive.

**Chapter 2 Intro Screen:**
```
[Ali on bike, looking at open highway stretching ahead]
[Mama's voice — text only, like a remembered warning]
"Abbu ne kaha tha — GT Road pe hoshiyar rehna.
 Truckers nahi dekhte. Police nahi sunte.
 Aur kutta toh bilkul nahi manta."
```

---

### LEVEL 2.1 — Truck Art Gauntlet

| Detail | Value |
|---|---|
| **Mode** | BIKE PRIMARY (can crash to foot) |
| **Starting Wallet** | Carried over from Chapter 1 |
| **Distance** | 8,000 m |
| **Scroll Speed** | 170 px/s |
| **Duration** | ~1.5 minutes |
| **Win Condition** | Survive to end of distance |

**Story Beat at start:**
```
0m: "GT Road. 400 kilometers. Truck ke peeche truck."
3,000m: [LOAD SHEDDING triggers — total darkness, torch cone]
        "Bijli nahi. Pakistan mein normal hai."
```

**Hazards:**
- Massive trucks (2× wider than rickshaws — harder to dodge)
- Speed cameras (−Rs. 500 fine in bike mode)
- Oil slicks on road (player slides 50% further on landing)
- **Petrol Bottles** spawn frequently (you NEED fuel here)

**Economy Guarantee (Toll Fix):**
```
By 6,000m:
  → Check player wallet
  → If wallet < Rs. 1,200 → spawn extra cash bundle (Rs. 300 guaranteed drop)
  → This ensures player can ALWAYS afford the Level 2.2 toll
```

**Level End Story Beat:**
```
[Milestone: "JHELUM: 2 KM"]
Ali sees the toll plaza in the distance.
"Yahan toh toll dena hoga..."
```

---

### LEVEL 2.2 — Jhelum Toll Plaza

| Detail | Value |
|---|---|
| **Mode** | BIKE or FOOT |
| **Starting Wallet** | Carried from 2.1 (GUARANTEED ≥ Rs. 1,200) |
| **Distance** | 8,000 m |
| **Scroll Speed** | 180 px/s |
| **Duration** | ~1.5 minutes |
| **Special** | Toll barrier at 6,000m |
| **Win Condition** | Pass the toll AND reach 8,000m |

**Toll Plaza Mechanic (FIXED — Full Details):**

The barrier appears at 6,000m. Scrolling stops. Player must choose:

```
OPTION A: Pay Rs. 1,000
  → Gate opens automatically
  → No risk
  → Player continues

OPTION B: Jump Over (velocity > 150 px/s in bike mode)
  → Max speed charge-up needed
  → If successful: save Rs. 1,000 + "CHALAAK!" bonus text
  → If failed: bike crashes into barrier → demote to foot, must pay Rs. 500 reduced fine

OPTION C: M-Tag Pass (if purchased from Garage)
  → Toll is FREE, gate opens instantly
```

**Economy Safety Net:**
- If player wallet < Rs. 1,000 at the toll: spawn a "Dost Ki Madad" event
  - A friend's pickup truck passes by, tosses Rs. 500 from window
  - Player only needs Rs. 500 total now to pass
  - Shows text: "Sheeda ne bachaa liya!"

**Level End Story Beat:**
```
[Ali crosses toll gate. Open highway ahead.]
Milestone: "ISLAMABAD: 150 KM"
Ali (thought bubble): "Itna door... lekin itna kareeb bhi."
```

**Chapter 2 Complete Screen:**
```
★ CHAPTER 2 COMPLETE ★
GT Road: Conquered.
[Truck silhouette driving off into sunset]
"Islamabad ab sirf ek raat dur hai."

[BONUS STAGE → Cash Rain]
[GARAGE → Upgrades Available]
[NEXT CHAPTER → ISLAMABAD]
```

---

## 🏛️ CHAPTER 3: ISLAMABAD — "Khwaabon Ka Sheher"

**Story:** Ali arrives in Islamabad. Wide roads. Trees. Silence compared to Lahore. It's beautiful. But a stranger at a dhaba tells him: "Yaar, Islamabad dekha? Acha. Ab Murree jao. Woh asal manzil hai."

**Chapter 3 Intro Screen:**
```
[Dawn. Ali enters Islamabad on the CD-70.]
[Faisal Mosque silhouette in background]
"Islamabad. 1,000 km² of wide roads and bureaucrats."
"But Ali only cares about the mountains he can see in the distance."

[A dhaba uncle, shown as shadow, smoking a cigarette]
Dhaba Wala: "Pehli baar aaye ho? Acha. Murree gaye ho?"
Ali: "Nahi..."
Dhaba Wala: "Toh kuch nahi dekha, bhai."
```

---

### LEVEL 3.1 — Safe City Signal Sprint

| Detail | Value |
|---|---|
| **Mode** | BIKE PRIMARY |
| **Distance** | 8,000 m |
| **Scroll Speed** | 180 px/s |
| **Duration** | ~1.5 minutes |
| **Special** | Speed cameras everywhere |

**Story Beat:**
```
0m: "Islamabad mein rules hote hain. Aur cameras bhi."
Every 1,500m: A speed camera flash + Rs. 500 fine (bike mode)
```

**New Hazard:** Traffic Signal
- Red/green signals appear
- Run a red in foot mode: −Rs. 100 fine (sentry at corner)
- Run a red in bike mode: speed camera triggers

**Environment:**
- Wide clean roads, green avenue trees, Embassy buildings
- No potholes (unusual, disorienting)
- Background: Margalla Hills getting closer

**Level End Story Beat:**
```
[Milestone: "ISLAMABAD END"]
Ali stops the bike. He's here.
He looks around. Clean. Organized. Beautiful.

Then he looks at the hills behind the city.

Text: "Yeh toh Islamabad hai. Lekin woh pahaad...?"
```

---

### LEVEL 3.2 — Final Climb to Monal

| Detail | Value |
|---|---|
| **Mode** | FOOT (bike struggles on steep incline — forced dismount at 500m) |
| **Distance** | 8,000 m |
| **Scroll Speed** | 180 px/s |
| **Gravity Modifier** | −40 px/s² backward pull (uphill feel) |
| **Duration** | ~1.5 minutes |
| **Win Condition** | Reach Monal Restaurant at 8,000m |

**Story Beat:**
```
0m: CD-70 stalls on the hill. Ali pushes it aside.
    "Pahaad par yeh nahi chale ga."
    [Forced dismount — bike disappears into bushes]
500m: Margalla Hills filling the entire background
3,000m: [SMS popup] Mama: "Kahan ho? Ammi pareshan hai."
        Ali (thought): "Ammi, main theek hoon. Main Monal ja raha hoon."
```

**Hazards:**
- Falling rocks (new! — come from above, must dodge sideways)
- Mountain goats (cross the path randomly, like stray dogs)
- Slippery pine needles on path (reduced friction zones)

**Level End — Chapter 3 Complete:**
```
[Ali reaches Monal Restaurant. Terrace overlooking the city.]
[Islamabad glitters far below. Mountains surround him.]

Ali sits on a bench. Breathes.

Text appears, one line at a time:
"Islamabad... dekh liya."
"Khoobsurat hai."
[Pause]
"Par yeh pahaadiyan..."
"Murree aur kitna dur hai yahan se?"

[A passing tourist uncle, silhouette]
Uncle: "Murree? Sirf ek ghante ki drive. Lekin upar barf milti hai is waqt."

Ali: "Barf???"

★ CHAPTER 3 COMPLETE ★
"Teri manzil badal gayi, Ali."
The mountains are calling.

[NEXT: CHAPTER 4 → MURREE]
```

---

## 🏔️ CHAPTER 4: MURREE — "Pahaadon Ki Awaaz"

**Story:** Ali finds a new CD-70 (rented from a local at Monal — costs Rs. 300 from wallet). The road to Murree is winding, cold, narrow, beautiful, and genuinely dangerous.

**Chapter 4 Intro Screen:**
```
[Night. A narrow mountain road. Pine trees on both sides.]
[Snow patches visible on the ground]
"Temperature: 4°C. Ali in a summer shalwar kameez."

[Mama's voice — remembered]
"Kapde garam pehno jab bahar jao."
Ali (thought): "Ammi, I did not listen."

[A local truck driver, shadow silhouette]
Truck Wala: "Yaar, Murree Bazaar seedha jao. Raat se pehle pahuncho.
            Nahi toh road band hoti hai barf mein."
```

---

### LEVEL 4.1 — Margalla Pass Night Ride

| Detail | Value |
|---|---|
| **Mode** | BIKE (new rented CD-70, fresh fuel) |
| **Distance** | 8,000 m |
| **Scroll Speed** | 160 px/s |
| **Duration** | ~1.5 minutes |
| **Special** | LOAD SHEDDING MODE active for entire level (mountain roads are dark) |

**New Hazards:**
- **Falling Rocks** — drop from sky, must dodge left/right
- **Mountain Curves** — speed camera but instead of fine, sudden wall appears → must brake (duck)
- **Snow Patches** — slippery ground (70% normal friction)
- **Stray Mountain Goats** — like dogs, but they headbutt (2× impact force)

**New Collectibles:**
- **Hot Chai Cup** — restores 20 fuel + temporary warmth glow (visual)
- **Woolen Shawl** — Ali wraps it (cosmetic but shows as sprite change, +1 heart max temp)

**Environment:**
- Dark winding road lit only by bike headlight
- Pine tree silhouettes on both sides
- Occasional lights of distant Murree Bazaar visible far ahead

**Economy:**
- No cash rain (mountain, no shops)
- Chai cups give small coin bonus (Rs. 50 per collect)
- Guarantee: if wallet < Rs. 500 at 6,000m → spawn Rs. 400 cash bundle

**Level End Story Beat:**
```
[Murree sign appears: "MURREE BAZAAR: 500m"]
Ali's bike headlight cuts through pine trees.
Ahead: strings of coloured lights. A bazaar.
Snow on rooftops.

"Yeh... Murree hai."
```

---

### LEVEL 4.2 — Murree Bazaar Rush

| Detail | Value |
|---|---|
| **Mode** | FOOT (Bazaar is crowded — no bike allowed) |
| **Distance** | 8,000 m |
| **Scroll Speed** | 160 px/s |
| **Duration** | ~1.5 minutes |
| **Special** | New: CROWD SURGE mechanic |

**Story Beat:**
```
0m: Ali parks the bike outside and walks into Murree Bazaar.
    "Kashmir Point: 3 km. Pindi Point: 5 km."
    The bazaar is packed with tourists.
2,000m: [SMS popup] Mama: "Beta, kuch khaaya? Yahan barish ho rahi hai."
                    Ali: "Ammi main theek hoon, barf dekh raha hoon!"
```

**New Mechanic — Crowd Surge:**
- Tourist crowds form walls every 1,500m
- Must find a gap to squeeze through (duck mechanic)
- OR jump over the crowd (they're crouching near shop windows)
- Miss: pushed back 200 units

**New Hazards:**
- **Tourist Selfie Sticks** — extend suddenly at mid-height (duck or jump)
- **Ice Patch** — slip mechanic (landing on ice = slide 300 units forward uncontrolled)
- **Monkey!** — Murree monkey steals Rs. 100 from wallet (dodge mechanic)
- **Bhutta Wala Cart** — moving obstacle, smells amazing, slows Ali down 50% if too close

**New Collectible:**
- **Hot Corn (Bhutta)** — +1 heart (restorative food — first time hearts can be restored!)

**Chapter 4 Complete Screen:**
```
★ CHAPTER 4 COMPLETE ★
Ali stands at Kashmir Point.
Below: clouds. Above: stars.
He's never been this high in his life.

[Text, slowly]
"Murree... yeh toh sirf shuruwaat hai."
"Aage kya hai?"

[A group of travellers walk past with big backpacks]
Traveller (silhouette): "Naran jaa rahe ho? Saif-ul-Malook lake dekho.
                        Wahan tak toh koi CD-70 nahi jaata though."
Ali: "Main jaunga."

★ NEXT CHAPTER: NARAN VALLEY ★
"Malika-e-Kohsar: The Queen of Mountains"
```

---

## 🏞️ CHAPTER 5: NARAN VALLEY — "Jahan Road Khatam Hoti Hai"

**Story:** Ali's CD-70 breaks down for good at the start of Naran. He must finish the last stretch on FOOT — but this is the hardest terrain yet. The final level is legendary.

**Chapter 5 Intro Screen:**
```
[Morning. A river valley. White mountains.]
[CD-70 lets out its last sputter and dies. Black smoke.]
Ali: "Oye nahi..."
[Looks at the mountains ahead. Saif-ul-Malook visible far above.]
[No more bike. Just feet. And a half-empty chai thermos.]

Mama's voice (phone call — icon shows):
"Ali beta, ab wapis aa jao. Kafi ho gaya na?"
Ali: "Ammi... ek kaam baaki hai."
```

---

### LEVEL 5.1 — Kaghan Valley River Road

| Detail | Value |
|---|---|
| **Mode** | FOOT ONLY (bike is dead) |
| **Distance** | 8,000 m |
| **Scroll Speed** | 140 px/s |
| **Duration** | ~1.5 minutes |
| **Special** | MONSOON FLOOD MODE active |

**Story Beat:**
```
0m: "No bike. No road signs. Just the river and the sky."
5,000m: It starts raining. Hard.
        [MONSOON FLOOD MODE activates]
        Water level rises 1px/sec from the bottom
        Standing pools become deep hazards
5,000m: [Sunrise animation over mountains — brief pause in gameplay]
         "Subah ho gayi. Raho. Bas thodi si aur."
```

**New Hazards:**
- **Flash Flood Puddles** — rising water pockets, jump to stay dry (landing in water = −1 heart)
- **Loose Rocks** — rolling downhill toward player (like rolling barrels)
- **Narrow Bridge** — 1/3 of normal width, can fall off sides (death = restart segment)
- **Jeep on Narrow Road** — massive vehicle takes up 70% of screen, must duck into ditch

**New Collectibles:**
- **Jeep Ride token** — collect 3 to hitch a jeep ride (free 2,000m progress)
- **Local Guide Buff** — following NPC shows safe path (highlights walkable ground for 10s)

---

### LEVEL 5.2 — Saif-ul-Malook Final Ascent (THE FINALE)

| Detail | Value |
|---|---|
| **Mode** | FOOT ONLY |
| **Distance** | 8,000 m |
| **Scroll Speed** | 140 px/s |
| **Gravity Modifier** | −60 px/s² backward pull (steepest uphill) |
| **Duration** | ~1.5 minutes |
| **Win Condition** | Reach the Lake (8,000m) |

**Story Beat:**
```
0m: "3,224 metres above sea level."
    "Your lungs hurt. Your legs hurt. Your sandals are wet."
    "Keep going."
2,000m: [Mama calls — cutscene]
        Phone icon flashes.
        Ali answers.
        Mama (breathing — she has climbed to the roof of their house):
        "Beta, main chhat par hoon. Teri direction mein dekh rahi hoon.
         Phir bhi nahi dikhte."
        Ali: "Ammi... main bahut upar hoon."
        Mama: "Theek hai. Wapis aa jaana."
        [Ali smiles. Keeps climbing.]
5,000m: Lightning storm begins.
         [New mechanic: Lightning strike zones — avoid the bright column appearing]
6,500m: Snow begins to fall. Screen slowly fills with white particles.
         "Barf. Real barf."
7,500m: The lake becomes visible — shimmering blue at the top of the screen.

8,000m: ARRIVE.
```

**GAME ENDING:**

```
[Full screen: Saif-ul-Malook Lake]
[Ali stands at the edge — silhouette like Mama was in the beginning]
[Mirror image of the opening scene — but now Ali is the one standing in awe]

[No dialogue for 3 seconds]

Then, slowly:
"Lahore se nikla tha ek larka."
"Doodh lane ke liye."

[Pause]

"Woh yahan pohonch gaya."

[The lake reflects the sky. Stars appear.]

[Phone rings. It's Mama.]
"Ali... ghar kab aa raha hai?"

[Ali laughs]

★★★ SAFAR MUKAMMAL ★★★
Your final score: [distance] km, Rs. [wallet], [hearts] hearts remaining
High Score saved.

[Share Score button]
"I completed Ali's journey from Lahore to Saif-ul-Malook! Can you?"

[PLAY AGAIN] [CHAPTER SELECT]
```

---

## 💰 ECONOMY FRAMEWORK (FULLY FIXED)

### The Toll Plaza Problem — SOLVED

The old spec had players reaching the Rs. 1,000 Jhelum toll without enough money. This is fixed at multiple levels:

**Rule 1: Wallet Tracking**
```
At Level 2.1, distance = 12,000m:
  IF wallet < 1,200:
    FORCE SPAWN: Rs. 300 cash bundle (guaranteed, cannot be missed — fills screen width)
    REPEAT every 1,000m until wallet >= 1,200
```

**Rule 2: Fallback Event**
```
At Level 2.2 toll barrier (14,000m):
  IF wallet < 1,000:
    Trigger "Sheeda Ki Madad" event:
      - Friend on a bike rides past, throws Rs. 500 from window
      - Text: "Yaar ne bachaa liya!"
      - Toll cost reduces to Rs. 500 for this attempt
      - Message: "Toll dena hi parta hai, yaar."
```

**Rule 3: Smarter Cash Distribution Per Level**

| Level | Min Cash Guaranteed | Why |
|---|---|---|
| 1.1 | Rs. 200 extra | Tutorial, give player confidence |
| 1.2 | Rs. 800 total from runs | Sets up Chapter 2 |
| 2.1 | Rs. 1,200 guaranteed by 12km | **Toll prep** |
| 2.2 | Rs. 500 fallback event | **Toll safety net** |
| 3.1 | Rs. 600 from speed dodges | Garage funding |
| 3.2 | Rs. 300 (mountain, sparse) | Chapter 4 rent |
| 4.1 | Rs. 400 (chai cups) | Bazaar spending |
| 4.2 | Rs. 600 from bazaar | Chapter 5 prep |
| 5.1–5.2 | Rs. 200 (sparse final run) | Final stretch reward |

---

### ❤️ Hearts (Lives) — Updated

| Rule | Value |
|---|---|
| Max Hearts | 5 |
| Lose on foot collision | −1 Heart |
| Recover hearts | **YES** — Bhutta (corn) in Chapter 4+ restores 1 heart |
| Game Over | 0 hearts → show distance, wallet, chapter reached |
| Chapter 4+ | Max hearts can be 6 if Woolen Shawl collected |

### 💰 Wallet — Updated

| Action | Effect |
|---|---|
| Collect Rs. 10 / 50 / 100 / 500 | + that amount |
| Near-miss combo (CLOSE CALL!) | + Rs. combo × 10 |
| Delivery bonus (Level 1.2) | + Rs. 100–200 |
| Chai Cup | + Rs. 50 |
| Jeep Ride token | + 2,000m progress |
| Toll Plaza | − Rs. 1,000 (or 500 with fallback) |
| Speed Camera | − Rs. 500 |
| Chalaan caught | − Rs. 500 |
| Monkey steal (Chapter 4) | − Rs. 100 |
| Bike rent (Chapter 4 start) | − Rs. 300 |
| Jugaad repair | − Rs. 200 |
| Garage upgrade | − Rs. 400–800 |
| **Wallet floor** | **Cannot go below Rs. 0** |

### ⛽ Fuel — Updated

| Stat | Value |
|---|---|
| Max Fuel | 150 units |
| Drain per second | 3 units/sec |
| Petrol Bottle | +25 fuel |
| Chai Cup (Chapter 4) | +20 fuel |
| Total bike time | ~50 seconds per full tank |
| Empty → | Forced dismount, can continue on foot |

---

## 🎮 GAME FLOW (HOW ALL SCREENS CONNECT)

```
TITLE SCREEN (story intro, high score, controls)
  ↓ [PRESS START]
CHAPTER INTRO (dialogue, Mama silhouette, story beat)
  ↓ [auto-fade]
LEVEL INTRO (2.5s overlay: city, name, objective text)
  ↓ [auto-start]
GAMEPLAY (2.5–5 minutes)
  ↓ [win or game over]
  
  IF GAME OVER:
    Show: hearts lost, distance reached, wallet, chapter
    Buttons: [RETRY THIS LEVEL] [MAIN MENU]
    
  IF LEVEL COMPLETE:
    Level Complete screen
    [NEXT] → BONUS STAGE (15s cash rain)
    [NEXT] → IF every 2 levels: GARAGE SCREEN
    [NEXT] → CHAPTER COMPLETE screen (story beat)
    [NEXT] → NEXT CHAPTER INTRO
    
VICTORY (Level 5.2 complete):
  Full ending cutscene → Final score → Share button
```

---

## 🔧 GARAGE SYSTEM

**When:** After Chapters 1, 2, and 4 complete.

| Upgrade | Cost | Max | Effect |
|---|---|---|---|
| Bigger Fuel Tank | Rs. 400 | 3 | +50 fuel capacity per level |
| Bike Shield | Rs. 600 | 2 | Survive 1 extra crash |
| Speed Boost | Rs. 500 | 3 | +10% top speed |
| M-Tag Pass | Rs. 800 | 1 | Skips toll plaza — FREE |
| Garam Jacket | Rs. 300 | 1 | +1 heart max in Chapter 4+ |
| Better Headlight | Rs. 250 | 1 | Wider light cone in load shedding |

---

## 🕹️ SPECIAL MODES (ALL CHAPTERS)

### Load Shedding Mode 🔦
- Active: Level 2.1 (triggers at 6,000m, repeats every 7,000m), all of Level 4.1
- Screen → 90% black
- Foot: torch cone (60° triangle, yellow)
- Bike: headlight (30° narrower, flickers when fuel < 20)
- Upgraded headlight (Garage): wider 50° cone

### Chalaan Escape Mode 🚔
- Active: Level 1.2 (at 6,000m, repeats every 8,000m)
- Warden speed: always 10% faster than player
- 45-second countdown
- Hit obstacle → 0.5s stun → warden catches → −Rs. 500 + timer resets
- Survive 45s → +Rs. 1,000 bonus

### Monsoon Flood Mode 🌧️
- Active: Level 5.1
- Water level rises 1px/sec from bottom
- Standing pools become hazards (land in one = −1 heart)
- Jump to elevated platforms to survive
- Lightning zones: avoid glowing column or −2 hearts instantly

### Bonus Stage 💸
- After every level: 15 seconds of cash rain
- Left/right only — no hazards
- Money collected → added to wallet
- Rs. 10, Rs. 100, Rs. 500 notes rain diagonally

---

## 👾 HAZARDS — ALL CHAPTERS

### Base Hazards (All Levels)

| Hazard | Size | Behavior | Foot Damage | Bike Damage |
|---|---|---|---|---|
| Stray Dog (4-state AI) | 40×28 | Idle → Alert → Chase → Tired | −1 Heart | Demote to Foot |
| Open Gutter | 48×16 | Pit in ground, jump over | −1 Heart | Demote to Foot |
| Qingqi Rickshaw | 56×44 | Right→left, variable speed | −1 Heart | Demote to Foot |
| Careless Biker | 40×36 | Same, faster | −1 Heart | Demote to Foot |
| Speed Camera | 24×36 | Overhead, bike mode only | No effect | −Rs. 500 |
| Toll Barrier | 200×40 | Blocks path, choice required | Stops | Stops |
| Construction Cone | 16×24 | Static | −1 Heart | Demote to Foot |

### New Hazards (Chapter 3+)

| Hazard | Chapter | Behavior |
|---|---|---|
| Traffic Signal (red) | 3 | Run red on foot = −Rs. 100; on bike = speed camera |
| Mountain Goat | 3–4 | Like dog but headbutts (2× impact) |
| Falling Rock | 3–5 | Drops from above, dodge left/right |
| Tourist Selfie Stick | 4 | Mid-height extend, duck or jump |
| Ice Patch | 4 | Slippery landing, slides 300 units |
| Murree Monkey | 4 | Steals Rs. 100 from wallet on contact |
| Flash Flood Puddle | 5 | Rising water, jump or −1 heart |
| Rolling Rock | 5 | Barrel-style rolling from right |
| Narrow Bridge | 5 | 1/3 width, fall = restart segment |
| Jeep on Road | 5 | 70% width, duck into ditch |
| Lightning Zone | 5 | Glowing column, −2 hearts if hit |

---

## 🎯 DOG AI (4-STATE MACHINE)

```
IDLE → ALERT (spots player) → CHASE (accelerates over time) → TIRED (slows, stops)
```

| Chapter | Chase Duration | Accel Rate | Detect Range |
|---|---|---|---|
| 1 | 3 sec | 0.8× | 196 px |
| 2 | 4 sec | 1.0× | 200 px |
| 3 | 5 sec | 1.2× | 204 px |
| 4 | 4 sec | 1.0× | 200 px |
| 5 | 6 sec | 1.5× | 210 px |

---

## 🔊 AUDIO — ALL 25 SOUNDS

| ID | Sound | When |
|---|---|---|
| A1 | Footstep loop | Foot mode running |
| A2 | Jump grunt | Any jump |
| A3 | Landing thud | Any landing |
| A4 | Bike kickstart | Mounting bike |
| A5 | Bike engine loop | Bike mode riding |
| A6 | Bike sputter (low fuel) | Fuel < 20 |
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
| A17 | Chai sip | Chai cup collect |
| A18 | Collect parchi | Parchi pickup |
| A19 | Monkey screech | Monkey steal |
| A20 | Thunder crack | Lightning zone hit |
| A21–A25 | BGM per location | Lahore / GT Road / Islamabad / Murree / Naran |

---

## 📐 PLAYER — FULL STATS

### FOOT MODE
| Stat | Value |
|---|---|
| Hitbox | 32×64 px |
| Walk Speed | 200 px/s |
| Acceleration | lerp 0.25 (snappy) |
| Deceleration | lerp 0.3 |
| Jump Force | −450 px/s |
| Gravity | 980 px/s² |
| Duck Hitbox | 32×32 px |
| Coyote Time | 0.12 seconds |
| Jump Buffer | 0.1 seconds |

### BIKE MODE
| Stat | Value |
|---|---|
| Hitbox | 64×54 px |
| Ride Speed | 400 px/s |
| Jump Force | −350 px/s |
| Gravity | 1,960 px/s² |
| Fuel Capacity | 150 units |
| Fuel Drain | 3 units/sec |
| Bike Life | ~50 seconds per tank |
| Manual Dismount | Press E → −1 heart + 2s stun |

---

## 🗂 FULL FILE STRUCTURE

```
LahoreToIslamabad/
│
├── index.html          ← Canvas + HUD + all screen overlays
├── game.js             ← Main loop, state manager, chapter system
├── player.js           ← Foot/bike modes, physics, animation
├── obstacles.js        ← All hazard types + dog AI + monkey + rocks
├── levels.js           ← ALL 10 levels across 5 chapters
├── story.js            ← NEW: Dialogue, chapter intros, cutscenes, Mama scenes
├── hud.js              ← Hearts, wallet, fuel bar, progress bar, chapter name
├── audio.js            ← Sound manager with .ogg → .mp3 fallback
├── input.js            ← Keyboard + touch input
├── camera.js           ← 4-layer parallax per chapter
├── particles.js        ← Rain, sparks, dust, snow (Chapter 4+), flood water
├── utils.js            ← AABB, random, lerp, clamp, localStorage
├── modes.js            ← Load shedding, chalaan, monsoon, bonus stage
├── assets.js           ← Asset loader (PNG → vector fallback)
├── economy.js          ← NEW: Wallet tracking, guarantee checks, toll safety
│
└── assets/
    ├── sprites/        ← Player, enemies, items (PNG)
    ├── bg/             ← Backgrounds per chapter (PNG)
    ├── audio/          ← .ogg / .mp3 files
    └── hud/            ← Icons (PNG)
```

> **New files:** `story.js` handles all cutscenes and dialogue. `economy.js` enforces the toll guarantee system.

---

## 🔨 BUILD ORDER

### Phase 1 — Core Engine (Shapes Only)

| Step | File | What |
|---|---|---|
| 1 | index.html | Canvas + HUD structure + all screen DIVs |
| 2 | game.js | Game loop, chapter state machine |
| 3 | input.js | Keyboard + touch |
| 4 | player.js | Foot + bike physics, all states |
| 5 | obstacles.js | Pool + base hazards + dog AI |
| 6 | levels.js | All 10 levels (10 entries with distances/speeds) |
| 7 | camera.js | 4-layer parallax (colored rects) |
| 8 | hud.js | Hearts, wallet, fuel, progress bar |
| 9 | audio.js | Sound manager |
| 10 | particles.js | Rain, sparks, snow |
| 11 | modes.js | Load shedding, chalaan, monsoon, bonus |
| 12 | utils.js | Helpers |
| 13 | assets.js | Loader with fallback |
| 14 | story.js | Chapter intro screens + Mama dialogue |
| 15 | economy.js | Wallet tracker + toll guarantee |

### Phase 2 — Story & Polish

| Step | What |
|---|---|
| 16 | Mama silhouette scene (Prologue cutscene) |
| 17 | Chapter intro overlays (all 5 chapters) |
| 18 | Level end story beats (all 10 levels) |
| 19 | Dialogue subtitle system (one line at a time) |
| 20 | SMS popup system (Mama texts) |
| 21 | Sheeda fallback event (toll safety net) |
| 22 | New Chapter 4 hazards (monkey, ice, selfie sticks) |
| 23 | New Chapter 5 hazards (rocks, flood, lightning, narrow bridge) |
| 24 | Bhutta collectible (heart restore) |
| 25 | Woolen Shawl collectible (max hearts +1) |
| 26 | Jeep Ride token mechanic |
| 27 | Delivery package mechanic (Level 1.2) |
| 28 | Game ending cutscene (Saif-ul-Malook) |
| 29 | Chapter select screen |
| 30 | Garage upgrades (Garam Jacket, Better Headlight) |

### Phase 3 — Real Art

| Step | What |
|---|---|
| 31 | Player sprites (P1–P8) |
| 32 | Hazard sprites (H1–H9 + new mountain hazards) |
| 33 | Background layers per chapter (5 cities × 4 layers) |
| 34 | HUD icons |
| 35 | Mama silhouette art |
| 36 | All audio files (25 sounds) |

### Phase 4 — Publish

| Step | What |
|---|---|
| 37 | Minify JS |
| 38 | Compress PNGs (TinyPNG) |
| 39 | GitHub repo + Pages |
| 40 | Mobile test |
| 41 | Capacitor → Android APK |
| 42 | Play Store upload |

---

## 🚀 DEPLOYMENT

```
GitHub Pages: https://nofilkhan1.github.io/Lahore-to-Islamabad/

Capacitor (Android):
  npm install @capacitor/cli @capacitor/core @capacitor/android
  npx cap init LahoreToIslamabad
  npx cap add android
  npx cap sync
  npx cap open android
```

**Git commit convention:**

| Prefix | Meaning |
|---|---|
| `[P1S5]` | Phase 1, Step 5 |
| `[STORY]` | Story/dialogue change |
| `[ECON]` | Economy/wallet change |
| `[FIX]` | Bug fix |
| `[ASSET]` | New art or sound |
| `[DEPLOY]` | Deploy config |

---

## ✅ WHAT'S FIXED vs WHAT'S NEW (v4 → v5)

| Area | Old (v4) | New (v5) |
|---|---|---|
| Story | 1-line joke intro, no Mama | Full Prologue cutscene, Mama silhouette, chapter-by-chapter dialogue |
| Levels | 6 levels, ends at Islamabad | 10 levels across 5 chapters, ends at Saif-ul-Malook Lake |
| Destinations | Lahore → Islamabad (done) | Lahore → GT Road → Islamabad → Murree → Naran (ongoing journey) |
| Toll plaza | Player often couldn't afford it | Guaranteed Rs. 1,200 by 12km + Sheeda fallback event |
| Game ending | "VICTORY" screen, flat | Full emotional cutscene, Mama phone call, lake reflection |
| Hazards | Same 8 hazards all game | 8 base + 10 new hazards across chapters |
| Heart restore | Never | Bhutta (corn) restores 1 heart (Chapter 4+) |
| Economy | Random cash | Per-level guaranteed minimum + smart deficit detection |
| Level length | Too short originally (fixed in v4) | 2.5–5 minutes each, growing with later chapters |
| Story file | None | `story.js` handles all dialogue and cutscenes |
| Economy file | None | `economy.js` handles wallet guarantees |

---

## 🔄 IMPLEMENTATION PROMPT CHANGES (Applied)

All 15 changes from `IMPLEMENTATION-PROMPT.md` have been implemented and committed.

| Change | Description | Files |
|---|---|---|
| 1 | Home Scene cutscene (Ali's house, Mama silhouette, TV, charpoy, typewriter dialogue) | `story.js`, `game.js` |
| 2 | All level distances standardized to 8,000m, scroll speeds increased ~40% | `levels.js` |
| 3 | Rebuilt ground system: 3-layer per-city pavement (A: road surface, B: edge shadow, C: void) | `camera.js` |
| 4 | Fixed background rendering: tiled layers with clipRect, no seams, per-city image config | `camera.js` |
| 5 | Player ground alignment fixed (y=395), drop shadows added | `player.js` |
| 6 | Obstacle ground alignment fixed (y=395) | `obstacles.js` |
| 7 | Near-layer fast-scrolling foreground decorations per city | `camera.js` |
| 8 | Removed duplicate wallet HUD (HTML removed, canvas-only in `renderProgress`) | `hud.js`, `index.html` |
| 9 | Depth gradient overlay (top 0.25 → bottom 0.6 alpha) | `game.js` |
| 10 | Better collectible rendering: pulse animation, styled shapes, ₨ symbol, glow effects | `obstacles.js` |
| 11 | Home scene wired into game start flow (btnStart → homeScene → chapterIntro) | `game.js`, `story.js` |
| 12 | Faster scroll speeds (40% increase across all levels) | `levels.js` |
| 13 | Tighter obstacle spacing (intervals reduced from 120→80, 60→40) | `obstacles.js` |
| 14 | New start screen design (Urdu title, story quote, styled buttons) | `index.html` |
| 15 | PWA manifest + Urdu Google Font (Noto Nastaliq Urdu) | `index.html`, `manifest.json` |

**Commits:** `c7ea32f` (asset integration), `9adf48d` (15 implementation prompt changes)

---

*MASTER-SPEC v5.0 — Lahore to Islamabad — Story Mode Overhaul*
*Ali's journey from one glass of doodh to the Queen of Mountains.*
