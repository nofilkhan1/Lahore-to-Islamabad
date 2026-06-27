// ============================================================
// story.js — Dialogue, chapter intros, cutscenes, Mama scenes
// ============================================================

const Story = {
    currentScene: null,
    dialogueIndex: 0,
    dialogueTimer: 0,
    dialogueCharDelay: 0.03,
    dialogueText: '',
    dialogueFullText: '',
    dialogueSpeaker: '',
    isTyping: false,
    sceneCallback: null,
    smsQueue: [],
    activeSms: null,
    smsTimer: 0,

    // === PROLOGUE SCENE (shown before game starts) ===
    prologue: [
        { speaker: 'Mama', text: 'Ali, TV band karo. Subah uthna hai.', type: 'mama' },
        { speaker: 'Ali', text: 'Ammi... Islamabad kaisa hota hai?', type: 'ali' },
        { speaker: 'Mama', text: 'Door hai. Aur teri jeb mein kuch nahi.', type: 'mama' },
        { speaker: 'Ali', text: 'Main kamaaunga. Khud jaunga.', type: 'ali' },
        { speaker: 'Mama', text: 'Theek hai. Kal subah sabse pehle doodh le aana.', type: 'mama' },
        { speaker: 'Mama', text: 'Safar apne aap shuru hota hai, chotay.', type: 'mama' },
    ],

    // === CHAPTER INTROS ===
    chapterIntros: [
        // Chapter 0 (Prologue) — handled separately
        // Chapter 1: Lahore
        {
            chapter: 1,
            title: 'CHAPTER 1: LAHORE',
            subtitle: '"Har safar ghar se shuru hota hai."',
            subtitleEn: '(Every journey begins at home.)',
            dialogue: [
                { speaker: 'Mama', text: 'Ali, doodh le aana — aur haath paint mat karna is baar.', type: 'mama' },
                { speaker: 'Mama', text: '500 Rupees in your pocket. Milk Shop: 3 km ahead.', type: 'mama' },
            ],
        },
        // Chapter 2: GT Road
        {
            chapter: 2,
            title: 'CHAPTER 2: GT ROAD',
            subtitle: '"Asli Imtehaan"',
            subtitleEn: '(The Real Test)',
            dialogue: [
                { speaker: 'Mama', text: 'Abbu ne kaha tha — GT Road pe hoshiyar rehna.', type: 'mama' },
                { speaker: 'Mama', text: 'Truckers nahi dekhte. Police nahi sunte.', type: 'mama' },
                { speaker: 'Mama', text: 'Aur kutta toh bilkul nahi manta.', type: 'mama' },
            ],
        },
        // Chapter 3: Islamabad
        {
            chapter: 3,
            title: 'CHAPTER 3: ISLAMABAD',
            subtitle: '"Khwaabon Ka Sheher"',
            subtitleEn: '(City of Dreams)',
            dialogue: [
                { speaker: 'Dhaba Wala', text: 'Pehli baar aaye ho? Acha. Murree gaye ho?', type: 'npc' },
                { speaker: 'Ali', text: 'Nahi...', type: 'ali' },
                { speaker: 'Dhaba Wala', text: 'Toh kuch nahi dekha, bhai.', type: 'npc' },
            ],
        },
        // Chapter 4: Murree
        {
            chapter: 4,
            title: 'CHAPTER 4: MURREE',
            subtitle: '"Pahaadon Ki Awaaz"',
            subtitleEn: '(Voice of the Mountains)',
            dialogue: [
                { speaker: 'Mama', text: 'Kapde garam pehno jab bahar jao.', type: 'mama' },
                { speaker: 'Ali', text: 'Ammi, I did not listen.', type: 'ali' },
                { speaker: 'Truck Wala', text: 'Murree Bazaar seedha jao. Raat se pehle pahuncho.', type: 'npc' },
                { speaker: 'Truck Wala', text: 'Nahi toh road band hoti hai barf mein.', type: 'npc' },
            ],
        },
        // Chapter 5: Naran
        {
            chapter: 5,
            title: 'CHAPTER 5: NARAN VALLEY',
            subtitle: '"Jahan Road Khatam Hoti Hai"',
            subtitleEn: '(Where the Road Ends)',
            dialogue: [
                { speaker: 'Mama', text: 'Ali beta, ab wapis aa jao. Kafi ho gaya na?', type: 'mama' },
                { speaker: 'Ali', text: 'Ammi... ek kaam baaki hai.', type: 'ali' },
            ],
        },
    ],

    // === LEVEL END STORY BEATS ===
    levelEndBeats: [
        // Level 1.1 — Doodh Run
        {
            level: [0, 0],
            lines: [
                'Ali reaches the Milk Shop.',
                '"Doodh le liya. Ammi khush."',
                '+Rs. 50 bonus (correct change returned)',
            ],
            bonus: 50,
        },
        // Level 1.2 — Liberty Market
        {
            level: [0, 1],
            lines: [
                '"Paise ho gaye. Ab bas ek cheez chahiye — petrol."',
            ],
        },
        // Level 2.1 — Truck Art Gauntlet
        {
            level: [1, 0],
            lines: [
                'Ali sees the toll plaza in the distance.',
                '"Yahan toh toll dena hoga..."',
            ],
        },
        // Level 2.2 — Toll Plaza
        {
            level: [1, 1],
            lines: [
                'Ali crosses toll gate. Open highway ahead.',
                '"Itna door... lekin itna kareeb bhi."',
            ],
        },
        // Level 3.1 — Signal Sprint
        {
            level: [2, 0],
            lines: [
                'Ali stops the bike. He\'s here.',
                '"Yeh toh Islamabad hai. Lekin woh pahaad...?"',
            ],
        },
        // Level 3.2 — Monal Climb
        {
            level: [2, 1],
            lines: [
                'Ali sits on a bench. Breathes.',
                '"Islamabad... dekh liya. Khoobsurat hai."',
                '"Par yeh pahaadiyan... Murree aur kitna dur hai?"',
            ],
            chapterComplete: true,
            nextChapter: 4,
        },
        // Level 4.1 — Night Ride
        {
            level: [3, 0],
            lines: [
                '"Yeh... Murree hai."',
            ],
        },
        // Level 4.2 — Bazaar
        {
            level: [3, 1],
            lines: [
                'Ali stands at Kashmir Point.',
                '"Murree... yeh toh sirf shuruwaat hai."',
                '"Aage kya hai?"',
            ],
            chapterComplete: true,
            nextChapter: 5,
        },
        // Level 5.1 — Kaghan Valley
        {
            level: [4, 0],
            lines: [
                '"No bike. No road signs. Just the river and the sky."',
                '"Subah ho gayi. Raho. Bas thodi si aur."',
            ],
        },
        // Level 5.2 — Saif-ul-Malook (THE FINALE)
        {
            level: [4, 1],
            lines: [
                '"Lahore se nikla tha ek larka."',
                '"Doodh lane ke liye."',
                '"Woh yahan pohonch gaya."',
                '',
                'Ali... ghar kab aa raha hai?',
                '',
                'SAFAR MUKAMMAL',
            ],
            isFinale: true,
        },
    ],

    // === IN-GAME STORY BEATS (triggered at specific distances) ===
    distanceBeats: [
        // Level 1.2 — Bike key discovery
        { level: [0, 1], distance: 5000, lines: ['He spots Dada\'s CD-70 parked outside a shop.', '"Koi nahi dekhega..."'] },
        // Level 2.1 — Load shedding
        { level: [1, 0], distance: 6000, lines: ['"Bijli nahi. Pakistan mein normal hai."'] },
        // Level 3.1 — Speed cameras
        { level: [2, 0], distance: 3000, lines: ['"Islamabad mein rules hote hain. Aur cameras bhi."'] },
        // Level 3.2 — Mountain climb start
        { level: [2, 1], distance: 500, lines: ['Margalla Hills filling the entire background'] },
        // Level 5.1 — Rain starts
        { level: [4, 0], distance: 5000, lines: ['It starts raining. Hard.'] },
        // Level 5.2 — Lake visible
        { level: [4, 1], distance: 15000, lines: ['The lake becomes visible — shimmering blue.', '"Barf. Real barf."'] },
    ],

    // === SMS POPUPS (Mama texts during gameplay) ===
    smsMessages: [
        { level: [2, 1], distance: 6000, from: 'Mama', text: 'Kahan ho? Ammi pareshan hai.' },
        { level: [3, 1], distance: 3000, from: 'Mama', text: 'Beta, kuch khaaya? Yahan barish ho rahi hai.' },
        { level: [4, 1], distance: 3000, from: 'Mama', text: 'Ali beta, ab wapis aa jao. Kafi ho gaya na?' },
    ],

    // === CHAPTER COMPLETE SCREENS ===
    chapterCompleteScreens: [
        {
            chapter: 1,
            title: 'CHAPTER 1 COMPLETE',
            lines: [
                'Ali has earned his travel money.',
                'The road is calling.',
                '',
                'Mama: "Tera wallet toh bhar gaya."',
                '"Par GT Road pe apna dimaag bhi rakh."',
            ],
        },
        {
            chapter: 2,
            title: 'CHAPTER 2 COMPLETE',
            lines: [
                'GT Road: Conquered.',
                '"Islamabad ab sirf ek raat dur hai."',
            ],
        },
        {
            chapter: 3,
            title: 'CHAPTER 3 COMPLETE',
            lines: [
                'Ali reaches Monal Restaurant.',
                '"Teri manzil badal gayi, Ali."',
                'The mountains are calling.',
            ],
        },
        {
            chapter: 4,
            title: 'CHAPTER 4 COMPLETE',
            lines: [
                'Ali stands at Kashmir Point.',
                'Below: clouds. Above: stars.',
                '',
                '"Murree... yeh toh sirf shuruwaat hai."',
            ],
        },
    ],

    // === HOME SCENE (pre-game cutscene) ===
    homeSceneCallback: null,
    homeSceneState: 'idle',
    homeSceneTimer: 0,
    homeScenePhase: 0,
    homeSceneDialogueIndex: 0,
    homeSceneTyping: false,
    homeSceneText: '',
    homeSceneFullText: '',
    homeSceneSpeaker: '',
    mamaX: 800,
    aliState: 'sleeping', // sleeping, sitting, standing, walking
    fadeAlpha: 0,
    fadeDirection: 0,

    homeSceneLines: [
        { speaker: 'Mama', text: 'ALI! Uth ja. Subah ho gayi!', type: 'mama' },
        { speaker: 'Ali', text: '...5 minute aur Ammi...', type: 'ali' },
        { speaker: 'Mama', text: 'DOODH LENA HAI. Uth ja ABHI. Rs. 500 rakh liye hain counter pe.', type: 'mama' },
        { speaker: 'Ali', text: 'Theek hai theek hai...', type: 'ali' },
        { speaker: 'Mama', text: 'Aur seedha aana. Islamabad waisabad. Ghar mein reh.', type: 'mama' },
        { speaker: 'Ali', text: '...Ammi, Islamabad mein log khush hote hain.', type: 'ali' },
        { speaker: 'Mama', text: 'Tujhe pata nahi kuch. JA. Doodh le.', type: 'mama' },
    ],

    startHomeScene(callback) {
        this.homeSceneCallback = callback;
        this.homeSceneState = 'animating';
        this.homeSceneTimer = 0;
        this.homeScenePhase = 0; // 0=mama walks in, 1=dialogue, 2=ali walks out, 3=fade+text
        this.homeSceneDialogueIndex = 0;
        this.homeSceneTyping = false;
        this.homeSceneText = '';
        this.homeSceneFullText = '';
        this.homeSceneSpeaker = '';
        this.mamaX = 800;
        this.aliState = 'sleeping';
        this.fadeAlpha = 0;
        this.fadeDirection = 0;
    },

    updateHomeScene(dt) {
        if (this.homeSceneState !== 'animating') return;
        const dtSec = dt / 60;
        this.homeSceneTimer += dtSec;

        if (this.homeScenePhase === 0) {
            // Mama walks in from right
            this.mamaX = Math.max(560, 800 - (this.homeSceneTimer / 2) * 240);
            if (this.homeSceneTimer >= 2) {
                this.homeScenePhase = 1;
                this.homeSceneTimer = 0;
                this.startHomeDialogue();
            }
        } else if (this.homeScenePhase === 1) {
            // Typing dialogue
            if (this.homeSceneTyping) {
                this.dialogueTimer += dtSec;
                if (this.dialogueTimer >= this.dialogueCharDelay) {
                    this.dialogueTimer = 0;
                    if (this.homeSceneText.length < this.homeSceneFullText.length) {
                        this.homeSceneText += this.homeSceneFullText[this.homeSceneText.length];
                    } else {
                        this.homeSceneTyping = false;
                    }
                }
            }
        } else if (this.homeScenePhase === 2) {
            // Ali walks to right
            if (this.homeSceneTimer > 2) {
                this.homeScenePhase = 3;
                this.homeSceneTimer = 0;
                this.fadeDirection = 1;
            }
        } else if (this.homeScenePhase === 3) {
            // Fade to black
            this.fadeAlpha = Math.min(1, this.fadeAlpha + dtSec * 1.5);
            if (this.fadeAlpha >= 1 && this.homeSceneTimer > 3.5) {
                this.homeSceneState = 'done';
                if (this.homeSceneCallback) this.homeSceneCallback();
            }
        }
    },

    startHomeDialogue() {
        const line = this.homeSceneLines[this.homeSceneDialogueIndex];
        if (!line) {
            // All dialogue done — Ali walks out
            this.homeScenePhase = 2;
            this.homeSceneTimer = 0;
            this.aliState = 'walking';
            return;
        }
        this.homeSceneSpeaker = line.speaker;
        this.homeSceneFullText = line.text;
        this.homeSceneText = '';
        this.homeSceneTyping = true;
        this.dialogueTimer = 0;
    },

    advanceHomeDialogue() {
        if (this.homeScenePhase !== 1) return;
        if (this.homeSceneTyping) {
            this.homeSceneText = this.homeSceneFullText;
            this.homeSceneTyping = false;
            return;
        }
        // Update ali state based on dialogue
        if (this.homeSceneDialogueIndex === 2) this.aliState = 'sitting';
        if (this.homeSceneDialogueIndex === 4) this.aliState = 'standing';
        this.homeSceneDialogueIndex++;
        if (this.homeSceneDialogueIndex >= this.homeSceneLines.length) {
            this.homeScenePhase = 2;
            this.homeSceneTimer = 0;
            this.aliState = 'walking';
        } else {
            this.startHomeDialogue();
        }
    },

    renderHomeScene(ctx) {
        const W = 800, H = 450;

        // Room interior background
        ctx.fillStyle = '#1A0A00';
        ctx.fillRect(0, 0, W, H);

        // Warm ambient glow from bulb area
        const glow = ctx.createRadialGradient(400, 60, 10, 400, 60, 200);
        glow.addColorStop(0, 'rgba(255, 200, 100, 0.15)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        // Flickering bulb
        const flickerAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.005);
        ctx.save();
        ctx.globalAlpha = flickerAlpha;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(400, 50, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
        ctx.beginPath();
        ctx.arc(400, 50, 25, 0, Math.PI * 2);
        ctx.fill();
        // Bulb wire
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(400, 0);
        ctx.lineTo(400, 42);
        ctx.stroke();
        ctx.restore();

        // Charpoy (wooden bed) on left
        const bedBob = Math.sin(Date.now() * 0.002) * 2;
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(80, 340, 200, 12); // Bed surface
        ctx.fillStyle = '#6B4F12';
        ctx.fillRect(80, 352, 8, 30); // Legs
        ctx.fillRect(272, 352, 8, 30);
        ctx.fillRect(140, 352, 8, 30);
        ctx.fillRect(210, 352, 8, 30);
        // Rope weaving pattern
        ctx.fillStyle = '#A08030';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(85 + i * 20, 342, 12, 2);
        }

        // Ali on charpoy
        if (this.aliState === 'sleeping') {
            // Lying down — white/cream body
            const aliY = 324 + bedBob;
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(120, aliY, 80, 18); // Body
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(115, aliY, 12, 14); // Head
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(113, aliY - 2, 16, 6); // Hair
        } else if (this.aliState === 'sitting') {
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(140, 310, 24, 30); // Body
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(143, 296, 18, 16); // Head
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(141, 294, 22, 6); // Hair
        } else if (this.aliState === 'standing') {
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(150, 290, 24, 48); // Body
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(153, 276, 18, 16); // Head
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(151, 274, 22, 6); // Hair
        } else if (this.aliState === 'walking') {
            const walkX = 150 + this.homeSceneTimer * 100;
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(Math.min(walkX, 820), 290, 24, 48);
            ctx.fillStyle = '#E8B89D';
            ctx.fillRect(Math.min(walkX, 820) + 3, 276, 18, 16);
            ctx.fillStyle = '#2C1810';
            ctx.fillRect(Math.min(walkX, 820) + 1, 274, 22, 6);
        }

        // TV in corner showing Islamabad
        const tvFlicker = Math.sin(Date.now() * 0.01) * 0.1 + 0.9;
        ctx.save();
        ctx.globalAlpha = tvFlicker;
        ctx.fillStyle = '#333';
        ctx.fillRect(650, 300, 80, 60);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(654, 304, 72, 52);
        ctx.fillStyle = '#fff';
        ctx.font = '6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ISLAMABAD', 690, 326);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(660, 332, 60, 3); // Road
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(690, 318, 12, 14); // Mosque dome
        ctx.textAlign = 'left';
        ctx.restore();

        // Mama silhouette
        if (this.homeScenePhase >= 0) {
            const mx = this.mamaX;
            const my = 260;
            ctx.fillStyle = '#000000';
            // Head
            ctx.beginPath();
            ctx.arc(mx, my, 18, 0, Math.PI * 2);
            ctx.fill();
            // Body
            ctx.fillRect(mx - 18, my + 18, 36, 80);
            // Dupatta
            ctx.beginPath();
            ctx.moveTo(mx - 22, my);
            ctx.lineTo(mx - 30, my + 60);
            ctx.lineTo(mx + 10, my + 20);
            ctx.lineTo(mx + 22, my);
            ctx.closePath();
            ctx.fill();
            // Hands on hips
            ctx.beginPath();
            ctx.arc(mx - 20, my + 40, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mx + 20, my + 40, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dialogue box during phase 1
        if (this.homeScenePhase === 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 340, 800, 110);
            // Border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 342, 796, 106);

            // Speaker name
            ctx.fillStyle = this.homeSceneSpeaker === 'Mama' ? '#FF6B6B' : '#87CEEB';
            ctx.font = 'bold 13px monospace';
            ctx.fillText(this.homeSceneSpeaker, 20, 362);

            // Dialogue text with word wrap
            ctx.fillStyle = '#fff';
            ctx.font = '13px monospace';
            const words = this.homeSceneText.split(' ');
            let line = '';
            let lineY = 380;
            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                if (ctx.measureText(testLine).width > 740 && line !== '') {
                    ctx.fillText(line, 20, lineY);
                    line = words[i] + ' ';
                    lineY += 18;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 20, lineY);

            // Blinking cursor
            if (!this.homeSceneTyping && Math.floor(Date.now() / 500) % 2 === 0) {
                const cursorX = 20 + ctx.measureText(line).width;
                ctx.fillText('\u258C', cursorX, lineY);
            }

            // Hint text
            ctx.fillStyle = '#666';
            ctx.font = '10px monospace';
            ctx.fillText('Click or Space to continue', 600, 440);
        }

        // Fade overlay
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = 'rgba(0,0,0,' + this.fadeAlpha + ')';
            ctx.fillRect(0, 0, W, H);
            if (this.fadeAlpha >= 1 && this.homeScenePhase === 3) {
                ctx.fillStyle = '#fff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Ali ne Rs. 500 uthaye. Aur socha — pehle doodh. Phir... Islamabad.', 400, 225);
                ctx.textAlign = 'left';
            }
        }
    },

    init() {
        this.currentScene = null;
        this.dialogueIndex = 0;
        this.smsQueue = [];
        this.activeSms = null;
        this.homeSceneState = 'idle';
    },

    // Start a scene (prologue, chapter intro, etc.)
    startScene(sceneLines, callback) {
        this.currentScene = sceneLines;
        this.dialogueIndex = 0;
        this.dialogueTimer = 0;
        this.dialogueText = '';
        this.dialogueFullText = '';
        this.dialogueSpeaker = '';
        this.isTyping = true;
        this.sceneCallback = callback;
        if (sceneLines.length > 0) {
            this.dialogueSpeaker = sceneLines[0].speaker || '';
            this.dialogueFullText = sceneLines[0].text || '';
        }
    },

    // Start chapter intro
    startChapterIntro(chapterIndex) {
        const intro = this.chapterIntros[chapterIndex];
        if (!intro) return;
        this.startScene(intro.dialogue, () => {
            // Start the first level of this chapter
            const chapterData = Game.chapterData[chapterIndex];
            if (chapterData && chapterData.levels.length > 0) {
                Game.startLevel(chapterData.levels[0], chapterIndex);
            }
        });
    },

    // Start level end story beat
    startLevelEndBeat(levelIndex) {
        const beat = this.levelEndBeats[levelIndex];
        if (!beat) return;
        const lines = beat.lines.map(l => ({ speaker: '', text: l, type: 'narrator' }));
        this.startScene(lines, () => {
            if (beat.bonus) {
                Player.wallet += beat.bonus;
                HUD.showMessage('+' + beat.bonus + ' bonus!', '#FFD700');
            }
            if (beat.isFinale) {
                Game.gameWon();
            } else if (beat.chapterComplete) {
                Game.showChapterComplete(beat.nextChapter);
            } else {
                Game.levelComplete();
            }
        });
        // Transition game to dialogue state so dialogue renders
        Game.scrollSpeed = 0;
        Game.targetScrollSpeed = 0;
        Game.state = 'dialogue';
    },

    // Update dialogue typewriter
    update(dt) {
        if (!this.currentScene) return;

        this.dialogueTimer += dt / 60;
        if (this.isTyping && this.dialogueTimer >= this.dialogueCharDelay) {
            this.dialogueTimer = 0;
            if (this.dialogueText.length < this.dialogueFullText.length) {
                this.dialogueText += this.dialogueFullText[this.dialogueText.length];
            } else {
                this.isTyping = false;
            }
        }

        // SMS popup update
        if (this.activeSms) {
            this.smsTimer -= dt / 60;
            if (this.smsTimer <= 0) {
                this.activeSms = null;
            }
        }
    },

    // Advance dialogue on click/tap
    advanceDialogue() {
        if (!this.currentScene) return;

        if (this.isTyping) {
            // Skip to full text
            this.dialogueText = this.dialogueFullText;
            this.isTyping = false;
            return;
        }

        this.dialogueIndex++;
        if (this.dialogueIndex >= this.currentScene.length) {
            // Scene complete
            const cb = this.sceneCallback;
            this.currentScene = null;
            this.sceneCallback = null;
            if (cb) cb();
            return;
        }

        // Next line
        this.dialogueTimer = 0;
        this.dialogueText = '';
        this.dialogueFullText = this.currentScene[this.dialogueIndex].text || '';
        this.dialogueSpeaker = this.currentScene[this.dialogueIndex].speaker || '';
        this.isTyping = true;
    },

    // Check for distance-based story beats
    checkDistanceBeats() {
        const chapter = Levels.currentChapter;
        const levelInChapter = Levels.currentLevelIndex;
        for (let i = 0; i < this.distanceBeats.length; i++) {
            const beat = this.distanceBeats[i];
            if (beat.level[0] === chapter && beat.level[1] === levelInChapter) {
                if (Game.distance >= beat.distance && !beat.triggered) {
                    beat.triggered = true;
                    // Show each line as a HUD message with staggered timing
                    beat.lines.forEach((line, idx) => {
                        if (line) {
                            setTimeout(() => HUD.showMessage(line, '#E8B89D'), idx * 3000);
                        }
                    });
                }
            }
        }
    },

    // Check for SMS popups
    checkSms() {
        const chapter = Levels.currentChapter;
        const levelInChapter = Levels.currentLevelIndex;
        for (let i = 0; i < this.smsMessages.length; i++) {
            const sms = this.smsMessages[i];
            if (sms.level[0] === chapter && sms.level[1] === levelInChapter) {
                if (Game.distance >= sms.distance && !sms.triggered) {
                    sms.triggered = true;
                    this.showSms(sms.from, sms.text);
                }
            }
        }
    },

    showSms(from, text) {
        this.activeSms = { from, text };
        this.smsTimer = 4;
        const el = document.getElementById('smsNotification');
        if (el) {
            el.querySelector('.sender').textContent = from;
            el.querySelector('.message').textContent = text;
            el.classList.add('show');
            setTimeout(() => { el.classList.remove('show'); }, 4000);
        }
    },

    // Render dialogue box on canvas
    renderDialogue(ctx) {
        if (!this.currentScene) return;

        const boxH = 90;
        const boxY = 450 - boxH - 10;

        // Dialogue background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(20, boxY, 760, boxH);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, boxY, 760, boxH);

        // Speaker name
        const line = this.currentScene[this.dialogueIndex];
        if (line && line.speaker) {
            ctx.fillStyle = line.type === 'mama' ? '#FF6B9D' : line.type === 'ali' ? '#4FC3F7' : '#FFD700';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(line.speaker, 35, boxY + 18);
        }

        // Dialogue text (with typewriter effect)
        ctx.fillStyle = '#fff';
        ctx.font = '13px monospace';
        const words = this.dialogueText.split(' ');
        let lineStr = '';
        let yPos = boxY + 38;
        for (let i = 0; i < words.length; i++) {
            const test = lineStr + words[i] + ' ';
            if (ctx.measureText(test).width > 700) {
                ctx.fillText(lineStr, 35, yPos);
                lineStr = words[i] + ' ';
                yPos += 18;
            } else {
                lineStr = test;
            }
        }
        ctx.fillText(lineStr, 35, yPos);

        // Continue indicator
        if (!this.isTyping) {
            const alpha = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFD700';
            ctx.font = '11px monospace';
            ctx.fillText('Click to continue...', 620, boxY + boxH - 10);
            ctx.globalAlpha = 1;
        }
    },

    // Render chapter intro screen
    renderChapterIntro(ctx, chapterIndex) {
        const intro = this.chapterIntros[chapterIndex];
        if (!intro) return;

        // Dark background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, 800, 450);

        // Mama silhouette (simple shadow figure)
        this.renderMamaSilhouette(ctx, 600, 100);

        // Chapter title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(intro.title, 400, 160);

        // Subtitle
        ctx.fillStyle = '#E8B89D';
        ctx.font = 'italic 14px monospace';
        ctx.fillText(intro.subtitle, 400, 195);

        ctx.fillStyle = '#999';
        ctx.font = '11px monospace';
        ctx.fillText(intro.subtitleEn, 400, 215);

        ctx.textAlign = 'left';
    },

    // Render Mama silhouette
    renderMamaSilhouette(ctx, x, y) {
        ctx.fillStyle = 'rgba(50, 30, 20, 0.8)';
        // Head
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
        // Body (dupatta shape)
        ctx.beginPath();
        ctx.moveTo(x - 20, y + 18);
        ctx.lineTo(x + 20, y + 18);
        ctx.lineTo(x + 25, y + 80);
        ctx.lineTo(x - 25, y + 80);
        ctx.closePath();
        ctx.fill();
        // Dupatta drape
        ctx.fillStyle = 'rgba(60, 35, 25, 0.6)';
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 20);
        ctx.lineTo(x - 30, y + 70);
        ctx.lineTo(x - 10, y + 65);
        ctx.closePath();
        ctx.fill();
        // Warm backlight glow
        ctx.fillStyle = 'rgba(255, 150, 50, 0.1)';
        ctx.beginPath();
        ctx.arc(x, y + 30, 60, 0, Math.PI * 2);
        ctx.fill();
    },

    // Render prologue scene
    renderPrologue(ctx) {
        // Night scene background
        ctx.fillStyle = '#0A0A1A';
        ctx.fillRect(0, 0, 800, 450);

        // Small house
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(250, 200, 300, 180);
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(230, 200);
        ctx.lineTo(570, 200);
        ctx.lineTo(400, 130);
        ctx.closePath();
        ctx.fill();

        // Window with warm light
        ctx.fillStyle = '#FFB74D';
        ctx.fillRect(340, 250, 50, 40);
        ctx.fillStyle = 'rgba(255, 183, 77, 0.15)';
        ctx.beginPath();
        ctx.arc(365, 270, 80, 0, Math.PI * 2);
        ctx.fill();

        // TV glow inside
        ctx.fillStyle = '#4FC3F7';
        ctx.fillRect(380, 260, 25, 20);

        // Flickering bulb
        const flicker = Math.random() > 0.1 ? 0.8 : 0.3;
        ctx.fillStyle = 'rgba(255, 255, 200, ' + flicker + ')';
        ctx.beginPath();
        ctx.arc(400, 190, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 200, ' + (flicker * 0.2) + ')';
        ctx.beginPath();
        ctx.arc(400, 190, 30, 0, Math.PI * 2);
        ctx.fill();

        // Ali silhouette (sitting on charpoy)
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(300, 290, 20, 30); // body
        ctx.beginPath();
        ctx.arc(310, 282, 10, 0, Math.PI * 2); // head
        ctx.fill();
        // Charpoy
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(280, 315, 80, 8);
        ctx.fillRect(285, 323, 5, 15);
        ctx.fillRect(355, 323, 5, 15);

        // Mama silhouette (in doorway)
        this.renderMamaSilhouette(ctx, 600, 220);

        // Dialogue
        this.renderDialogue(ctx);
    },

    // Render chapter complete screen
    renderChapterComplete(ctx, chapterIndex) {
        const screen = this.chapterCompleteScreens[chapterIndex];
        if (!screen) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, 800, 450);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(screen.title, 400, 150);

        ctx.fillStyle = '#E8B89D';
        ctx.font = '13px monospace';
        for (let i = 0; i < screen.lines.length; i++) {
            ctx.fillText(screen.lines[i], 400, 200 + i * 24);
        }

        ctx.textAlign = 'left';
    },

    // Render game ending (Saif-ul-Malook)
    renderGameEnding(ctx) {
        // Lake reflection scene
        ctx.fillStyle = '#0A1628';
        ctx.fillRect(0, 0, 800, 450);

        // Mountains
        ctx.fillStyle = '#1A237E';
        ctx.beginPath();
        ctx.moveTo(0, 250);
        ctx.lineTo(200, 100);
        ctx.lineTo(400, 200);
        ctx.lineTo(600, 80);
        ctx.lineTo(800, 220);
        ctx.lineTo(800, 250);
        ctx.closePath();
        ctx.fill();

        // Snow caps
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(180, 110);
        ctx.lineTo(200, 100);
        ctx.lineTo(220, 115);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(580, 90);
        ctx.lineTo(600, 80);
        ctx.lineTo(620, 95);
        ctx.closePath();
        ctx.fill();

        // Lake
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(0, 280, 800, 170);

        // Lake reflection (mountains mirrored)
        ctx.fillStyle = 'rgba(21, 101, 192, 0.5)';
        ctx.fillRect(0, 280, 800, 170);

        // Stars
        for (let i = 0; i < 30; i++) {
            const sx = (i * 137 + 50) % 800;
            const sy = (i * 89 + 20) % 150;
            const twinkle = Math.sin(Date.now() * 0.002 + i) * 0.3 + 0.7;
            ctx.fillStyle = 'rgba(255, 255, 255, ' + twinkle + ')';
            ctx.fillRect(sx, sy, 2, 2);
        }

        // Ali silhouette at edge
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(385, 250, 15, 35);
        ctx.beginPath();
        ctx.arc(392, 242, 8, 0, Math.PI * 2);
        ctx.fill();
    },
};
