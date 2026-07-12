# Code Quest AI Bot 🚀
Here is the Live Link for

Code Quest https://code-quest-ai-sage.vercel.app/


[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue?logo=google-gemini)](https://aistudio.google.com/)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2019-61DAFB?logo=react)](https://react.dev/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Database Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?logo=firebase)](https://firebase.google.com/)

**Code Quest AI Bot** is a next-generation, adaptive programming tutor designed to bridge the gap between static tutorials and personalized mentorship. By leveraging Large Language Models (LLMs) and real-time cognitive tracking, Code Quest crafts a unique learning path for every developer.

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Milestone Progress](#-milestone-progress)
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

## 🚩 Milestone Progress

The development of Code Quest AI Bot is structured into five core evolutionary phases:

### Phase 1: Foundation & Infrastructure ✅
- [x] React 19 / Vite environment initialization.
- [x] Swiss-inspired design system implementation with Tailwind CSS 4.0.
- [x] Responsive layout architecture for Desktop and Mobile.

### Phase 2: Persistence & Authentication ✅
- [x] Firebase integration (Firestore & Auth).
- [x] Implementation of the "Cognitive State" document schema.
- [x] Google OAuth & secure sign-in flows.

### Phase 3: intelligence Engine ✅
- [x] Google Gemini API integration (`gemini-2.0-flash` & `gemini-1.5-pro`).
- [x] Adaptive prompt engineering system for personality consistency.
- [x] Contextual memory handling for long-running learning sessions.

### Phase 4: Gamification & UX ✅
- [x] Dynamic XP and Leveling system.
- [x] Real-time diagnostic quiz generator.
- [x] Interactive progress dashboard with data visualization.

### Phase 5: Hardening & Documentation ✅
- [x] Firestore security rules modernization.
- [x] Error handling & diagnostic UI for common auth failures.
- [x] Comprehensive technical documentation (Complete).

---

## ✨ Core Features

- **Adaptive AI Mentorship:** Direct integration with Google Gemini for sophisticated, context-aware programming guidance.
- **Dynamic Skill Leveling:** A gamified XP system that tracks progress across Python, JavaScript, Database Architecture, and more.
- **Cognitive Guardrails:** An intelligent quiz system that analyzes "misconception patterns" to prevent learning plateaus.
- **Persistent Persona:** Secure authentication and data persistence ensuring your progress is synchronized across devices.
- **Minimalist Academic UI:** A focus-driven interface designed using Swiss design principles for maximum readability and zero distraction.

---

## 🧠 How It Works (Architecture)

### 1. The Design Conversation Flow
Code Quest employs a **State-Aware Conversation Model**. Unlike standard linear chatbots, the dialogue flows through a specialized pipeline designed for educational retention:

*   **Phase A: Intent Classification**
    The system first categorizes user input into one of three buckets: *Clarification Seeking* (Help me understand), *Exploratory* (What if I do X?), or *Validation* (Is this code correct?).

*   **Phase B: Context Injection**
    The AI doesn't just see the last message; it receives a \"Cognitive Snapshot\" containing:
    - Current Level & Topic Mastery
    - Historical Misconceptions (past quiz failures)
    - Previous Interaction Tone (to maintain personality consistency)

*   **Phase C: Adaptive Scaffolding**
    Based on the intent, the AI uses **Educational Scaffolding**. It provides partial solutions or leading questions rather than complete answers, forcing the user to engage in critical thinking before revealing the full implementation.

*   **Phase D: Evaluation Trigger**
    After a topic is explained, the flow automatically transitions to a **Micro-Assessment**. The AI generates a 1-3 question challenge to lock in the knowledge before allowing the user to proceed to more complex quests.

### 2. The Feedback Loop
Every interaction follows a four-step cycle:
1.  **Ingestion:** The user's query and current profile (level, XP, previous errors) are packaged into a high-context prompt.
2.  **Processing:** Google Gemini analyzes the intent and determines if the user needs a conceptual explanation, a code walkthrough, or a diagnostic challenge.
3.  **Validation:** AI-generated code is sanitized and presented via Markdown for clear syntax highlighting.
4.  **Persistence:** Your \"Cognitive State\" is updated in Firebase Firestore, refining the AI's understanding of your skills.

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

## 👥 Credits

**Code Quest AI Bot** is a solo project conceptualized, designed, and developed by:

*   **Sagar Ruhil** - [Portfolio](https://v0-sagarruhil.vercel.app/)

## 📜 License
Created for technical learners everywhere. Built with ❤️ and AI by Sagar.

