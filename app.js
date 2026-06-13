/* ZenAura — AI Student Mental Wellness Companion Core Logic */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // HTML Sanitization helper for XSS prevention (Security)
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // Core State Variables
    let currentMoodSelection = '';
    let currentBreathingInterval = null;
    let currentBreathingTimeout = null;
    let isBreathingActive = false;
    let activeAudioSynth = null;
    
    // Pomodoro Timer State Variables
    let pomodoroInterval = null;
    let pomodoroMinutes = 25;
    let pomodoroSeconds = 0;
    let isPomodoroActive = false;
    let currentPomodoroPhase = 'focus'; // 'focus', 'short-break', 'long-break'
    
    // SOS State Variables
    let sosBreathingInterval = null;
    let sosBreathingTimeout = null;
    let sosMessageInterval = null;
    let isSosPanelActive = false;
    
    // Daily Student Affirmations
    const affirmations = [
        "My worth is not defined by an exam score. I am smart, capable, and doing my best.",
        "Stress is a visitor, not my owner. I take one step at a time, one day at a time.",
        "Deep breathing is my superpower. I can pause, recalibrate, and start again.",
        "I have prepared well, and my brain knows more than my anxiety tells me.",
        "It is okay to rest. Resting is part of preparation, not procrastination.",
        "Mistakes on mock tests are just compasses pointing to areas I can grow in.",
        "I am studying for my future self, and I believe in my ability to learn.",
        "I choose progress over perfection today.",
        "Competitive tests are just steps in my journey, not the final destination of my life."
    ];

    // Student Motivational Quotes
    const quotes = [
        `"Do what you can, with what you have, where you are." — Theodore Roosevelt`,
        `"It always seems impossible until it's done." — Nelson Mandela`,
        `"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill`,
        `"The secret of getting ahead is getting started." — Mark Twain`,
        `"Believe you can and you're halfway there." — Theodore Roosevelt`,
        `"Focus is a matter of deciding what things you're not going to do." — John Carmack`
    ];

    // ==========================================================================
    // DOM ELEMENTS SELECTORS
    // ==========================================================================
    
    // Tab Elements
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewPanels = document.querySelectorAll('.view-panel');
    const greetingText = document.getElementById('greeting-text');
    const dailyQuote = document.getElementById('daily-quote');
    const streakCountHeader = document.getElementById('streak-count');
    
    // Dashboard Panel Elements
    const dashMoodVal = document.getElementById('dash-mood-val');
    const dashStressVal = document.getElementById('dash-stress-val');
    const dashMindfulVal = document.getElementById('dash-mindful-val');
    const dashTriggersList = document.getElementById('dash-triggers-list');
    const dashCopingContent = document.getElementById('dash-coping-content');
    
    // Journal Panel Elements
    const journalForm = document.getElementById('journal-form');
    const journalTextarea = document.getElementById('journal-text');
    const moodButtons = document.querySelectorAll('#mood-selector-buttons .mood-btn');
    const resultsEmpty = document.getElementById('results-empty');
    const resultsLoading = document.getElementById('results-loading');
    const resultsContent = document.getElementById('results-content');
    
    const resMoodTag = document.getElementById('res-mood-tag');
    const resStressTag = document.getElementById('res-stress-tag');
    const resAnalysis = document.getElementById('res-analysis');
    const resTriggers = document.getElementById('res-triggers');
    const resCoping = document.getElementById('res-coping');
    const btnGoToBreathing = document.getElementById('btn-go-to-breathing');
    const resMindfulName = document.getElementById('res-mindful-name');
    
    // Chat Panel Elements
    const chatForm = document.getElementById('chat-form');
    const chatInputText = document.getElementById('chat-input-text');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatSuggestions = document.querySelectorAll('.suggest-chip');
    const btnClearChat = document.getElementById('btn-clear-chat');
    
    // Calm Room Panel Elements
    const breathingPatternSelect = document.getElementById('breathing-pattern-select');
    const breathingBubble = document.getElementById('breathing-bubble');
    const breathingStatusText = document.getElementById('breathing-status-text');
    const breathingTimerCount = document.getElementById('breathing-timer-count');
    const btnBreathingControl = document.getElementById('btn-breathing-control');
    const breathingCircleTrigger = document.getElementById('breathing-circle-trigger');
    
    const soundItems = document.querySelectorAll('.sound-item');
    const soundViz = document.getElementById('sound-viz');
    const affirmationDisplay = document.getElementById('affirmation-display');
    const btnNextAffirmation = document.getElementById('btn-next-affirmation');
    
    // Settings Modal Elements
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const settingsModal = document.getElementById('settings-modal');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnCancelSettings = document.getElementById('btn-cancel-settings');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const apiKeyInput = document.getElementById('api-key-input');
    const btnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
    const keyStatusText = document.getElementById('key-status-text');
    const keyStatusIcon = document.querySelector('#key-status i, #key-status svg');
    const keyStatusDiv = document.getElementById('key-status');
    
    // Theme Toggler Elements
    const btnToggleTheme = document.getElementById('btn-toggle-theme');

    // SOS Panel Elements
    const btnSosPanic = document.getElementById('btn-sos-panic');
    const sosPanel = document.getElementById('sos-panel');
    const btnCloseSos = document.getElementById('btn-close-sos');
    const sosBreathingBubble = document.getElementById('sos-breathing-bubble');
    const sosBreathingStatus = document.getElementById('sos-breathing-status');
    const sosBreathingTimer = document.getElementById('sos-breathing-timer');
    const sosCalmMessage = document.getElementById('sos-calm-message');

    // Pomodoro & Game Elements
    const pomodoroTimerTxt = document.getElementById('pomodoro-timer-txt');
    const pomodoroStatusBadge = document.getElementById('pomodoro-status-badge');
    const btnPomodoroToggle = document.getElementById('btn-pomodoro-toggle');
    const btnPomodoroReset = document.getElementById('btn-pomodoro-reset');
    const btnPomodoroText = document.getElementById('btn-pomodoro-text');
    const pomodoroTimerRing = document.querySelector('.pomodoro-timer-ring');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const btnOpenStressGame = document.getElementById('btn-open-stress-game');
    const gameModal = document.getElementById('game-modal');
    const btnCloseGame = document.getElementById('btn-close-game');
    const btnResetGame = document.getElementById('btn-reset-game');
    const gamePoppedCount = document.getElementById('game-popped-count');
    const gameSandbox = document.getElementById('game-sandbox');
    const gameCelebration = document.getElementById('game-celebration');
    const btnPlayAgainGame = document.getElementById('btn-play-again-game');

    // ==========================================================================
    // INITIALIZATION & CONFIG
    // ==========================================================================
    
    function init() {
        // Set dynamic quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        dailyQuote.textContent = randomQuote;
        
        // Load greeting time
        const hour = new Date().getHours();
        if (hour < 12) greetingText.textContent = "Good morning, Warrior";
        else if (hour < 17) greetingText.textContent = "Good afternoon, Warrior";
        else greetingText.textContent = "Good evening, Warrior";
        
        // Init LocalStorage keys if not present
        if (!localStorage.getItem('zenaura_journals')) {
            localStorage.setItem('zenaura_journals', JSON.stringify([]));
        }
        if (!localStorage.getItem('zenaura_chats')) {
            localStorage.setItem('zenaura_chats', JSON.stringify([]));
        }
        if (!localStorage.getItem('zenaura_mindfulness_count')) {
            localStorage.setItem('zenaura_mindfulness_count', '0');
        }
        if (!localStorage.getItem('zenaura_streak')) {
            localStorage.setItem('zenaura_streak', '1');
        }
        if (!localStorage.getItem('zenaura_last_active_date')) {
            localStorage.setItem('zenaura_last_active_date', new Date().toLocaleDateString());
        }

        // Init theme (Light mode default)
        const storedTheme = localStorage.getItem('zenaura_theme') || 'light';
        if (storedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            btnToggleTheme.querySelector('i, svg').setAttribute('data-lucide', 'sun');
        } else {
            document.body.classList.remove('dark-theme');
            btnToggleTheme.querySelector('i, svg').setAttribute('data-lucide', 'moon');
        }

        // Calculate and load stats
        updateStreakAndStats();
        updateDashboardView();
        
        // Initialize self-care checklist
        initSelfCareChecklist();
        
        // Initialize Pomodoro timer
        initPomodoro();

        // Initialize Stress-Buster game
        initStressGame();
        
        // Check API key status
        updateApiKeyStatusUI();

        // Initialize Zen Stress-Popper
        initZenPopper();

        // Initialize Zen Doodle Therapy
        initDoodleTherapy();

        // Initialize Voice Journaling
        initVoiceJournaling();

        // Initialize Theme Presets
        initThemePresets();
    }

    // Update streak based on usage dates
    function updateStreakAndStats() {
        const lastDateStr = localStorage.getItem('zenaura_last_active_date');
        const streak = parseInt(localStorage.getItem('zenaura_streak') || '1');
        const todayStr = new Date().toLocaleDateString();
        
        if (lastDateStr !== todayStr) {
            const lastDate = new Date(lastDateStr);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Streak continues!
                const newStreak = streak + 1;
                localStorage.setItem('zenaura_streak', newStreak.toString());
            } else if (diffDays > 1) {
                // Reset streak
                localStorage.setItem('zenaura_streak', '1');
            }
            localStorage.setItem('zenaura_last_active_date', todayStr);
        }
        
        const currentStreak = localStorage.getItem('zenaura_streak');
        streakCountHeader.textContent = `${currentStreak} Day Streak`;
        
        // Update mindfulness counter card
        const mindfulCount = localStorage.getItem('zenaura_mindfulness_count') || '0';
        dashMindfulVal.textContent = `${mindfulCount} Session${mindfulCount !== '1' ? 's' : ''}`;
    }

    // Render Dashboard UI elements using stored values
    function updateDashboardView() {
        const journals = JSON.parse(localStorage.getItem('zenaura_journals') || '[]');
        
        if (journals.length === 0) {
            dashMoodVal.textContent = "Not Logged";
            dashStressVal.textContent = "--";
            
            const pCoping = document.createElement('p');
            pCoping.className = 'empty-state';
            pCoping.textContent = "Write a journal entry. Aura will analyze it and display your personal stress-coping strategies here.";
            dashCopingContent.replaceChildren(pCoping);
            
            const pTrig = document.createElement('p');
            pTrig.className = 'empty-state';
            pTrig.textContent = "No triggers detected yet.";
            dashTriggersList.replaceChildren(pTrig);
            
            drawMoodChart([]);
            return;
        }
        
        // Latest journal
        const latest = journals[journals.length - 1];
        
        // Set Mood value and emoji
        let emoji = '😌';
        if (latest.mood === 'Happy') emoji = '😊';
        if (latest.mood === 'Anxious') emoji = '😰';
        if (latest.mood === 'Sad') emoji = '😢';
        if (latest.mood === 'Tired') emoji = '🥱';
        if (latest.mood === 'Stressed') emoji = '🤯';
        
        dashMoodVal.textContent = `${emoji} ${latest.mood}`;
        
        // Set Stress index
        dashStressVal.textContent = `${latest.stressIndex}/100`;
        if (latest.stressIndex > 75) {
            dashStressVal.style.color = 'var(--accent-rose)';
        } else if (latest.stressIndex > 45) {
            dashStressVal.style.color = 'var(--accent-purple)';
        } else {
            dashStressVal.style.color = 'var(--accent-teal)';
        }
        
        // Populate Triggers List
        if (latest.triggers && latest.triggers.length > 0) {
            dashTriggersList.replaceChildren();
            latest.triggers.forEach(trig => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'trigger-item';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'trigger-name';
                nameSpan.textContent = trig;
                
                const badgeSpan = document.createElement('span');
                badgeSpan.className = 'trigger-badge';
                badgeSpan.textContent = 'Trigger';
                
                itemDiv.appendChild(nameSpan);
                itemDiv.appendChild(badgeSpan);
                dashTriggersList.appendChild(itemDiv);
            });
        } else {
            const p = document.createElement('p');
            p.className = 'empty-state';
            p.textContent = "No major stress triggers detected in latest entry.";
            dashTriggersList.replaceChildren(p);
        }
        
        // Populate Coping Plan
        if (latest.copingStrategy) {
            dashCopingContent.replaceChildren();
            if (Array.isArray(latest.copingStrategy)) {
                const ul = document.createElement('ul');
                latest.copingStrategy.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                dashCopingContent.appendChild(ul);
            } else if (latest.copingStrategy.includes('\n')) {
                const ul = document.createElement('ul');
                latest.copingStrategy.split('\n')
                    .filter(line => line.trim().length > 0)
                    .forEach(line => {
                        const li = document.createElement('li');
                        li.textContent = line.replace(/^[-\*\d\.\s]+/, '');
                        ul.appendChild(li);
                    });
                dashCopingContent.appendChild(ul);
            } else {
                const p = document.createElement('p');
                p.textContent = latest.copingStrategy;
                dashCopingContent.appendChild(p);
            }
        } else {
            const p = document.createElement('p');
            p.className = 'empty-state';
            p.textContent = "No custom coping strategy logged yet.";
            dashCopingContent.replaceChildren(p);
        }
        
        // Render Line Chart
        drawMoodChart(journals.slice(-7)); // Last 7 entries
    }

    // Update the API Key status indicators
    function updateApiKeyStatusUI() {
        const isConfigured = window.ZenAuraAI.isApiKeyConfigured();
        if (isConfigured) {
            keyStatusDiv.className = 'key-status-indicator success';
            keyStatusText.textContent = 'Gemini API Key saved and active.';
            keyStatusIcon.setAttribute('data-lucide', 'check-circle-2');
            apiKeyInput.value = window.ZenAuraAI.getApiKey();
        } else {
            keyStatusDiv.className = 'key-status-indicator info';
            keyStatusText.textContent = 'No Gemini API key stored yet. Demo prompts will run locally.';
            keyStatusIcon.setAttribute('data-lucide', 'alert-circle');
            apiKeyInput.value = '';
        }
        lucide.createIcons();
    }

    // ==========================================================================
    // INTERACTIVE SVG MOOD & STRESS CHART
    // ==========================================================================
    
    function drawMoodChart(dataPoints) {
        const svg = document.getElementById('mood-chart');
        svg.replaceChildren(); // Clear existing
        
        if (dataPoints.length === 0) {
            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", "50%");
            txt.setAttribute("y", "50%");
            txt.setAttribute("dominant-baseline", "middle");
            txt.setAttribute("text-anchor", "middle");
            txt.setAttribute("class", "chart-axis-text");
            txt.textContent = "Write your journals to plot wellness trends";
            svg.appendChild(txt);
            return;
        }

        // Define SVG gradient
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        
        const grad1 = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad1.setAttribute("id", "chart-gradient");
        grad1.setAttribute("x1", "0"); grad1.setAttribute("y1", "0"); grad1.setAttribute("x2", "0"); grad1.setAttribute("y2", "1");
        
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", "var(--accent-purple)"); stop1.setAttribute("stop-opacity", "1");
        
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", "var(--accent-blue)"); stop2.setAttribute("stop-opacity", "0.8");
        
        grad1.appendChild(stop1);
        grad1.appendChild(stop2);
        
        const grad2 = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad2.setAttribute("id", "area-gradient");
        grad2.setAttribute("x1", "0"); grad2.setAttribute("y1", "0"); grad2.setAttribute("x2", "0"); grad2.setAttribute("y2", "1");
        
        const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop3.setAttribute("offset", "0%"); stop3.setAttribute("stop-color", "var(--accent-purple)"); stop3.setAttribute("stop-opacity", "0.25");
        
        const stop4 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop4.setAttribute("offset", "100%"); stop4.setAttribute("stop-color", "var(--accent-blue)"); stop4.setAttribute("stop-opacity", "0.0");
        
        grad2.appendChild(stop3);
        grad2.appendChild(stop4);
        
        defs.appendChild(grad1);
        defs.appendChild(grad2);
        svg.appendChild(defs);

        const width = 600;
        const height = 220;
        const paddingLeft = 50;
        const paddingRight = 30;
        const paddingTop = 30;
        const paddingBottom = 40;
        
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        
        // Draw Horizontal Gridlines (4 lines)
        const gridValues = [0, 25, 50, 75, 100];
        gridValues.forEach(val => {
            const y = paddingTop + chartHeight - (val / 100 * chartHeight);
            
            // Grid Line
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", paddingLeft);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width - paddingRight);
            line.setAttribute("y2", y);
            line.setAttribute("class", "chart-grid-line");
            svg.appendChild(line);
            
            // Text Label
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", paddingLeft - 12);
            text.setAttribute("y", y + 4);
            text.setAttribute("text-anchor", "end");
            text.setAttribute("class", "chart-axis-text");
            text.textContent = val;
            svg.appendChild(text);
        });

        // Plot Points coordinate calculator
        const numPoints = Math.max(7, dataPoints.length);
        const xStep = chartWidth / (numPoints > 1 ? numPoints - 1 : 1);
        
        let pathD = '';
        let areaD = '';
        const points = [];
        
        dataPoints.forEach((dp, index) => {
            const x = paddingLeft + (index * xStep);
            const y = paddingTop + chartHeight - (dp.stressIndex / 100 * chartHeight);
            points.push({ x, y, index, dp });
            
            if (index === 0) {
                pathD = `M ${x} ${y}`;
                areaD = `M ${x} ${paddingTop + chartHeight} L ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
                areaD += ` L ${x} ${y}`;
            }
        });
        
        if (dataPoints.length > 1) {
            // Draw Area Fill (under the curve)
            areaD += ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
            const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            areaPath.setAttribute("d", areaD);
            areaPath.setAttribute("fill", "url(#area-gradient)");
            svg.appendChild(areaPath);

            // Draw Stress Line
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathD);
            path.setAttribute("class", "chart-line");
            svg.appendChild(path);
        }
        
        // Draw Points & X Labels
        points.forEach(pt => {
            // Point Circle
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", pt.x);
            circle.setAttribute("cy", pt.y);
            circle.setAttribute("r", "5");
            circle.setAttribute("class", "chart-point");
            
            // Tooltip or interactive styling could go here
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `Date: ${pt.dp.date}\nStress Index: ${pt.dp.stressIndex}\nMood: ${pt.dp.mood}`;
            circle.appendChild(title);
            svg.appendChild(circle);
            
            // X-axis Text Label
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", pt.x);
            text.setAttribute("y", paddingTop + chartHeight + 20);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("class", "chart-axis-text");
            // Show only month/day e.g. "06/13"
            const dateParts = pt.dp.date.split('/');
            const displayDate = dateParts.length >= 2 ? `${dateParts[0]}/${dateParts[1]}` : pt.dp.date;
            text.textContent = displayDate;
            svg.appendChild(text);
        });
    }

    // ==========================================================================
    // SIDEBAR & NAVIGATION SYSTEM
    // ==========================================================================
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Update nav buttons active states
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Switch panels
            viewPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `view-${targetTab}`) {
                    panel.classList.add('active');
                }
            });
            
            // Render specific tab load operations
            if (targetTab === 'dashboard') {
                updateDashboardView();
            }
            if (targetTab === 'chat') {
                scrollChatToBottom();
            }

            // Stop any active doodle melody when switching tabs
            if (targetTab !== 'doodle') {
                try {
                    AudioSynth.stopComposerMelody();
                    const pmBtn = document.getElementById('btn-play-melody');
                    if (pmBtn) {
                        pmBtn.classList.remove('active');
                        const pmIcon = pmBtn.querySelector('i, svg');
                        if (pmIcon) {
                            pmIcon.setAttribute('data-lucide', 'play');
                            lucide.createIcons();
                        }
                    }
                    const mViz = document.getElementById('melody-viz');
                    if (mViz) mViz.classList.add('hidden');
                } catch (e) {}
            }
        });
    });

    // Handle suggestion bubble to jump to breathing exercise
    btnGoToBreathing.addEventListener('click', () => {
        const mindfulExerciseName = resMindfulName.textContent;
        // Select matching option
        if (mindfulExerciseName.includes('4-7-8')) {
            breathingPatternSelect.value = '4-7-8';
        } else if (mindfulExerciseName.includes('4-4') || mindfulExerciseName.includes('Box')) {
            breathingPatternSelect.value = '4-4';
        } else {
            breathingPatternSelect.value = '5-5';
        }
        
        // Switch tab to mindfulness
        document.getElementById('btn-mindfulness').click();
    });

    // Toggle Light/Dark Theme
    btnToggleTheme.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        if (isDark) {
            localStorage.setItem('zenaura_theme', 'dark');
            btnToggleTheme.querySelector('i, svg').setAttribute('data-lucide', 'sun');
        } else {
            localStorage.setItem('zenaura_theme', 'light');
            btnToggleTheme.querySelector('i, svg').setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    });

    // ==========================================================================
    // SETTINGS MODAL & GEMINI API KEY LOGIC
    // ==========================================================================
    
    btnOpenSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        apiKeyInput.value = window.ZenAuraAI.getApiKey();
    });
    
    function closeModal() {
        settingsModal.classList.add('hidden');
    }
    
    btnCloseSettings.addEventListener('click', closeModal);
    btnCancelSettings.addEventListener('click', closeModal);
    
    btnSaveSettings.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        window.ZenAuraAI.saveApiKey(key);
        updateApiKeyStatusUI();
        closeModal();
    });
    
    btnToggleKeyVisibility.addEventListener('click', () => {
        const currentType = apiKeyInput.getAttribute('type');
        if (currentType === 'password') {
            apiKeyInput.setAttribute('type', 'text');
            btnToggleKeyVisibility.querySelector('i, svg').setAttribute('data-lucide', 'eye-off');
        } else {
            apiKeyInput.setAttribute('type', 'password');
            btnToggleKeyVisibility.querySelector('i, svg').setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    });

    // Close modal if user clicks outside of modal container
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeModal();
        }
    });

    // ==========================================================================
    // DAILY JOURNAL & EMOTIONAL ANALYSIS
    // ==========================================================================
    
    // Mood selection toggling
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentMoodSelection = btn.getAttribute('data-mood');
        });
    });

    // Submit Journal Form
    journalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = journalTextarea.value.trim();
        if (!text) return;
        
        if (!currentMoodSelection) {
            alert("Please choose your current mood icon before submitting.");
            return;
        }

        // Toggle Loading views
        resultsEmpty.classList.add('hidden');
        resultsContent.classList.add('hidden');
        resultsLoading.classList.remove('hidden');

        try {
            // Run analysis using Gemini wrapper
            const analysis = await window.ZenAuraAI.analyzeJournalWithAI(text, currentMoodSelection);
            
            // Save journal in database
            const journals = JSON.parse(localStorage.getItem('zenaura_journals') || '[]');
            const entry = {
                date: new Date().toLocaleDateString(),
                mood: analysis.mood || currentMoodSelection,
                stressIndex: parseInt(analysis.stressIndex) || 50,
                text: text,
                triggers: analysis.triggers || [],
                copingStrategy: analysis.copingStrategy || ''
            };
            
            journals.push(entry);
            localStorage.setItem('zenaura_journals', JSON.stringify(journals));
            
            // Recalculate streak and stats
            updateStreakAndStats();

            // Populate analysis result layout card
            resMoodTag.textContent = entry.mood;
            resStressTag.textContent = `Stress Index: ${entry.stressIndex}/100`;
            resAnalysis.textContent = analysis.analysis;
            
            // Triggers formatting
            if (entry.triggers && entry.triggers.length > 0) {
                resTriggers.replaceChildren();
                entry.triggers.forEach(trig => {
                    const span = document.createElement('span');
                    span.className = 'trigger-chip';
                    span.textContent = trig;
                    resTriggers.appendChild(span);
                });
            } else {
                const span = document.createElement('span');
                span.className = 'trigger-chip';
                span.textContent = 'None detected';
                resTriggers.replaceChildren(span);
            }
            
            // Coping strategy text formatting
            if (Array.isArray(analysis.copingStrategy)) {
                resCoping.replaceChildren();
                const ul = document.createElement('ul');
                analysis.copingStrategy.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                resCoping.appendChild(ul);
            } else {
                resCoping.textContent = analysis.copingStrategy;
            }
            
            // Recommended breathing exercise text
            if (analysis.suggestedExercise === '4-7-8') {
                resMindfulName.textContent = '4-7-8 Relaxing Breath (Recommended)';
            } else if (analysis.suggestedExercise === '4-4') {
                resMindfulName.textContent = '4-4-4-4 Box Breathing (Recommended)';
            } else {
                resMindfulName.textContent = '5-5 Resonance Breathing (Recommended)';
            }

            // Reveal Results content
            resultsLoading.classList.add('hidden');
            resultsContent.classList.remove('hidden');
            
            // Reset journal text
            journalTextarea.value = '';
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            currentMoodSelection = '';
            
        } catch (error) {
            console.error(error);
            alert("Oops! Something went wrong analyzing your journal. Please check your API Key settings or try again.");
            resultsLoading.classList.add('hidden');
            resultsEmpty.classList.remove('hidden');
        }
    });

    // ==========================================================================
    // EMPATHETIC AI COMPANION (CHAT BOT)
    // ==========================================================================
    
    // Save/Load message streams
    function loadChatHistory() {
        const chats = JSON.parse(localStorage.getItem('zenaura_chats') || '[]');
        if (chats.length === 0) return;
        
        chatMessagesContainer.replaceChildren();
        chats.forEach(msg => {
            appendMessageUI(msg.role, msg.text, msg.time);
        });
        scrollChatToBottom();
    }
    
    function saveMessageToStorage(role, text) {
        const chats = JSON.parse(localStorage.getItem('zenaura_chats') || '[]');
        chats.push({
            role: role,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('zenaura_chats', JSON.stringify(chats));
    }

    function scrollChatToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function appendMessageUI(role, text, timeStr) {
        const time = timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isCompanion = role === 'companion';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isCompanion ? 'companion' : 'user'}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'msg-bubble';
        bubbleDiv.textContent = text;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'msg-time';
        timeSpan.textContent = time;
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeSpan);
        
        chatMessagesContainer.appendChild(messageDiv);
        scrollChatToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message companion typing-indicator-msg';
        typingDiv.id = 'zenaura-typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }
        
        chatMessagesContainer.appendChild(typingDiv);
        scrollChatToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('zenaura-typing-indicator');
        if (indicator) indicator.remove();
    }

    // Submit user message
    async function handleUserSendMessage(userMessageText) {
        if (!userMessageText.trim()) return;
        
        // 1. Add user message to UI and Storage
        appendMessageUI('user', userMessageText);
        saveMessageToStorage('user', userMessageText);
        
        chatInputText.value = '';
        
        // 2. Show typing indicator
        showTypingIndicator();
        
        // 3. Construct history payload for Gemini multi-turn format
        const chats = JSON.parse(localStorage.getItem('zenaura_chats') || '[]');
        // Gemini expects: { role: 'user'|'model', parts: [{ text: string }] }
        // Take last 10 messages for token efficiency and memory retention
        const geminiHistory = chats.slice(-10).map(msg => {
            return {
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            };
        });

        try {
            // Get response
            const botResponse = await window.ZenAuraAI.generateChatResponse(geminiHistory);
            
            // 4. Remove typing loader and present response
            removeTypingIndicator();
            appendMessageUI('companion', botResponse);
            saveMessageToStorage('companion', botResponse);
        } catch (error) {
            removeTypingIndicator();
            const errorMsg = "I'm having a small connection issue. But please remember: you are not alone on this journey. Take a deep breath. Let's try chatting again in a second.";
            appendMessageUI('companion', errorMsg);
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInputText.value.trim();
        handleUserSendMessage(text);
    });

    // Handle quicksuggestion chip clicks
    chatSuggestions.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-text');
            handleUserSendMessage(prompt);
        });
    });

    // Clear Chat logs
    btnClearChat.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your chat history with Aura?")) {
            localStorage.setItem('zenaura_chats', JSON.stringify([]));
            chatMessagesContainer.replaceChildren();
            appendMessageUI('companion', "Chat history cleared. I'm here to support you. What is on your mind?", "Just now");
        }
    });

    // ==========================================================================
    // MINDFULNESS & COMPASSIONATE SOUNDS SYNTHESIZER
    // ==========================================================================
    
    // Custom Web Audio API Ambient Synthesizer
    // This allows offline sounds generation without loading huge external MP3 streams
    const AudioSynth = (() => {
        let audioCtx = null;
        let sources = [];
        let gainNodes = [];
        let oscillators = [];
        
        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }
        
        // Helper to generate brown noise (perfect for rain/waves)
        function createBrownNoiseNode() {
            const bufferSize = 4 * audioCtx.sampleRate;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // Compensate volume loss
            }
            
            const noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            return noiseSource;
        }

        // 1. Synthesize Ocean Waves (low pass filtered brown noise modulated with slow LFO)
        function playOceanWaves() {
            initAudio();
            
            const noise = createBrownNoiseNode();
            
            // Lowpass Filter
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, audioCtx.currentTime);
            
            // Volume control node
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            
            // LFO to simulate waves swelling (10s period)
            const lfo = audioCtx.createOscillator();
            lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime); // 12 seconds per wave cycle
            
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.setValueAtTime(0.09, audioCtx.currentTime); // volume sweeps between 0.06 and 0.24
            
            // Modulate filter frequency slowly too
            const lfoFilterGain = audioCtx.createGain();
            lfoFilterGain.gain.setValueAtTime(80, audioCtx.currentTime);
            
            // Connect LFO modulation paths
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            
            lfo.connect(lfoFilterGain);
            lfoFilterGain.connect(filter.frequency);
            
            // Main connection routing
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise.start(0);
            lfo.start(0);
            
            sources.push(noise);
            oscillators.push(lfo);
            gainNodes.push(gain);
        }

        // 2. Synthesize Deep Rain (highpassed brown noise + randomized volume crackles)
        function playRain() {
            initAudio();
            
            const noise = createBrownNoiseNode();
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(550, audioCtx.currentTime);
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
            
            // Add a highpass filter path to simulate high pitch crackle of raindrops
            const noise2 = createBrownNoiseNode();
            const filter2 = audioCtx.createBiquadFilter();
            filter2.type = 'bandpass';
            filter2.frequency.setValueAtTime(1400, audioCtx.currentTime);
            filter2.Q.setValueAtTime(2, audioCtx.currentTime);
            
            const gain2 = audioCtx.createGain();
            gain2.gain.setValueAtTime(0.03, audioCtx.currentTime);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise2.connect(filter2);
            filter2.connect(gain2);
            gain2.connect(audioCtx.destination);
            
            noise.start(0);
            noise2.start(0);
            
            sources.push(noise, noise2);
            gainNodes.push(gain, gain2);
        }

        // 3. Synthesize Forest Breeze
        function playForest() {
            initAudio();
            
            // Wind synthesis: bandpass filtered white noise with shifting frequency
            const bufferSize = 2 * audioCtx.sampleRate;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noiseSource = audioCtx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, audioCtx.currentTime);
            filter.Q.setValueAtTime(1.5, audioCtx.currentTime);
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            
            // Modulate forest wind speed
            const lfo = audioCtx.createOscillator();
            lfo.type = 'triangle';
            lfo.frequency.setValueAtTime(0.06, audioCtx.currentTime); // slow shift
            
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.setValueAtTime(300, audioCtx.currentTime); // sweep range
            
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            
            noiseSource.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noiseSource.start(0);
            lfo.start(0);
            
            sources.push(noiseSource);
            oscillators.push(lfo);
            gainNodes.push(gain);
        }

        // 4. Synthesize Binaural Focus & Lofi hum (Binaural Beats: 140Hz left ear, 145Hz right ear = 5Hz theta waves for deep focus)
        function playFocusBeats() {
            initAudio();
            
            const oscL = audioCtx.createOscillator();
            const oscR = audioCtx.createOscillator();
            
            oscL.frequency.setValueAtTime(140, audioCtx.currentTime); // Left frequency
            oscR.frequency.setValueAtTime(145, audioCtx.currentTime); // Right frequency
            
            // Create stereo panners for binaural beats separation
            const pannerL = audioCtx.createStereoPanner();
            const pannerR = audioCtx.createStereoPanner();
            pannerL.pan.setValueAtTime(-1, audioCtx.currentTime);
            pannerR.pan.setValueAtTime(1, audioCtx.currentTime);
            
            const gainL = audioCtx.createGain();
            const gainR = audioCtx.createGain();
            gainL.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gainR.gain.setValueAtTime(0.12, audioCtx.currentTime);
            
            // Soft lowpass filter to make it warmer/less intrusive
            const warmFilter = audioCtx.createBiquadFilter();
            warmFilter.type = 'lowpass';
            warmFilter.frequency.setValueAtTime(180, audioCtx.currentTime);
            
            // Connecting nodes
            oscL.connect(pannerL);
            pannerL.connect(gainL);
            gainL.connect(warmFilter);
            
            oscR.connect(pannerR);
            pannerR.connect(gainR);
            gainR.connect(warmFilter);
            
            warmFilter.connect(audioCtx.destination);
            
            oscL.start(0);
            oscR.start(0);
            
            sources.push(oscL, oscR);
            gainNodes.push(gainL, gainR);
        }

        let melodyInterval = null;

        // Stop all sound synth
        function stopAll() {
            if (melodyInterval) {
                clearInterval(melodyInterval);
                melodyInterval = null;
            }
            sources.forEach(src => {
                try { src.stop(); } catch(e) {}
            });
            oscillators.forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
            sources = [];
            oscillators = [];
            gainNodes = [];
            
            if (audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }
        }

        function playComposerMelody(frequencies, tempo, synthType) {
            initAudio();
            if (melodyInterval) {
                clearInterval(melodyInterval);
            }
            
            let noteIndex = 0;
            const delay = tempo || 800;
            const wave = synthType || 'triangle';
            
            function triggerNextChime() {
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                const freq = frequencies[noteIndex];
                noteIndex = (noteIndex + 1) % frequencies.length;
                
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                osc.type = wave;
                osc.frequency.setValueAtTime(freq, now);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.08, now + 0.03);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, now);
                
                osc.connect(gainNode);
                gainNode.connect(filter);
                filter.connect(audioCtx.destination);
                
                osc.start(now);
                osc.stop(now + 2.8);
                
                sources.push(osc);
                gainNodes.push(gainNode);
            }
            
            triggerNextChime();
            melodyInterval = setInterval(triggerNextChime, delay);
        }
        
        function stopComposerMelody() {
            if (melodyInterval) {
                clearInterval(melodyInterval);
                melodyInterval = null;
            }
        }

        // 5. Synthesize Notification Wind Chime
        function playChimeAlarm() {
            initAudio();
            const now = audioCtx.currentTime;
            const freqs = [880, 1100, 1320, 1760];
            freqs.forEach((f, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);
                
                const delay = idx * 0.05;
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.5);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(now + delay);
                osc.stop(now + delay + 3);
            });
        }

        // 6. Synthesize Bubble Pop click
        function playBubblePop() {
            initAudio();
            const now = audioCtx.currentTime;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
            
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + 0.08);
        }

        return {
            playOceanWaves,
            playRain,
            playForest,
            playFocusBeats,
            playChimeAlarm,
            playBubblePop,
            playComposerMelody,
            stopComposerMelody,
            stopAll
        };
    })();

    // Sound items clicks
    soundItems.forEach(item => {
        const toggleBtn = item.querySelector('.sound-toggle');
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent card actions
            const type = item.getAttribute('data-sound');
            const isActive = item.classList.contains('active');
            
            // Deactivate other sounds
            soundItems.forEach(si => si.classList.remove('active'));
            soundItems.forEach(si => si.querySelector('.sound-toggle i, .sound-toggle svg').setAttribute('data-lucide', 'play'));
            AudioSynth.stopAll();
            soundViz.classList.add('hidden');
            
            if (!isActive) {
                // Turn on this sound
                item.classList.add('active');
                toggleBtn.querySelector('i, svg').setAttribute('data-lucide', 'square');
                soundViz.classList.remove('sound-visualizer', 'hidden');
                soundViz.classList.add('sound-visualizer');
                
                // Play specific synth audio
                if (type === 'rain') AudioSynth.playRain();
                if (type === 'waves') AudioSynth.playOceanWaves();
                if (type === 'forest') AudioSynth.playForest();
                if (type === 'lofi') AudioSynth.playFocusBeats();
            }
            
            lucide.createIcons();
        });
    });

    // ==========================================================================
    // GUIDED BREATHING SESSION LOGIC
    // ==========================================================================
    
    function startBreathingSession() {
        isBreathingActive = true;
        breathingCircleTrigger.classList.add('breathing-active');
        btnBreathingControl.classList.add('active');
        btnBreathingControl.querySelector('span').textContent = 'Stop Session';
        btnBreathingControl.querySelector('i, svg').setAttribute('data-lucide', 'square');
        lucide.createIcons();
        
        const pattern = breathingPatternSelect.value;
        let secondsCounter = 0;
        let currentPhase = 'inhale'; // inhale, hold, exhale, hold2
        
        // Timing variables
        let inhaleTime = 4;
        let holdTime = 7;
        let exhaleTime = 8;
        let holdTime2 = 0; // standard 4-7-8
        
        if (pattern === '4-4') {
            inhaleTime = 4;
            holdTime = 4;
            exhaleTime = 4;
            holdTime2 = 4; // Box breathing
        } else if (pattern === '5-5') {
            inhaleTime = 5;
            holdTime = 0;
            exhaleTime = 5;
            holdTime2 = 0; // Resonance breathing
        }

        // Apply scale transition timing dynamically based on breathing patterns
        breathingBubble.style.transition = `transform ${inhaleTime}s ease-in-out`;

        function updateBreathingCycle() {
            if (!isBreathingActive) return;
            
            if (currentPhase === 'inhale') {
                breathingStatusText.textContent = 'Inhale';
                breathingBubble.style.transition = `transform ${inhaleTime}s ease-in-out`;
                breathingBubble.style.transform = 'scale(1.5)';
                secondsCounter = inhaleTime;
                
                currentBreathingTimeout = setTimeout(() => {
                    if (holdTime > 0) {
                        currentPhase = 'hold';
                    } else {
                        currentPhase = 'exhale';
                    }
                    updateBreathingCycle();
                }, inhaleTime * 1000);
                
            } else if (currentPhase === 'hold') {
                breathingStatusText.textContent = 'Hold';
                secondsCounter = holdTime;
                
                currentBreathingTimeout = setTimeout(() => {
                    currentPhase = 'exhale';
                    updateBreathingCycle();
                }, holdTime * 1000);
                
            } else if (currentPhase === 'exhale') {
                breathingStatusText.textContent = 'Exhale';
                breathingBubble.style.transition = `transform ${exhaleTime}s ease-in-out`;
                breathingBubble.style.transform = 'scale(0.85)';
                secondsCounter = exhaleTime;
                
                currentBreathingTimeout = setTimeout(() => {
                    if (holdTime2 > 0) {
                        currentPhase = 'hold2';
                    } else {
                        currentPhase = 'inhale';
                    }
                    updateBreathingCycle();
                }, exhaleTime * 1000);
                
            } else if (currentPhase === 'hold2') {
                breathingStatusText.textContent = 'Hold';
                secondsCounter = holdTime2;
                
                currentBreathingTimeout = setTimeout(() => {
                    currentPhase = 'inhale';
                    updateBreathingCycle();
                }, holdTime2 * 1000);
            }
        }
        
        // Start Cycle
        updateBreathingCycle();
        
        // Seconds Tick Interval for Text rendering
        breathingTimerCount.textContent = `${secondsCounter}s`;
        currentBreathingInterval = setInterval(() => {
            if (secondsCounter > 1) {
                secondsCounter--;
                breathingTimerCount.textContent = `${secondsCounter}s`;
            } else {
                breathingTimerCount.textContent = '0s';
            }
        }, 1000);
    }
    
    function stopBreathingSession() {
        isBreathingActive = false;
        breathingCircleTrigger.classList.remove('breathing-active');
        clearInterval(currentBreathingInterval);
        clearTimeout(currentBreathingTimeout);
        
        btnBreathingControl.classList.remove('active');
        btnBreathingControl.querySelector('span').textContent = 'Start Guided Session';
        btnBreathingControl.querySelector('i, svg').setAttribute('data-lucide', 'play');
        lucide.createIcons();
        
        breathingStatusText.textContent = 'Ready';
        breathingTimerCount.textContent = '--';
        breathingBubble.style.transition = 'transform 0.4s ease';
        breathingBubble.style.transform = 'scale(1.0)';
        
        // Log mindfulness completion session in storage
        const count = parseInt(localStorage.getItem('zenaura_mindfulness_count') || '0');
        const newCount = count + 1;
        localStorage.setItem('zenaura_mindfulness_count', newCount.toString());
        updateStreakAndStats();
        completeMindfulnessChecklistTask();
    }
    
    btnBreathingControl.addEventListener('click', () => {
        if (isBreathingActive) {
            stopBreathingSession();
        } else {
            startBreathingSession();
        }
    });

    // Toggle breathing session on circle click
    breathingCircleTrigger.addEventListener('click', () => {
        btnBreathingControl.click();
    });

    // Affirmation card clicks
    btnNextAffirmation.addEventListener('click', () => {
        let currentAff = affirmationDisplay.textContent.trim().replace(/^"|"$/g, '');
        let available = affirmations.filter(a => a !== currentAff);
        let randomAff = available[Math.floor(Math.random() * available.length)];
        
        // Soft fading animation
        affirmationDisplay.style.opacity = '0';
        setTimeout(() => {
            affirmationDisplay.textContent = `"${randomAff}"`;
            affirmationDisplay.style.opacity = '1';
        }, 200);
    });
    
    // Add CSS transitions styles directly for opacity
    affirmationDisplay.style.transition = 'opacity 0.2s ease';
    sosCalmMessage.style.transition = 'opacity 0.3s ease';

    // ==========================================================================
    // SOS PANIC PROTOCOL (Instant Calm)
    // ==========================================================================
    
    // Calm messages to cycle through during SOS panic attack
    const sosCalmMessages = [
        "Take a slow breath. You are safe and in control.",
        "An exam is just a single step in your long journey. You are bigger than any test.",
        "Your worth is not defined by any paper. Breathe with the pulsing circle.",
        "This stress is just a temporary wave. Let it pass. You can do this.",
        "Relax your shoulders, relax your jaw, and let go. You are doing great."
    ];

    function startSosProtocol() {
        isSosPanelActive = true;
        sosPanel.classList.remove('hidden');
        
        // Stop any regular breathing session
        if (isBreathingActive) {
            stopBreathingSession();
        }
        
        // Stop any sound playing, and start simulated Ocean Waves
        const wavesItem = document.querySelector('.sound-item[data-sound="waves"]');
        if (wavesItem) {
            const toggle = wavesItem.querySelector('.sound-toggle');
            if (toggle && !wavesItem.classList.contains('active')) {
                toggle.click();
            }
        }
        
        // Setup slow resonance breathing: 5s inhale, 5s exhale
        let seconds = 5;
        let phase = 'inhale';
        
        sosBreathingBubble.style.transition = 'transform 5s ease-in-out';
        
        function runSosBreathing() {
            if (!isSosPanelActive) return;
            
            if (phase === 'inhale') {
                sosBreathingStatus.textContent = 'Inhale';
                sosBreathingBubble.style.transform = 'scale(1.4)';
                seconds = 5;
                
                sosBreathingTimeout = setTimeout(() => {
                    phase = 'exhale';
                    runSosBreathing();
                }, 5000);
            } else {
                sosBreathingStatus.textContent = 'Exhale';
                sosBreathingBubble.style.transform = 'scale(0.85)';
                seconds = 5;
                
                sosBreathingTimeout = setTimeout(() => {
                    phase = 'inhale';
                    runSosBreathing();
                }, 5000);
            }
        }
        
        // Start cycle
        runSosBreathing();
        
        // Seconds Tick
        sosBreathingTimer.textContent = `${seconds}s`;
        sosBreathingInterval = setInterval(() => {
            if (seconds > 1) {
                seconds--;
                sosBreathingTimer.textContent = `${seconds}s`;
            } else {
                sosBreathingTimer.textContent = '0s';
            }
        }, 1000);
        
        // Cycle Messages
        let msgIndex = 0;
        sosCalmMessage.textContent = sosCalmMessages[0];
        sosMessageInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % sosCalmMessages.length;
            sosCalmMessage.style.opacity = '0';
            setTimeout(() => {
                sosCalmMessage.textContent = sosCalmMessages[msgIndex];
                sosCalmMessage.style.opacity = '1';
            }, 300);
        }, 8000);
    }
    
    function stopSosProtocol() {
        isSosPanelActive = false;
        sosPanel.classList.add('hidden');
        
        // Clean up intervals/timers
        clearInterval(sosBreathingInterval);
        clearTimeout(sosBreathingTimeout);
        clearInterval(sosMessageInterval);
        
        // Stop audio
        const activeSound = document.querySelector('.sound-item.active');
        if (activeSound) {
            const toggle = activeSound.querySelector('.sound-toggle');
            if (toggle) toggle.click();
        }
        
        // Reset bubble
        sosBreathingBubble.style.transition = 'transform 0.4s ease';
        sosBreathingBubble.style.transform = 'scale(1.0)';
        sosBreathingStatus.textContent = 'Ready';
        sosBreathingTimer.textContent = '--';
    }

    // Bind SOS click listeners
    btnSosPanic.addEventListener('click', startSosProtocol);
    btnCloseSos.addEventListener('click', stopSosProtocol);

    // ==========================================================================
    // ZEN POMODORO TIMER LOGIC
    // ==========================================================================
    function initPomodoro() {
        if (!presetBtns || presetBtns.length === 0) return;
        
        // Bind Preset buttons click
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const mins = parseInt(btn.getAttribute('data-minutes'));
                const phase = btn.getAttribute('data-phase');
                
                currentPomodoroPhase = phase;
                pomodoroMinutes = mins;
                pomodoroSeconds = 0;
                
                // Pause existing timer
                pausePomodoro();
                updatePomodoroDisplay();
                updatePomodoroTheme();
            });
        });
        
        // Toggle Pomodoro timer
        if (btnPomodoroToggle) {
            btnPomodoroToggle.addEventListener('click', () => {
                if (isPomodoroActive) {
                    pausePomodoro();
                } else {
                    startPomodoro();
                }
            });
        }
        
        // Reset Pomodoro timer
        if (btnPomodoroReset) {
            btnPomodoroReset.addEventListener('click', () => {
                resetPomodoro();
            });
        }
        
        updatePomodoroDisplay();
        updatePomodoroTheme();
    }
    
    function updatePomodoroDisplay() {
        const mm = String(pomodoroMinutes).padStart(2, '0');
        const ss = String(pomodoroSeconds).padStart(2, '0');
        if (pomodoroTimerTxt) pomodoroTimerTxt.textContent = `${mm}:${ss}`;
    }
    
    function updatePomodoroTheme() {
        if (!pomodoroStatusBadge) return;
        
        if (currentPomodoroPhase === 'focus') {
            pomodoroStatusBadge.textContent = 'Focus Session';
            if (pomodoroTimerRing) {
                pomodoroTimerRing.classList.remove('break-mode');
                if (isPomodoroActive) {
                    pomodoroTimerRing.classList.add('running');
                } else {
                    pomodoroTimerRing.classList.remove('running');
                }
            }
        } else {
            pomodoroStatusBadge.textContent = currentPomodoroPhase === 'short-break' ? 'Short Break' : 'Long Break';
            if (pomodoroTimerRing) {
                pomodoroTimerRing.classList.add('break-mode');
                if (isPomodoroActive) {
                    pomodoroTimerRing.classList.add('running');
                } else {
                    pomodoroTimerRing.classList.remove('running');
                }
            }
        }
    }
    
    function startPomodoro() {
        if (isPomodoroActive) return;
        isPomodoroActive = true;
        
        // Update toggle button UI
        if (btnPomodoroText) btnPomodoroText.textContent = 'Pause';
        if (btnPomodoroToggle) {
            btnPomodoroToggle.classList.add('active');
            const toggleIcon = btnPomodoroToggle.querySelector('i, svg');
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'pause');
        }
        lucide.createIcons();
        
        if (pomodoroTimerRing) pomodoroTimerRing.classList.add('running');
        updatePomodoroTheme();
        
        pomodoroInterval = setInterval(() => {
            if (pomodoroSeconds === 0) {
                if (pomodoroMinutes === 0) {
                    // Pomodoro Finished!
                    completePomodoroSession();
                    return;
                }
                pomodoroMinutes--;
                pomodoroSeconds = 59;
            } else {
                pomodoroSeconds--;
            }
            updatePomodoroDisplay();
        }, 1000);
    }
    
    function pausePomodoro() {
        isPomodoroActive = false;
        clearInterval(pomodoroInterval);
        
        // Update toggle button UI
        if (btnPomodoroText) btnPomodoroText.textContent = 'Start Focus';
        if (btnPomodoroToggle) {
            btnPomodoroToggle.classList.remove('active');
            const toggleIcon = btnPomodoroToggle.querySelector('i, svg');
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'play');
        }
        lucide.createIcons();
        
        if (pomodoroTimerRing) pomodoroTimerRing.classList.remove('running');
    }
    
    function resetPomodoro() {
        pausePomodoro();
        
        // Find active preset
        const activePreset = document.querySelector('.preset-btn.active');
        if (activePreset) {
            pomodoroMinutes = parseInt(activePreset.getAttribute('data-minutes'));
        } else {
            pomodoroMinutes = 25;
        }
        pomodoroSeconds = 0;
        
        updatePomodoroDisplay();
        updatePomodoroTheme();
    }
    
    function completePomodoroSession() {
        pausePomodoro();
        
        // Play audio synthesized chime alert
        AudioSynth.playChimeAlarm();
        
        if (currentPomodoroPhase === 'focus') {
            // Focus phase ends
            alert("Great focus session! Your brain needs a reset. Let's start a 1-minute box breathing session.");
            
            // Switch preset to Chill 5m
            presetBtns.forEach(btn => {
                if (btn.getAttribute('data-phase') === 'short-break') {
                    btn.click();
                }
            });
            
            // Shift View to Mindfulness tab if it's not active
            const mindfulTab = document.getElementById('btn-mindfulness');
            if (mindfulTab) mindfulTab.click();
            
            // Automatically select 4-4-4-4 Box Breathing and start guide!
            if (breathingPatternSelect) {
                breathingPatternSelect.value = '4-4';
                // Trigger change event to set bubble speed
                breathingPatternSelect.dispatchEvent(new Event('change'));
            }
            
            // Start guided breathing session!
            setTimeout(() => {
                if (!isBreathingActive) {
                    startBreathingSession();
                }
            }, 1000);
            
        } else {
            // Break phase ends
            alert("Break is complete! Time to focus. You got this, Warrior!");
            
            // Switch preset to Study 25m
            presetBtns.forEach(btn => {
                if (btn.getAttribute('data-phase') === 'focus') {
                    btn.click();
                }
            });
        }
    }

    // ==========================================================================
    // ZEN BUBBLE POP STRESS-BUSTER GAME LOGIC
    // ==========================================================================
    const stressorsList = [
        "Mock Scores", "Backlogs", "Physics Formulas", "Syllabus Load",
        "Peer Pressure", "Parental Hopes", "Exam Anxiety", "Time Management",
        "Rank Pressures", "Negative Marks", "Sleep Loss", "Self-Doubt",
        "Chemistry Equil", "Biology Names", "Math Complexities", "Study Burnout"
    ];
    
    const bubbleGradients = [
        "radial-gradient(circle, rgba(159, 117, 255, 0.85) 0%, rgba(124, 58, 237, 0.45) 100%)", // Purple
        "radial-gradient(circle, rgba(20, 184, 166, 0.85) 0%, rgba(13, 148, 136, 0.45) 100%)",  // Teal
        "radial-gradient(circle, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.45) 100%)",  // Blue
        "radial-gradient(circle, rgba(244, 63, 94, 0.85) 0%, rgba(225, 29, 72, 0.45) 100%)"    // Rose
    ];

    const gameMaxBubbles = 8;
    let bubblesPoppedCount = 0;
    
    function initStressGame() {
        if (btnOpenStressGame) {
            btnOpenStressGame.addEventListener('click', () => {
                if (gameModal) gameModal.classList.remove('hidden');
                startStressGame();
            });
        }
        
        if (btnCloseGame) {
            btnCloseGame.addEventListener('click', () => {
                if (gameModal) gameModal.classList.add('hidden');
                stopStressGame();
            });
        }
        
        if (btnResetGame) {
            btnResetGame.addEventListener('click', () => {
                startStressGame();
            });
        }
        
        if (btnPlayAgainGame) {
            btnPlayAgainGame.addEventListener('click', () => {
                startStressGame();
            });
        }
    }
    
    function startStressGame() {
        bubblesPoppedCount = 0;
        if (gameCelebration) gameCelebration.classList.add('hidden');
        if (gamePoppedCount) gamePoppedCount.textContent = `0/${gameMaxBubbles} Popped`;
        
        // Remove existing bubbles
        if (gameSandbox) {
            const activeBubbles = gameSandbox.querySelectorAll('.zen-bubble');
            activeBubbles.forEach(b => b.remove());
        }
        
        // Spawn initial set
        for (let i = 0; i < gameMaxBubbles; i++) {
            spawnBubble(i);
        }
    }
    
    function spawnBubble(index) {
        if (!gameSandbox) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'zen-bubble';
        
        // Pick random stressor
        const text = stressorsList[Math.floor(Math.random() * stressorsList.length)];
        bubble.textContent = text;
        
        // Set dimensions (75px to 105px)
        const size = Math.floor(Math.random() * 30) + 75;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Set left position percentage (5% to 80% to keep it on screen)
        const leftPercent = Math.floor(Math.random() * 75) + 5;
        bubble.style.left = `${leftPercent}%`;
        
        // Random animation duration (6s to 11s)
        const duration = Math.floor(Math.random() * 5) + 6;
        bubble.style.animationDuration = `${duration}s`;
        
        // Random animation delay
        const delay = Math.random() * 4;
        bubble.style.animationDelay = `${delay}s`;
        
        // Pick random color scheme
        const gradientIndex = Math.floor(Math.random() * bubbleGradients.length);
        bubble.style.background = bubbleGradients[gradientIndex];
        
        // Store visual border color for particles
        let pColor = '#14b8a6'; // teal
        if (gradientIndex === 0) pColor = '#a78bfa'; // purple
        if (gradientIndex === 2) pColor = '#60a5fa'; // blue
        if (gradientIndex === 3) pColor = '#fb7185'; // rose
        
        // Click Pop Handler
        bubble.addEventListener('click', (e) => {
            // Prevent multiple rapid clicks on same bubble
            if (bubble.classList.contains('popping')) return;
            bubble.classList.add('popping');
            
            // Satisfying synthesized Pop sound!
            AudioSynth.playBubblePop();
            
            // Get relative coordinates in sandbox
            const rect = gameSandbox.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Create explosion particle effect
            createParticleExplosion(clickX, clickY, pColor);
            
            // Remove bubble
            bubble.style.transform = 'scale(0)';
            bubble.style.opacity = '0';
            setTimeout(() => bubble.remove(), 100);
            
            bubblesPoppedCount++;
            if (gamePoppedCount) {
                gamePoppedCount.textContent = `${bubblesPoppedCount}/${gameMaxBubbles} Popped`;
            }
            
            // Check win condition
            if (bubblesPoppedCount === gameMaxBubbles) {
                setTimeout(() => {
                    if (gameCelebration) gameCelebration.classList.remove('hidden');
                }, 400);
            }
        });
        
        // Listen to animation end to recycle the bubble if it floated out without being clicked
        bubble.addEventListener('animationiteration', () => {
            // Reset position and text to keep sandbox dynamic
            const nextText = stressorsList[Math.floor(Math.random() * stressorsList.length)];
            bubble.textContent = nextText;
            const nextLeft = Math.floor(Math.random() * 75) + 5;
            bubble.style.left = `${nextLeft}%`;
        });
        
        gameSandbox.appendChild(bubble);
    }
    
    function createParticleExplosion(x, y, color) {
        if (!gameSandbox) return;
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'bubble-particle';
            p.style.backgroundColor = color;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            
            // Set random velocity angle
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 60 + 20;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;
            
            p.style.setProperty('--dx', `${dx}px`);
            p.style.setProperty('--dy', `${dy}px`);
            
            gameSandbox.appendChild(p);
            
            // Remove from DOM after animation completes
            setTimeout(() => p.remove(), 500);
        }
    }
    
    function stopStressGame() {
        if (gameSandbox) {
            const activeBubbles = gameSandbox.querySelectorAll('.zen-bubble');
            activeBubbles.forEach(b => b.remove());
        }
    }

    // ==========================================================================
    // SELF-CARE CHECKLIST LOGIC
    // ==========================================================================
    function initSelfCareChecklist() {
        const todayStr = new Date().toLocaleDateString();
        let checklistState = {
            date: todayStr,
            water: false,
            sleep: false,
            walk: false,
            detox: false,
            breathing: false
        };

        const storedChecklist = localStorage.getItem('zenaura_self_care_checklist');
        if (storedChecklist) {
            try {
                const parsed = JSON.parse(storedChecklist);
                if (parsed.date === todayStr) {
                    checklistState = parsed;
                }
            } catch (e) {
                console.error("Error parsing checklist storage", e);
            }
        }

        // Save current state to localStorage
        localStorage.setItem('zenaura_self_care_checklist', JSON.stringify(checklistState));

        // Update UI checkboxes
        document.querySelectorAll('.self-care-cb').forEach(cb => {
            const task = cb.getAttribute('data-task');
            cb.checked = !!checklistState[task];

            // Add change event listener (except for breathing which is disabled/automatic)
            if (task !== 'breathing') {
                cb.addEventListener('change', (e) => {
                    checklistState[task] = cb.checked;
                    localStorage.setItem('zenaura_self_care_checklist', JSON.stringify(checklistState));
                    updateSelfCareProgress(checklistState);
                });
            }
        });

        updateSelfCareProgress(checklistState);
    }

    function updateSelfCareProgress(state) {
        const tasks = ['water', 'sleep', 'walk', 'detox', 'breathing'];
        let completedCount = 0;
        tasks.forEach(t => {
            if (state[t]) completedCount++;
        });

        const progressPercent = Math.round((completedCount / tasks.length) * 100);
        
        const fillBar = document.getElementById('self-care-progress-bar-fill');
        const progressTxt = document.getElementById('self-care-progress-txt');
        
        if (fillBar) fillBar.style.width = `${progressPercent}%`;
        if (progressTxt) progressTxt.textContent = `${completedCount}/${tasks.length} Complete`;
    }

    function completeMindfulnessChecklistTask() {
        const storedChecklist = localStorage.getItem('zenaura_self_care_checklist');
        if (storedChecklist) {
            try {
                const parsed = JSON.parse(storedChecklist);
                parsed.breathing = true;
                localStorage.setItem('zenaura_self_care_checklist', JSON.stringify(parsed));
                
                const breathingCb = document.getElementById('cb-task-breathing');
                if (breathingCb) {
                    breathingCb.checked = true;
                }
                updateSelfCareProgress(parsed);
            } catch (e) {
                console.error(e);
            }
        }
    }

    function initZenPopper() {
        const popperGrid = document.getElementById('zen-popper-grid');
        const btnResetPopper = document.getElementById('btn-reset-popper');
        if (!popperGrid) return;
        
        const bubbles = popperGrid.querySelectorAll('.popper-bubble');
        
        // Load popped state from localStorage
        let poppedBubbles = [];
        try {
            const saved = localStorage.getItem('zenaura_popped_stressors');
            if (saved) {
                poppedBubbles = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing popped stressors', e);
        }
        
        // Set initial state based on localStorage
        bubbles.forEach(bubble => {
            const stressVal = bubble.getAttribute('data-stress');
            const calmVal = bubble.getAttribute('data-calm');
            const textEl = bubble.querySelector('.bubble-text');
            
            if (poppedBubbles.includes(stressVal)) {
                bubble.classList.add('popped');
                if (textEl) textEl.textContent = calmVal;
            } else {
                bubble.classList.remove('popped');
                if (textEl) textEl.textContent = stressVal;
            }
            
            // Add click listener
            bubble.addEventListener('click', () => {
                if (bubble.classList.contains('popped')) return;
                
                // Pop the bubble
                bubble.classList.add('popped');
                if (textEl) {
                    setTimeout(() => {
                        textEl.textContent = calmVal;
                    }, 100);
                }
                
                // Play sound via global AudioSynth
                try {
                    AudioSynth.playBubblePop();
                } catch (err) {
                    console.warn('Audio synthesis failed', err);
                }
                
                // Spawn particle animation
                spawnPopperParticles(bubble);
                
                // Save to localStorage
                if (!poppedBubbles.includes(stressVal)) {
                    poppedBubbles.push(stressVal);
                    localStorage.setItem('zenaura_popped_stressors', JSON.stringify(poppedBubbles));
                }
            });
        });
        
        // Reset popper button listener
        if (btnResetPopper) {
            btnResetPopper.addEventListener('click', () => {
                poppedBubbles = [];
                localStorage.removeItem('zenaura_popped_stressors');
                
                bubbles.forEach(bubble => {
                    bubble.classList.remove('popped');
                    const stressVal = bubble.getAttribute('data-stress');
                    const textEl = bubble.querySelector('.bubble-text');
                    if (textEl) {
                        textEl.textContent = stressVal;
                    }
                });
                
                // Play a nice click sound
                try {
                    AudioSynth.playBubblePop();
                } catch (err) {}
            });
        }
    }
    
    function spawnPopperParticles(bubble) {
        const card = document.getElementById('zen-popper-card');
        if (!card) return;
        
        const bubbleRect = bubble.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        const x = bubbleRect.left - cardRect.left + bubbleRect.width / 2;
        const y = bubbleRect.top - cardRect.top + bubbleRect.height / 2;
        
        const numParticles = 16;
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'zen-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Velocity calculation: random angle and speed for explosion
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            
            particle.style.setProperty('--dx', `${dx}px`);
            particle.style.setProperty('--dy', `${dy}px`);
            
            const size = 5 + Math.random() * 6;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            card.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 600);
        }
    }

    // ==========================================================================
    // ZEN DOODLE THERAPY CANVAS & ANALYSIS LOGIC
    // ==========================================================================
    function initDoodleTherapy() {
        const canvas = document.getElementById('doodle-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const clearBtn = document.getElementById('btn-clear-doodle');
        const analyzeBtn = document.getElementById('btn-analyze-doodle');
        const brushSizeSlider = document.getElementById('doodle-brush-size');
        const colorsContainer = document.getElementById('doodle-colors-list');
        const colorBtns = colorsContainer ? colorsContainer.querySelectorAll('.color-btn') : [];
        
        const emptyState = document.getElementById('doodle-empty');
        const loadingState = document.getElementById('doodle-loading');
        const contentState = document.getElementById('doodle-content');
        
        const resAnalysis = document.getElementById('doodle-res-analysis');
        const resVibes = document.getElementById('doodle-res-vibes');
        const resCoping = document.getElementById('doodle-res-coping');
        
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let brushColor = '#7c3aed';
        let brushSize = 6;
        let isEraser = false;
        
        let activeMelody = null;
        let isMelodyPlaying = false;
        const playMelodyBtn = document.getElementById('btn-play-melody');
        const melodyViz = document.getElementById('melody-viz');
        
        // Initialize canvas background (white background is critical for contrast)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Drawing configurations
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        
        // Drawing event handlers
        function draw(e) {
            if (!isDrawing) return;
            
            // Get coordinates relative to canvas
            const rect = canvas.getBoundingClientRect();
            
            // Defend against division by zero if canvas is styled display:none
            const width = rect.width || canvas.width;
            const height = rect.height || canvas.height;
            
            const scaleX = canvas.width / width;
            const scaleY = canvas.height / height;
            
            const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            
            const currentX = (clientX - rect.left) * scaleX;
            const currentY = (clientY - rect.top) * scaleY;
            
            // Apply stroke styles defensively during every path stroke
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
            ctx.lineWidth = brushSize;
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            [lastX, lastY] = [currentX, currentY];
        }
        
        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            
            const width = rect.width || canvas.width;
            const height = rect.height || canvas.height;
            
            const scaleX = canvas.width / width;
            const scaleY = canvas.height / height;
            
            const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
            const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
            
            lastX = (clientX - rect.left) * scaleX;
            lastY = (clientY - rect.top) * scaleY;
            
            // Apply initial brush properties
            ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
            ctx.lineWidth = brushSize;
        }
        
        function stopDrawing() {
            isDrawing = false;
        }
        
        // Mouse Listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch Listeners (for mobile devices)
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(e);
        });
        canvas.addEventListener('touchend', stopDrawing);
        
        // Brush Color Pickers
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const selectedColor = btn.getAttribute('data-color');
                if (btn.id === 'btn-eraser') {
                    isEraser = true;
                    ctx.strokeStyle = '#ffffff';
                } else {
                    isEraser = false;
                    brushColor = selectedColor;
                    ctx.strokeStyle = brushColor;
                }
            });
        });
        
        // Brush Size Slider
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', () => {
                brushSize = brushSizeSlider.value;
                ctx.lineWidth = brushSize;
            });
        }
        
        // Clear Canvas
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                if (isEraser) {
                    ctx.strokeStyle = '#ffffff';
                } else {
                    ctx.strokeStyle = brushColor;
                }
            });
        }
        
        // Analyze Doodle
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async () => {
                emptyState.classList.add('hidden');
                contentState.classList.add('hidden');
                loadingState.classList.remove('hidden');
                
                try {
                    const dataUrl = canvas.toDataURL('image/png');
                    const base64Data = dataUrl.split(',')[1];
                    
                    const response = await window.ZenAuraAI.analyzeDoodleWithAI(base64Data);
                    
                    resAnalysis.textContent = response.analysis || "Processed drawing successfully.";
                    
                    // Set custom chimes composition from response
                    activeMelody = response.melody || {
                        frequencies: [261.63, 293.66, 329.63, 392.00, 440.00],
                        tempo: 800,
                        synthType: "triangle"
                    };
                    
                    // Reset composer playback UI
                    isMelodyPlaying = false;
                    AudioSynth.stopComposerMelody();
                    if (playMelodyBtn) {
                        playMelodyBtn.classList.remove('active');
                        const pmIcon = playMelodyBtn.querySelector('i, svg');
                        if (pmIcon) pmIcon.setAttribute('data-lucide', 'play');
                    }
                    if (melodyViz) {
                        melodyViz.classList.add('hidden');
                    }
                    lucide.createIcons();
                    
                    if (resVibes) {
                        resVibes.replaceChildren();
                        const vibesList = response.vibes || ["Zen Expression"];
                        vibesList.forEach(vibe => {
                            const chip = document.createElement('span');
                            chip.className = 'trigger-chip';
                            chip.style.backgroundColor = 'var(--accent-purple-glow)';
                            chip.style.color = 'var(--accent-purple)';
                            chip.textContent = vibe;
                            resVibes.appendChild(chip);
                        });
                    }
                    
                    if (resCoping) {
                        resCoping.textContent = response.coping || "Take a slow deep breath.";
                    }
                    
                    loadingState.classList.add('hidden');
                    contentState.classList.remove('hidden');
                    
                } catch (error) {
                    console.error("Doodle analysis error:", error);
                    alert("Unable to analyze doodle. Please check your Gemini API key or network connection.");
                    loadingState.classList.add('hidden');
                    emptyState.classList.remove('hidden');
                }
            });
        }

        if (playMelodyBtn) {
            playMelodyBtn.addEventListener('click', () => {
                if (!activeMelody) return;
                
                isMelodyPlaying = !isMelodyPlaying;
                
                if (isMelodyPlaying) {
                    playMelodyBtn.classList.add('active');
                    const pmIcon = playMelodyBtn.querySelector('i, svg');
                    if (pmIcon) pmIcon.setAttribute('data-lucide', 'square');
                    lucide.createIcons();
                    
                    if (melodyViz) {
                        melodyViz.classList.remove('hidden');
                    }
                    
                    // Stop standard ambient loops
                    soundItems.forEach(si => si.classList.remove('active'));
                    soundItems.forEach(si => si.querySelector('.sound-toggle i, .sound-toggle svg').setAttribute('data-lucide', 'play'));
                    soundViz.classList.add('hidden');
                    
                    AudioSynth.playComposerMelody(activeMelody.frequencies, activeMelody.tempo, activeMelody.synthType);
                } else {
                    playMelodyBtn.classList.remove('active');
                    const pmIcon = playMelodyBtn.querySelector('i, svg');
                    if (pmIcon) pmIcon.setAttribute('data-lucide', 'play');
                    lucide.createIcons();
                    
                    if (melodyViz) {
                        melodyViz.classList.add('hidden');
                    }
                    
                    AudioSynth.stopComposerMelody();
                }
            });
        }
    }

    // ==========================================================================
    // VOICE JOURNALING SPEECH-TO-TEXT LOGIC
    // ==========================================================================
    function initVoiceJournaling() {
        const micBtn = document.getElementById('btn-voice-journal');
        const journalText = document.getElementById('journal-text');
        const micStatus = document.getElementById('mic-status-text');
        
        if (!micBtn || !journalText) return;
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            micBtn.style.opacity = '0.5';
            micBtn.style.cursor = 'not-allowed';
            micBtn.title = 'Speech-to-Text not supported in your browser (use Chrome or Edge)';
            if (micStatus) micStatus.textContent = 'Unsupported';
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        let isRecording = false;
        
        recognition.onstart = () => {
            isRecording = true;
            micBtn.classList.add('recording');
            if (micStatus) micStatus.textContent = 'Listening...';
            const icon = micBtn.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'mic-off');
                lucide.createIcons();
            }
        };
        
        recognition.onend = () => {
            isRecording = false;
            micBtn.classList.remove('recording');
            if (micStatus) micStatus.textContent = 'Speak';
            const icon = micBtn.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'mic');
                lucide.createIcons();
            }
        };
        
        recognition.onerror = (e) => {
            console.error("Speech recognition error:", e.error);
            isRecording = false;
            micBtn.classList.remove('recording');
            if (micStatus) micStatus.textContent = 'Error';
            setTimeout(() => {
                if (micStatus) micStatus.textContent = 'Speak';
            }, 2000);
        };
        
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            const currentValue = journalText.value.trim();
            if (currentValue) {
                journalText.value = currentValue + ' ' + transcript;
            } else {
                journalText.value = transcript;
            }
            journalText.dispatchEvent(new Event('input'));
        };
        
        micBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    }

    function initThemePresets() {
        const dots = document.querySelectorAll('.preset-color-dot');
        
        // Load saved theme
        const savedTheme = localStorage.getItem('zenaura_accent_theme') || 'violet';
        applyAccentTheme(savedTheme);
        
        dots.forEach(dot => {
            const theme = dot.getAttribute('data-theme');
            if (theme === savedTheme) {
                dots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', () => {
                dots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                applyAccentTheme(theme);
                localStorage.setItem('zenaura_accent_theme', theme);
            });
        });
        
        function applyAccentTheme(theme) {
            const root = document.documentElement;
            if (theme === 'violet') {
                root.style.setProperty('--accent-purple', '#7c3aed');
                root.style.setProperty('--accent-purple-glow', 'rgba(124, 58, 237, 0.08)');
                root.style.setProperty('--bg-nav-active', 'rgba(124, 58, 237, 0.08)');
            } else if (theme === 'ocean') {
                root.style.setProperty('--accent-purple', '#2563eb');
                root.style.setProperty('--accent-purple-glow', 'rgba(37, 99, 235, 0.08)');
                root.style.setProperty('--bg-nav-active', 'rgba(37, 99, 235, 0.08)');
            } else if (theme === 'emerald') {
                root.style.setProperty('--accent-purple', '#0d9488');
                root.style.setProperty('--accent-purple-glow', 'rgba(13, 148, 136, 0.08)');
                root.style.setProperty('--bg-nav-active', 'rgba(13, 148, 136, 0.08)');
            } else if (theme === 'sunset') {
                root.style.setProperty('--accent-purple', '#e11d48');
                root.style.setProperty('--accent-purple-glow', 'rgba(225, 29, 72, 0.08)');
                root.style.setProperty('--bg-nav-active', 'rgba(225, 29, 72, 0.08)');
            }
        }
    }

    // Init Application
    init();
    loadChatHistory();
});
