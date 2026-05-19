https://code-quest-ai-sage.vercel.app/ 
Here is the live and working link..


# Code Quest AI Bot 🚀
**Code Quest AI Bot** is a next-generation, adaptive programming tutor designed to bridge the gap between static tutorials and personalized mentorship. By leveraging Large Language Models (LLMs) and real-time cognitive tracking, Code Quest crafts a unique learning path for every developer.

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Core Features](#-core-features)
- [How It Works (Architecture)](#-how-it-works-architecture)
- [Intelligence & NLP](#-intelligence--nlp)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)

---

## 🏛️ Overview

Traditional coding platforms often suffer from "one-size-fits-all" syndrome. Code Quest solves this by implementing an **Adaptive Learning Engine**. The system continuously monitors user performance across quizzes, challenges, and conversations to dynamically adjust the curriculum's difficulty and depth.

---

## ✨ Core Features

- **Adaptive AI Mentorship:** Direct integration with Google Gemini for sophisticated, context-aware programming guidance.
- **Dynamic Skill Leveling:** A gamified XP system that tracks progress across Python, JavaScript, Database Architecture, and more.
- **Cognitive Guardrails:** An intelligent quiz system that analyzes "misconception patterns" to prevent learning plateaus.
- **Persistent Persona:** Secure authentication and data persistence ensuring your progress is synchronized across devices.
- **Minimalist Academic UI:** A focus-driven interface designed using Swiss design principles for maximum readability and zero distraction.

---

## 🧠 How It Works (Architecture)

### 1. The Feedback Loop
Every interaction follows a four-step cycle:
1.  **Ingestion:** The user's query and current profile (level, XP, previous errors) are packaged into a high-context prompt.
2.  **Processing:** Google Gemini analyzes the intent and determines if the user needs a conceptual explanation, a code walkthrough, or a diagnostic challenge.
3.  **Validation:** AI-generated code is sanitized and presented via Markdown for clear syntax highlighting.
4.  **Persistence:** Your "Cognitive State" is updated in Firebase Firestore, refining the AI's understanding of your skills.

### 2. Gamification Logic
- **XP (Experience Points):** Awarded for completing challenges and engaging in technical discourse.
- **Levels:** Unlocked as XP thresholds are met, which in turn unlocks more complex AI personas (e.g., from "Junior Guide" to "Senior Architect").

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Functional Components, Hooks API)
- **Build Tool:** Vite (High-performance HMR)
- **Styling:** Tailwind CSS 4.0 (Utility-first, responsive)
- **Animations:** Motion (Staggered entrances, layout transitions)
- **Markdown:** React Markdown (Rich text rendering)

### Backend & AI
- **Authentication:** Firebase Auth (Google & Email/Password)
- **Database:** Cloud Firestore (NoSQL, Real-time)
- **AI Agent:** Google Gemini API (`@google/genai`)

---

## 🔬 Intelligence & NLP

Code Quest utilizes **Transformer-based Language Models** to perform high-level NLP tasks:
- **Semantic Mapping:** Determining the "semantic distance" between a user's answer and the correct programming concept.
- **Synthetic Feedback Generation:** Creating personalized responses that address *why* an error occurred, rather than just stating it's wrong.
- **Dynamic Prompt Engineering:** Automatically adjusting the AI's system instruction based on the user's current "Quest Category."

---

## 📂 Project Structure

```text
├── src/
│   ├── components/       # Reusable UI components (shadcn-based)
│   ├── lib/              # Firebase configuration & Auth Context
│   ├── services/         # Gemini API integration & prompt logic
│   ├── types.ts          # Global TypeScript interfaces
│   ├── App.tsx           # Main application entry & Routing
│   └── main.tsx          # React application root
├── firebase-blueprint.json # Database schema definition
└── firestore.rules       # Security rules for data protection
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+
- [Google AI Studio Key](https://aistudio.google.com/)
- [Firebase Project](https://console.firebase.google.com/)

### 2. Installations
```bash
git clone <your-repo-url>
cd code-quest-ai
npm install
```

### 3. Environment Configuration
Create a `.env` file:
```env
VITE_GEMINI_API_KEY=your_key_here
```
*Note: Update `firebase-applet-config.json` with your project's specific Firebase credentials.*

### 4. Local Execution
```bash
npm run dev
```

---

## 🌐 Deployment Guide

### Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Link the repository to your [Vercel Dashboard](https://vercel.com).
3. **Environment Variables:** Add `VITE_GEMINI_API_KEY` in the project settings.
4. Set Build Command: `npm run build`, Output Directory: `dist`.

---

## ⚠️ Troubleshooting

### Firebase Auth Issues
If you encounter `auth/operation-not-allowed` or `Google login failed`:
1.  **Enable Providers:** Go to Firebase Console > Authentication > Sign-in method. Enable **Google** and **Email/Password**.
2.  **Authorized Domains:** Ensure your hosting domain (e.g., `localhost` or your Vercel URL) is added in Authentication > Settings > Authorized domains.

### Gemini API Errors
- Ensure your API key is active and has "Gemini API" access enabled in Google AI Studio.
- Verify that your `.env` variable is correctly prefixed with `VITE_`.

---

## 📜 License
Created for technical learners everywhere. Built with ❤️ and AI.


