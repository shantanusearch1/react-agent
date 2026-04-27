# ⚛ React Frontend Agent

An AI-powered tool to generate production-ready React JSX pages using Claude.

## 🚀 Deploy to Vercel (5 minutes)

### Step 1 — Upload to GitHub
1. Go to https://github.com/new and create a new repository (e.g. `react-agent`)
2. Upload all these files to the repo (drag & drop or use GitHub Desktop)

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `react-agent` repository
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! You get a live URL like `https://react-agent-xyz.vercel.app`

## 🔑 Using the Agent
1. Open your Vercel URL in any browser
2. Enter your Anthropic API key (get one at https://console.anthropic.com)
3. Your key is saved in the browser — you only enter it once
4. Pick a page type, style, describe your page, and click **Generate JSX**
5. Copy the code into your React project

## 💻 Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

## 📁 Project structure
```
src/
  App.jsx       ← Main agent UI
  main.jsx      ← React entry point
  index.css     ← Global styles
index.html
vite.config.js
package.json
vercel.json
```
