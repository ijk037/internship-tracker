# 🚀 Internship Tracker (Web + Chrome Clipper Extension)

A premium, state-of-the-art job and internship application tracker that helps you organize your job search, visualize your application funnel, and clip listings directly from LinkedIn and Indeed in one click.

---

## 📂 Project Structure

```text
internship tracker/
├── schema.sql            # Database schema migration script for Supabase
├── web/                  # Vite + React web application
│   ├── src/
│   │   ├── pages/        # Dashboard, Login, Signup, Home, NotFound pages
│   │   ├── lib/          # Supabase client setup
│   │   └── index.css     # Premium dark-mode CSS variables & animations
│   └── package.json
└── extension/            # Companion Chrome/Firefox scraper extension
    ├── manifest.json     # Extension Manifest V3 configuration
    ├── popup.html        # Clipper UI matching the web theme
    ├── popup.js          # Persists Supabase Auth & posts data to DB
    ├── content.js        # Scraper logic for LinkedIn & Indeed
    └── icon.svg          # Glow-accent vector logo
```

---

## ⚡ Setup Instructions

### 1. Database Setup (Supabase)
The web app is configured with an active Supabase instance.
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/uffxmfvvppeqgbpytfys/sql).
2. Go to the **SQL Editor** tab.
3. Open a **New Query**.
4. Copy and paste the entire contents of [schema.sql](file:///D:/vsc/internship%20tracker/schema.sql).
5. Click **Run** to execute. This extends your `applications` table with location, salary, notes, and scraper capabilities.

*Note: The frontend is engineered with an RLS fallback system. If you choose not to run the migration, the application will still function gracefully using basic columns.*

### 2. Web Application Setup
1. Open your terminal in the `web/` folder:
   ```bash
   cd web
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser. Create an account, sign in, and explore your premium dashboard!

### 3. Chrome Extension Clipper Setup
1. Open your Chrome browser and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top-right corner).
3. Click **Load unpacked** (top-left corner).
4. Select the `extension/` folder located inside this project directory (`D:\vsc\internship tracker\extension`).
5. Pin the **Job Clipper** extension for quick access.
6. Open any job post on **LinkedIn** or **Indeed**, click the extension, log in using the same credentials, select your status, and save!

---

## ✨ Features & Architecture

* **Web UI**: High-contrast, premium dark mode using HSL gradients, glassmorphic layout elements, glowing metric blocks, and responsive typography.
* **Kanban Board**: Drag/move application cards dynamically across 5 stages (`Wishlist`, `Applied`, `Interviewing`, `Offer`, `Rejected`).
* **Companion Chrome Scraper**: A lightweight scraper built on Manifest V3. Detects job title, company, location, and listing URL from active pages and writes straight to your database.
* **Smart DB Sync**: Authenticates users inside the extension and persists sessions securely using `chrome.storage.local`.
