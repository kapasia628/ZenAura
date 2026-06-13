/* Sattva — AI Student Mental Wellness Companion Core Logic */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
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
    const keyStatusIcon = document.querySelector('#key-status i');
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
        if (!localStorage.getItem('sattva_journals')) {
            localStorage.setItem('sattva_journals', JSON.stringify([]));
        }
        if (!localStorage.getItem('sattva_chats')) {
            localStorage.setItem('sattva_chats', JSON.stringify([]));
        }
        if (!localStorage.getItem('sattva_mindfulness_count')) {
            localStorage.setItem('sattva_mindfulness_count', '0');
        }
        if (!localStorage.getItem('sattva_streak')) {
            localStorage.setItem('sattva_streak', '1');
        }
        if (!localStorage.getItem('sattva_last_active_date')) {
            localStorage.setItem('sattva_last_active_date', new Date().toLocaleDateString());
        }

        // Init theme (Light mode default)
        const storedTheme = localStorage.getItem('sattva_theme') || 'light';
        if (storedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            btnToggleTheme.querySelector('i').setAttribute('data-lucide', 'sun');
        } else {
            document.body.classList.remove('dark-theme');
            btnToggleTheme.querySelector('i').setAttribute('data-lucide', 'moon');
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
    }

    // Update streak based on usage dates
    function updateStreakAndStats() {
        const lastDateStr = localStorage.getItem('sattva_last_active_date');
        const streak = parseInt(localStorage.getItem('sattva_streak') || '1');
        const todayStr = new Date().toLocaleDateString();
        
        if (lastDateStr !== todayStr) {
            const lastDate = new Date(lastDateStr);
            const today = new Date(todayStr);
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Streak continues!
                const newStreak = streak + 1;
                localStorage.setItem('sattva_streak', newStreak.toString());
            } else if (diffDays > 1) {
                // Reset streak
                localStorage.setItem('sattva_streak', '1');
            }
            localStorage.setItem('sattva_last_active_date', todayStr);
        }
        
        const currentStreak = localStorage.getItem('sattva_streak');
        streakCountHeader.textContent = `${currentStreak} Day Streak`;
        
        // Update mindfulness counter card
        const mindfulCount = localStorage.getItem('sattva_mindfulness_count') || '0';
        dashMindfulVal.textContent = `${mindfulCount} Session${mindfulCount !== '1' ? 's' : ''}`;
    }

    // Render Dashboard UI elements using stored values
    function updateDashboardView() {
        const journals = JSON.parse(localStorage.getItem('sattva_journals') || '[]');
        
        if (journals.length === 0) {
            dashMoodVal.textContent = "Not Logged";
            dashStressVal.textContent = "--";
            dashCopingContent.innerHTML = `<p class="empty-state">Write a journal entry. Aura will analyze it and display your personal stress-coping strategies here.</p>`;
            dashTriggersList.innerHTML = `<p class="empty-state">No triggers detected yet.</p>`;
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
            dashTriggersList.innerHTML = latest.triggers.map(trig => `
                <div class="trigger-item">
                    <span class="trigger-name">${trig}</span>
                    <span class="trigger-badge">Trigger</span>
                </div>
            `).join('');
        } else {
            dashTriggersList.innerHTML = `<p class="empty-state">No major stress triggers detected in latest entry.</p>`;
        }
        
        // Populate Coping Plan
        if (latest.copingStrategy) {
            let copingHTML = '';
            if (Array.isArray(latest.copingStrategy)) {
                copingHTML = `<ul>${latest.copingStrategy.map(item => `<li>${item}</li>`).join('')}</ul>`;
            } else if (latest.copingStrategy.includes('\n')) {
                copingHTML = `<ul>${latest.copingStrategy.split('\n').filter(line => line.trim().length > 0).map(line => `<li>${line.replace(/^[-\*\d\.\s]+/, '')}</li>`).join('')}</ul>`;
            } else {
                copingHTML = `<p>${latest.copingStrategy}</p>`;
            }
            dashCopingContent.innerHTML = copingHTML;
        } else {
            dashCopingContent.innerHTML = `<p class="empty-state">No custom coping strategy logged yet.</p>`;
        }
        
        // Render Line Chart
        drawMoodChart(journals.slice(-7)); // Last 7 entries
    }

    // Update the API Key status indicators
    function updateApiKeyStatusUI() {
        const isConfigured = window.SattvaAI.isApiKeyConfigured();
        if (isConfigured) {
            keyStatusDiv.className = 'key-status-indicator success';
            keyStatusText.textContent = 'Gemini API Key saved and active.';
            keyStatusIcon.setAttribute('data-lucide', 'check-circle-2');
            apiKeyInput.value = window.SattvaAI.getApiKey();
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
        svg.innerHTML = ''; // Clear existing
        
        if (dataPoints.length === 0) {
            svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="chart-axis-text">Write your journals to plot wellness trends</text>`;
            return;
        }

        // Define SVG gradient
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent-purple)" stop-opacity="1" />
                <stop offset="100%" stop-color="var(--accent-blue)" stop-opacity="0.8" />
            </linearGradient>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent-purple)" stop-opacity="0.25" />
                <stop offset="100%" stop-color="var(--accent-blue)" stop-opacity="0.0" />
            </linearGradient>
        `;
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
            localStorage.setItem('sattva_theme', 'dark');
            btnToggleTheme.querySelector('i').setAttribute('data-lucide', 'sun');
        } else {
            localStorage.setItem('sattva_theme', 'light');
            btnToggleTheme.querySelector('i').setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    });

    // ==========================================================================
    // SETTINGS MODAL & GEMINI API KEY LOGIC
    // ==========================================================================
    
    btnOpenSettings.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        apiKeyInput.value = window.SattvaAI.getApiKey();
    });
    
    function closeModal() {
        settingsModal.classList.add('hidden');
    }
    
    btnCloseSettings.addEventListener('click', closeModal);
    btnCancelSettings.addEventListener('click', closeModal);
    
    btnSaveSettings.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        window.SattvaAI.saveApiKey(key);
        updateApiKeyStatusUI();
        closeModal();
    });
    
    btnToggleKeyVisibility.addEventListener('click', () => {
        const currentType = apiKeyInput.getAttribute('type');
        if (currentType === 'password') {
            apiKeyInput.setAttribute('type', 'text');
            btnToggleKeyVisibility.querySelector('i').setAttribute('data-lucide', 'eye-off');
        } else {
            apiKeyInput.setAttribute('type', 'password');
            btnToggleKeyVisibility.querySelector('i').setAttribute('data-lucide', 'eye');
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
            const analysis = await window.SattvaAI.analyzeJournalWithAI(text, currentMoodSelection);
            
            // Save journal in database
            const journals = JSON.parse(localStorage.getItem('sattva_journals') || '[]');
            const entry = {
                date: new Date().toLocaleDateString(),
                mood: analysis.mood || currentMoodSelection,
                stressIndex: parseInt(analysis.stressIndex) || 50,
                text: text,
                triggers: analysis.triggers || [],
                copingStrategy: analysis.copingStrategy || ''
            };
            
            journals.push(entry);
            localStorage.setItem('sattva_journals', JSON.stringify(journals));
            
            // Recalculate streak and stats
            updateStreakAndStats();

            // Populate analysis result layout card
            resMoodTag.textContent = entry.mood;
            resStressTag.textContent = `Stress Index: ${entry.stressIndex}/100`;
            resAnalysis.textContent = analysis.analysis;
            
            // Triggers formatting
            if (entry.triggers && entry.triggers.length > 0) {
                resTriggers.innerHTML = entry.triggers.map(trig => `<span class="trigger-chip">${trig}</span>`).join('');
            } else {
                resTriggers.innerHTML = `<span class="trigger-chip">None detected</span>`;
            }
            
            // Coping strategy text formatting
            if (Array.isArray(analysis.copingStrategy)) {
                resCoping.innerHTML = `<ul>${analysis.copingStrategy.map(item => `<li>${item}</li>`).join('')}</ul>`;
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
        const chats = JSON.parse(localStorage.getItem('sattva_chats') || '[]');
        if (chats.length === 0) return;
        
        chatMessagesContainer.innerHTML = '';
        chats.forEach(msg => {
            appendMessageUI(msg.role, msg.text, msg.time);
        });
        scrollChatToBottom();
    }
    
    function saveMessageToStorage(role, text) {
        const chats = JSON.parse(localStorage.getItem('sattva_chats') || '[]');
        chats.push({
            role: role,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('sattva_chats', JSON.stringify(chats));
    }

    function scrollChatToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function appendMessageUI(role, text, timeStr) {
        const time = timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isCompanion = role === 'companion';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isCompanion ? 'companion' : 'user'}`;
        
        messageDiv.innerHTML = `
            <div class="msg-bubble">${text}</div>
            <span class="msg-time">${time}</span>
        `;
        
        chatMessagesContainer.appendChild(messageDiv);
        scrollChatToBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message companion typing-indicator-msg';
        typingDiv.id = 'sattva-typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessagesContainer.appendChild(typingDiv);
        scrollChatToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('sattva-typing-indicator');
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
        const chats = JSON.parse(localStorage.getItem('sattva_chats') || '[]');
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
            const botResponse = await window.SattvaAI.generateChatResponse(geminiHistory);
            
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
            localStorage.setItem('sattva_chats', JSON.stringify([]));
            chatMessagesContainer.innerHTML = `
                <div class="message companion">
                    <div class="msg-bubble">
                        Chat history cleared. I'm here to support you. What is on your mind?
                    </div>
                    <span class="msg-time">Just now</span>
                </div>
            `;
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

        // Stop all sound synth
        function stopAll() {
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
            soundItems.forEach(si => si.querySelector('.sound-toggle i').setAttribute('data-lucide', 'play'));
            AudioSynth.stopAll();
            soundViz.classList.add('hidden');
            
            if (!isActive) {
                // Turn on this sound
                item.classList.add('active');
                toggleBtn.querySelector('i').setAttribute('data-lucide', 'square');
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
        btnBreathingControl.querySelector('i').setAttribute('data-lucide', 'square');
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
        btnBreathingControl.querySelector('i').setAttribute('data-lucide', 'play');
        lucide.createIcons();
        
        breathingStatusText.textContent = 'Ready';
        breathingTimerCount.textContent = '--';
        breathingBubble.style.transition = 'transform 0.4s ease';
        breathingBubble.style.transform = 'scale(1.0)';
        
        // Log mindfulness completion session in storage
        const count = parseInt(localStorage.getItem('sattva_mindfulness_count') || '0');
        const newCount = count + 1;
        localStorage.setItem('sattva_mindfulness_count', newCount.toString());
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
            const toggleIcon = btnPomodoroToggle.querySelector('i');
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
            const toggleIcon = btnPomodoroToggle.querySelector('i');
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

        const storedChecklist = localStorage.getItem('sattva_self_care_checklist');
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
        localStorage.setItem('sattva_self_care_checklist', JSON.stringify(checklistState));

        // Update UI checkboxes
        document.querySelectorAll('.self-care-cb').forEach(cb => {
            const task = cb.getAttribute('data-task');
            cb.checked = !!checklistState[task];

            // Add change event listener (except for breathing which is disabled/automatic)
            if (task !== 'breathing') {
                cb.addEventListener('change', (e) => {
                    checklistState[task] = cb.checked;
                    localStorage.setItem('sattva_self_care_checklist', JSON.stringify(checklistState));
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
        const storedChecklist = localStorage.getItem('sattva_self_care_checklist');
        if (storedChecklist) {
            try {
                const parsed = JSON.parse(storedChecklist);
                parsed.breathing = true;
                localStorage.setItem('sattva_self_care_checklist', JSON.stringify(parsed));
                
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

    // Init Application
    init();
    loadChatHistory();
});
