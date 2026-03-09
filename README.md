# Onerios-Quests — Scan. Answer. Conquer.

A cyberpunk-themed QR code scavenger-hunt quiz game built with **React + Vite**, **Supabase**, and **TailwindCSS**.

---

## How It Works

1. Physical QR codes are placed at real-world locations.
2. Players scan a code → open `https://yourapp.com/play?token=<QR_TOKEN>` in their browser.
3. They log in (or register) with Supabase Auth.
4. A multiple-choice question is shown — answer correctly to earn **+10 pts**, wrongly to lose **–5 pts**.
5. Each QR code can only be used **once per player**.
6. Scores are tracked on a live **Leaderboard**.

---

## Tech Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Frontend    | React 18, Vite 5              |
| Styling     | TailwindCSS 3 (cyberpunk theme)|
| Backend     | Supabase (Auth + PostgreSQL)  |
| Routing     | React Router v6               |
| QR Codes    | `qrcode` npm library          |

---

## Project Structure

```
src/
  components/
    Navbar.jsx         — Top navigation bar with score display
    QuestionCard.jsx   — Glassmorphic MCQ question container
    AnswerButton.jsx   — Animated MCQ option button
  pages/
    Home.jsx           — Landing page
    LoginPage.jsx      — Email/password login
    RegisterPage.jsx   — New user registration
    PlayPage.jsx       — Core game page (reads token → fetches question → handles submission)
    Leaderboard.jsx    — Top players ranked by score
  supabase/
    supabaseClient.js  — Initialised Supabase client
  utils/
    scoreUtils.js      — updateScore / getUserScore / getLeaderboard
    qrGenerator.js     — buildPlayUrl helper
  App.jsx              — Router + protected routes
  main.jsx             — Entry point

scripts/
  generateQR.js        — Node.js script to generate QR code PNGs

supabase/
  schema.sql           — Full database schema + RLS policies + sample data
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd Onerios-Quests
npm install
```

### 2. Configure Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
3. Copy your **Project URL** and **anon public key** from *Project Settings → API*.

### 3. Set Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_URL=http://localhost:5173
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Generating QR Codes

```bash
npm run generate-qr
```

This runs `scripts/generateQR.js` and saves `.png` files to `./qr-output/` along with a `tokens.json` manifest.

Edit the `PREDEFINED_TOKENS` array in the script to use specific tokens, or set `COUNT` to auto-generate UUIDs.

After generating, insert the tokens into your Supabase `qr_codes` table and link each to a `question_id`.

---

## Database Schema

| Table        | Purpose                                    |
|--------------|--------------------------------------------|
| `questions`  | MCQ questions with 4 options + correct key |
| `qr_codes`   | Maps each physical QR token → question     |
| `scans`      | Records every scan (prevents duplicates)   |
| `scoreboard` | Stores cumulative score per user           |

Row Level Security is enabled on all tables. Users can only read/write their own scan and score data.

---

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, or any static host. Update `VITE_APP_URL` to your production URL before generating final QR codes.

---

## License

MIT
