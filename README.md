# Code Quest AI Bot - Setup & Hosting Guide

Welcome to **Code Quest AI Bot**! This guide will walk you through setting up the project on your local machine and hosting it for the world to see.

## 1. Local Development Setup

To run this project locally, you'll need **Node.js** (v18 or higher) installed on your computer.

### Step 1: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
You need to provide your API keys for the app to function. 
1. Create a file named `.env` in the root directory.
2. Copy the contents from `.env.example` into `.env`.
3. Fill in your **GEMINI_API_KEY**. You can get one from the [Google AI Studio](https://aistudio.google.com/).
4. (Optional) If you manually set up a new Firebase project, update the values in `firebase-applet-config.json`.

### Step 3: Start the Development Server
Run the following command:
```bash
npm run dev
```
Your app will be available at `http://localhost:3000`.

---

## 2. Hosting the Project

Since this project uses **Firebase** for its database and authentication, the easiest way to host it is using **Firebase Hosting**.

### Option A: Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (Select **Hosting**, use the existing project if prompted).
4. For the public directory, choose `dist`.
5. Configure as a single-page app: `Yes`.
6. Set up automatic builds and deploys with GitHub: `Optional`.
7. **Deploy:** 
   ```bash
   npm run build
   firebase deploy
   ```

### Option B: Vercel or Netlify
1. Connect your GitHub repository to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Set the **Build Command** to `npm run build`.
3. Set the **Output Directory** to `dist`.
4. **Important:** Add your environment variables (like `GEMINI_API_KEY`) in the Vercel/Netlify dashboard settings.

---

## 3. Troubleshooting (Blank Page)

If you see a blank white page when running locally:
1. **Open the Console:** Press `F12` or `Ctrl+Shift+I` and look for errors in the "Console" tab.
2. **Firebase Config:** Ensure `firebase-applet-config.json` exists in the root folder.
3. **Environment Variables:** Ensure you have `.env` file with `GEMINI_API_KEY`.
4. **Node Version:** Ensure you are using Node.js v18 or newer.
5. **Clean Install:** Delete `node_modules` and run `npm install` again.

## 4. Project Structure
- `src/`: Modern React frontend code.
- `src/services/geminiService.ts`: Integration with Google Gemini AI.
- `firestore.rules`: Security configuration for your database.
- `index.html`: The entry point for the browser.

---

## Need Help?
Check the `REPORT_STRUCTURE.md` or `PROJECT_REPORT.html` in this directory for deep technical details about the system architecture.
