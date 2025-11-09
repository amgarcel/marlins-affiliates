# Marlins Affiliates — Schedule Glance (2025)

A single‑page app to quickly glance the Miami Marlins and all affiliates’ schedule/results for any date in the 2025 season.

## Prerequisites
- Node.js 18+ (20 recommended)
- npm 9+ (or pnpm/yarn)

## Run locally
```bash
npm install
npm run dev
```
Then open `http://localhost:5173/`.

## Build
```bash
npm run build
npm run preview
```

## Features
- Date view (defaults to today) with Previous/Today/Next controls.
- One tile per affiliate: team name and level (MLB, AAA, AA, High‑A, A, Rookie, DSL).
- If no game: “NO GAME”.
- If there is a game:
  - Preview: local time, venue, probable pitchers.
  - Final: final score, winning/losing pitchers, save (if applicable).
  - Live (stretch): inning/half, outs, balls/strikes, live score, runners on 1B/2B/3B, current pitcher and batter.
- “Refresh” button for manual updates.

## Technical notes
- Data: `statsapi.mlb.com` (`/schedule`, `/game/{gamePk}/linescore`, `/game/{gamePk}/live`).
- Caching: React Query with manual refresh; game lines can be refreshed periodically when live.
- Shared types in `src/features/schedule/types/`.

## Assumptions
- Level mapping uses official `sportId` values (1=MLB, 11=AAA, 12=AA, 13=High‑A, 14=A, 16=Rookie, 21=DSL).
- For Live state, runners/batter/pitcher come from `liveData.linescore.offense`.

## How to review
1. Change the date and verify tiles with/without games.
2. In Preview state, verify time/venue and probables if available.
3. In Final state, verify score and decisions (W/L/S).
4. In Live state (when available), verify runners and pitcher/batter names.
