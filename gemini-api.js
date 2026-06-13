/* Aura Gemini API Wrapper */

const GEMINI_MODEL = 'gemini-1.5-flash';

// Get stored API key
function getApiKey() {
    return localStorage.getItem('sattva_gemini_api_key') || '';
}

// Check if API key exists
function isApiKeyConfigured() {
    const key = getApiKey();
    return key.trim().length > 0;
}

// Save API Key
function saveApiKey(key) {
    localStorage.setItem('sattva_gemini_api_key', key.trim());
}

// Clear API Key
function clearApiKey() {
    localStorage.removeItem('sattva_gemini_api_key');
}

/**
 * Call Gemini API to analyze a journal entry.
 * Returns structured JSON with emotional insights.
 */
async function analyzeJournalWithAI(journalText, selectedMood) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        // Fallback to mock analysis if no API key is provided
        return getMockJournalAnalysis(journalText, selectedMood);
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const systemInstruction = `You are Sattva, an empathetic, professional student mental wellness advisor. 
Analyze the student's journal entry. They are preparing for high-stakes exams (like NEET, JEE, board exams). 
Evaluate their text and output a JSON object containing:
1. "mood": A single word summarizing their core emotion (Happy, Calm, Anxious, Sad, Tired, Stressed).
2. "stressIndex": An integer rating from 0 (completely calm) to 100 (extreme panic/burnout).
3. "analysis": 2-3 sentences of empathetic validation and analysis of their emotional state.
4. "triggers": An array of up to 3 strings identifying specific stress triggers (e.g. "Mock Test Scores", "Peer Comparison", "Sleep Deprivation").
5. "copingStrategy": 2-3 bullet points offering personalized, actionable coping strategies for their specific situation.
6. "suggestedExercise": One of: "4-7-8" (for high anxiety), "4-4" (for focus/box breathing), or "5-5" (for balance/stress relief).

Return ONLY the raw JSON object. Do not wrap it in markdown code blocks.`;

    const promptText = `Selected Mood: ${selectedMood}
Journal Text: "${journalText}"`;

    const requestBody = {
        contents: [
            {
                role: 'user',
                parts: [{ text: promptText }]
            }
        ],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            responseMimeType: 'application/json'
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const rawJsonText = data.candidates[0].content.parts[0].text;
        
        return JSON.parse(rawJsonText.trim());
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

/**
 * Call Gemini API for a conversational chat response.
 * Expects chatHistory to be an array of { role: 'user' | 'model', parts: [{ text: string }] }
 */
async function generateChatResponse(chatHistory) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        // Fallback to mock bot chat response if no API key is provided
        return getMockChatResponse(chatHistory[chatHistory.length - 1].parts[0].text);
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are Sattva, an empathetic, supportive, and friendly mental wellness companion for students preparing for high-stakes exams. 
You listen attentively, validate their feelings, offer warm encouragement, and help them find calm.
Do not give medical or clinical advice. Always safely state that you are an AI companion, not a therapist, if they mention self-harm or deep depression.
Keep your responses warm, conversational, and relatively short (under 4-5 sentences). Focus on exam anxiety, motivation, stress relief, and studying healthily.`;

    const requestBody = {
        contents: chatHistory,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini API Chat Error:", error);
        throw error;
    }
}

/* ==========================================================================
   CONVERSATIONAL FALLBACKS (Runs when API Key is not configured)
   ========================================================================== */

function getMockJournalAnalysis(text, userSelectedMood) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const cleanText = text.toLowerCase();
            let mood = userSelectedMood || "Stressed";
            let stressIndex = 65;
            let triggers = ["Exam Time Pressure"];
            let copingStrategy = "Break your studying into 25-minute Pomodoro sessions with a 5-minute movement break.";
            let exercise = "5-5";
            let analysis = "It sounds like you're carrying a heavy load of academic duties. Balancing intense test prep and emotional wellness is challenging, and feeling overwhelmed is completely natural.";

            if (cleanText.includes("mock") || cleanText.includes("test") || cleanText.includes("score")) {
                triggers = ["Mock Test Anxiety", "Self-Doubt"];
                stressIndex = 80;
                mood = "Anxious";
                analysis = "Your journal indicates you are focusing heavily on mock exam performance. Remember, mock tests are diagnostics to find weaknesses, not definitions of your final intelligence or success.";
                copingStrategy = [
                    "Review your incorrect answers calmly as 'learning opportunities'.",
                    "Do not check answers immediately after completing a test segment; give yourself a 30-minute cooling off period."
                ];
                exercise = "4-7-8";
            } else if (cleanText.includes("parent") || cleanText.includes("family") || cleanText.includes("peer") || cleanText.includes("disappoint") || cleanText.includes("pressure")) {
                triggers = ["Fear of Disappointing Others", "Comparison Stress"];
                stressIndex = 85;
                mood = "Stressed";
                analysis = "You're experiencing significant external pressure and comparing your journey with peers. Remember that everyone moves at their own pace, and your career path is uniquely yours.";
                copingStrategy = [
                    "Have a gentle, honest conversation with someone you trust about how you feel.",
                    "Realize that exam scores are not a measure of your worth to your family or friends."
                ];
                exercise = "4-7-8";
            } else if (cleanText.includes("sleep") || cleanText.includes("tired") || cleanText.includes("exhausted") || cleanText.includes("night") || cleanText.includes("insomnia")) {
                triggers = ["Sleep Deficit", "Physical Burnout"];
                stressIndex = 75;
                mood = "Tired";
                analysis = "Your physical battery is low, and burnout is showing. Academic success is directly tied to rest. Memory consolidation happens primarily during deep REM sleep.";
                copingStrategy = [
                    "Set a strict screen-time boundary 30 minutes before bed.",
                    "Commit to sleeping at least 7 hours tonight, even if it means missing a study chapter."
                ];
                exercise = "4-4";
            }

            resolve({
                mood: mood,
                stressIndex: stressIndex,
                analysis: analysis,
                triggers: triggers,
                copingStrategy: copingStrategy,
                suggestedExercise: exercise
            });
        }, 1500); // Simulate network latency
    });
}

function getMockChatResponse(userMessage) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const cleanMsg = userMessage.toLowerCase();
            
            // Standard greetings
            const greetings = ["hi", "hello", "hey", "kem cho", "namaste", "good morning", "good afternoon", "good evening"];
            if (greetings.some(g => cleanMsg.startsWith(g) || cleanMsg === g)) {
                resolve("Hello there! I'm Sattva, your wellness companion. Preparing for competitive exams can be a long and stressful journey, but I'm here to support you. What's on your mind today?");
                return;
            }

            // General mood check "how are you"
            if (cleanMsg.includes("how are you") || cleanMsg.includes("kem cho")) {
                resolve("I'm doing great, thank you for asking! I am ready to listen and support you. How are you holding up with your study schedule today?");
                return;
            }

            // Thank you
            if (cleanMsg.includes("thank") || cleanMsg.includes("thanks") || cleanMsg.includes("shukriya")) {
                resolve("You are very welcome! Remember, taking care of your mind is just as important as studying. I am always here whenever you need a breather or want to chat.");
                return;
            }

            // Farewell
            if (cleanMsg.includes("bye") || cleanMsg.includes("goodbye") || cleanMsg.includes("good night")) {
                resolve("Goodbye! Take care of yourself. Don't study too late tonight and get some rest. Talk to you soon!");
                return;
            }

            // Help instruction
            if (cleanMsg === "help" || cleanMsg.includes("what can you do")) {
                resolve("I can help you analyze your daily study journals, detect hidden stress triggers, guide you through calming breathing exercises, play ambient focus sounds, and talk through academic stress. How can I help you right now?");
                return;
            }

            // Stress / Anxiety / Fear
            if (cleanMsg.includes("stress") || cleanMsg.includes("anxious") || cleanMsg.includes("panic") || cleanMsg.includes("worry") || cleanMsg.includes("fear") || cleanMsg.includes("scared") || cleanMsg.includes("nervous") || cleanMsg.includes("tension")) {
                resolve("When exam stress or anxiety hits, it's completely normal to feel paralyzed or panicked. Try to close your eyes, take one slow breath, and write down just one tiny study task you can finish in 10 minutes. We can break this down together. Would you like to try a quick breathing session in the Calm Room?");
                return;
            }

            // Concentration / Focus
            if (cleanMsg.includes("focus") || cleanMsg.includes("concentrate") || cleanMsg.includes("racing") || cleanMsg.includes("distract") || cleanMsg.includes("attention")) {
                resolve("If your mind is racing, studying is like trying to write on water. Try using the Pomodoro technique: study for 25 minutes, then take a 5-minute break. Head to the Calm Room on the sidebar and run a 2-minute box breathing session to steady your nervous system first!");
                return;
            }

            // Mock test score / Failure / Demotivated
            if (cleanMsg.includes("score") || cleanMsg.includes("fail") || cleanMsg.includes("mock") || cleanMsg.includes("marks") || cleanMsg.includes("test") || cleanMsg.includes("rank")) {
                resolve("I know that number hurts, but a mock score is just a blueprint. It tells you which bricks need fixing, not that the whole house is falling down. Be kind to yourself today; one low score cannot erase months of hard work. Take a break, review your errors calmly, and keep going!");
                return;
            }

            // Tiredness / Sleep / Burnout
            if (cleanMsg.includes("sleep") || cleanMsg.includes("tired") || cleanMsg.includes("exhausted") || cleanMsg.includes("lazy") || cleanMsg.includes("burnout") || cleanMsg.includes("headache")) {
                resolve("Your physical battery is running low. Academic success is directly tied to rest. Your brain needs sleep to solidify concepts you learned. Commit to turning off your screens 30 minutes before bed and getting 7-8 hours of sleep tonight. You'll wake up much sharper!");
                return;
            }

            // Subject-specific anxiety (Physics, Chemistry, Biology, Maths)
            if (cleanMsg.includes("physics") || cleanMsg.includes("chemistry") || cleanMsg.includes("biology") || cleanMsg.includes("math") || cleanMsg.includes("syllabus")) {
                resolve("Subjects like Physics and Chemistry can feel incredibly heavy when formulas or reactions pile up. Don't try to memorise everything at once. Focus on understanding one core derivation or reaction mechanism today. Take it topic by topic, not chapter by chapter.");
                return;
            }

            // Specific competitive exams
            if (cleanMsg.includes("neet") || cleanMsg.includes("jee") || cleanMsg.includes("board") || cleanMsg.includes("upsc") || cleanMsg.includes("gate")) {
                resolve("Preparing for highly competitive exams requires endurance, not just speed. Remember that thousands of students share this exact stress. You don't need to be perfect; you just need to keep moving forward consistently. Make sure to schedule small breaks to prevent burnout.");
                return;
            }

            // Motivation boost
            if (cleanMsg.includes("motivation") || cleanMsg.includes("boost") || cleanMsg.includes("inspire") || cleanMsg.includes("give up") || cleanMsg.includes("sad") || cleanMsg.includes("cry")) {
                resolve("You've worked so hard to get to this point. Remember why you started this journey. You are capable of amazing focus, and you have already overcome so many hard study days. Don't let self-doubt overshadow your efforts. I believe in you!");
                return;
            }

            // General Fallback response
            resolve("I hear you, and I understand that preparing for competitive exams can feel like climbing a mountain. What part of the preparation is feeling the most difficult right now? Is it the workload, the mock scores, or the pressure to perform?");
        }, 1000);
    });
}

// Export functions to global scope
window.SattvaAI = {
    getApiKey,
    isApiKeyConfigured,
    saveApiKey,
    clearApiKey,
    analyzeJournalWithAI,
    generateChatResponse
};
