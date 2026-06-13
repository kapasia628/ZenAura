# Sattva — AI Student Mental Wellness Companion

Sattva is an empathetic, Generative AI-powered mental wellness application designed to help students preparing for board exams and competitive entrance tests (e.g., NEET, JEE, CUET, CAT, GATE, UPSC) monitor and improve their emotional well-being.

Built for the **Google PromptWars (Build with AI)** challenge.

## 🌟 Key Features

1. **Dashboard & Analytics**: Track mood history, stress levels, and triggers automatically extracted from daily journaling using a dynamic SVG line chart.
2. **AI Journal & Stress Analyzer**: Leverages Google Gemini 1.5 Flash to parse open-ended daily reflections, highlighting emotional patterns and offering custom coping cards.
3. **Sattva Empathetic Companion**: A friendly conversational AI bot prepared to talk students through exam pressure, burnout, test failures, and focus challenges.
4. **Mindfulness & Calm Room**: 
   - Interactive guided breathing bubble with presets (4-7-8 Deep Calming, 4-4 Box Breathing, 5-5 Resonance).
   - Custom synthesized ambient sound generator (Rain, Forest wind, Waves, Binaural Focus Beats) using the **HTML5 Web Audio API** (100% offline, zero network required).
   - Positive affirmation decks to boost study confidence.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: HTML5 & ES6 Javascript.
- **Styling System**: Vanilla CSS featuring modern Outfit & Inter typography, responsive layouts, and glassmorphic card overlays.
- **AI Integration**: Official Google Gemini 1.5 API client-side fetch.
- **Security**: The developer Gemini API Key is entered via a secure client-side setting and saved in the user's browser `localStorage`, ensuring zero risk of keys leaking into code or source repositories.

---

## 🚀 How to Deploy to GitHub Pages (Step-by-Step)

Since Aura is built using static HTML/CSS/JS, it can be hosted on **GitHub Pages** for free in less than 2 minutes:

### Step 1: Create a GitHub Repository
1. Go to [github.com](https://github.com) and log in.
2. Click **New** to create a repository.
3. Name your repository (e.g., `aura-wellness-tracker`).
4. Set it to **Public** (required for free GitHub Pages).
5. Leave "Add a README" unchecked, then click **Create repository**.

### Step 2: Initialize Git and Push Code
Open terminal (Git Bash, Command Prompt, or VS Code terminal) in your project directory `c:\xampp\htdocs\mental\` and run these commands:

```bash
# Initialize a local git repository
git init

# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit of Aura AI Wellness Tracker"

# Rename default branch to main
git branch -M main

# Link to your remote GitHub repository (Replace with your repository link!)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/aura-wellness-tracker.git

# Push your code to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository page on GitHub.
2. Click on the **Settings** tab.
3. On the left sidebar under the "Code and automation" section, click on **Pages**.
4. Under the **Build and deployment** section, select **Deploy from a branch** as the source.
5. Under **Branch**, click the dropdown that says `None` and select `main` (and `/root` folder).
6. Click **Save**.

Within 1-2 minutes, GitHub will build your site. You will see a live link at the top of the Pages settings page, like:
`https://YOUR_GITHUB_USERNAME.github.io/aura-wellness-tracker/`

---

## 🔑 Getting a Gemini API Key

To run the AI analytics and Chatbot:
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and create a new key.
3. In the Aura app, click the **Gemini API Key** button on the bottom left sidebar.
4. Paste the key and click **Save**. It will be saved securely on your local browser.
