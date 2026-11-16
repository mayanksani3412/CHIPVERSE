# CHIPVERSE

CHIPVERSE is a responsive VLSI engineering adventure game built with React, TypeScript, Vite, Three.js, and React Three Fiber. It uses Supabase Auth and PostgreSQL for player accounts and cloud profiles. Authentication requires project configuration; the app does not simulate sign-in when credentials are absent.

## Project folder structure

```text
CHIPVERSE/
├─ backend/
│  └─ server.js
├─ supabase/
│  ├─ config.toml
│  ├─ functions/
│  │  └─ delete-account/
│  └─ migrations/
├─ public/
├─ src/
│  ├─ auth/
│  │  ├─ AccountScreen.tsx
│  │  ├─ AuthContext.ts
│  │  ├─ AuthProvider.tsx
│  │  ├─ profileSync.ts
│  │  └─ supabase.ts
│  ├─ App.css
│  ├─ App.tsx
│  ├─ gameData.ts
│  ├─ gameLogic.ts
│  ├─ gameLogic.test.ts
│  ├─ game/
│  ├─ index.css
│  ├─ main.tsx
│  ├─ store.ts
│  └─ assets/
├─ .gitignore
├─ .env.example
├─ .oxlintrc.json
├─ index.html
├─ package.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ README.md
└─ package-lock.json
```

## Implemented features

- Cinematic landing page and intro-style hero section
- Supabase-backed email/password, Google OAuth, and phone OTP account flows
- Password recovery, secure sign-out, and account deletion through a verified Edge Function
- Permanent server-generated `CV-MK-######` Player ID, with ID generation protected by a PostgreSQL sequence and profile update permissions
- Owner-only cloud profile/progress reads and writes enforced by PostgreSQL row-level security
- Optional consent-based import of saved local progress when creating an account
- Player dashboard with cloud-synced XP, rank, level, and progress panels
- Interactive Three.js universe map with eight distinct selectable planets, orbit, zoom, and world previews
- Playable third-person Logic Land world with procedural engineer, bounded WASD/arrow movement, jumping, and camera drag
- Touch movement joystick and touch camera pad for mobile
- Five Logic Land checkpoints with live Boolean gate evaluation, inputs, truth tables, scoring, and one-time XP rewards
- Clickable mission checkpoints, binary switches, and persistent energy-crystal collectibles
- Mission briefings, completion results, pause/resume, and locally saved progress
- Other seven planets are clearly labeled interactive previews, not playable worlds yet
- Logic gate simulator lab
- Circuit builder, Verilog arena, waveform viewer, FPGA lab, and physical design lab panels
- Responsive layout for desktop and mobile screens
- Local persistence via Zustand + localStorage as an offline cache
- Small read-only Express health/worlds service; account and profile data use Supabase
- Unit tests for progression, logic behavior, and consented local-progress merging

## Universe worlds

The map contains all eight worlds: Logic Land, Circuit City, RTL Kingdom, Verification Zone, FPGA Planet, Silicon Factory, Physical Design World, and ChipVerse Core. **Logic Land is the only playable 3D world in this release.** The other planets can be selected and inspected but are marked preview-only.

## Playable Logic Land missions

1. Binary Gate Challenge — AND
2. Logic Gate Builder — OR
3. Truth Table Explorer — XOR
4. Boolean Formula Puzzle — NAND
5. De Morgan Boss Battle — NOR

Each checkpoint asks the player to identify the correct gate, toggle inputs, observe its live output and truth table, and submit the circuit. First-time completion awards XP; replays do not award the same mission XP again. Collected crystals are saved as well.

## Controls

- Universe: drag to orbit, scroll/pinch to zoom, click/tap a planet or use the world strip to select it
- Desktop world controls: WASD or arrow keys to move, Space to jump, drag the scene to look, E or the prompt to interact, Escape to pause/close
- Mobile world controls: drag the left virtual joystick to move, drag the right look pad to rotate the camera, and tap checkpoints/objects to interact
- Game flow: use the top navigation for Intro, Profile, Dashboard, Universe, Labs, and Settings

## Mobile gameplay instructions

- Open the app in a mobile browser or responsive viewport.
- Tap a planet or world selector in Universe; Logic Land is the playable world.
- Tap **Land in Logic Land**, use the left joystick to approach a glowing checkpoint, and tap **Interact**.
- In the challenge, choose a gate and inspect the live output/truth table; submit to complete the mission.
- Tap the purple energy crystals to collect saved bonus XP.
- Use the Labs tab to run mini interactive logic and design exercises.
- Progress is saved locally and restored when the app reloads.

## Backend and database instructions

### Supabase setup (required for account features)

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project API settings. These are public client configuration values; **never put a service-role key in the Vite environment or frontend code**.
3. Apply [`supabase/migrations/20261116000100_secure_player_profiles.sql`](./supabase/migrations/20261116000100_secure_player_profiles.sql) in the Supabase SQL Editor or with the Supabase CLI. It creates the profile table, own-row RLS policies, a database auth trigger, and a sequence-backed immutable Player ID. It also creates profiles for existing Auth users.
4. In Supabase Auth, enable Email, Google, and Phone providers as needed. Configure email verification and password recovery templates, the SMS provider, the Site URL (`http://localhost:5173` for local development), and redirect allow-list entries such as `http://localhost:5173/account/**` plus your deployed origin. Configure Google OAuth client credentials in Supabase and use the Supabase callback URL shown by its dashboard in Google Cloud; configure SMS credentials only in the Supabase dashboard.
5. Deploy account deletion with `supabase functions deploy delete-account` after linking the CLI to the project. The function verifies the caller's access token and deletes only that authenticated user's Supabase Auth record; the profile cascades with it. The service-role key remains in Supabase's function environment, never in the frontend.
6. Restart Vite after changing `.env.local`. The provider URL and publishable/anon key are public client values; keep OAuth client secrets, SMTP/SMS credentials, and the Supabase service-role key in the provider/dashboard or server-side function environment only.

Without these project settings, the app displays a setup notice and blocks protected game routes rather than offering fake authentication.

### Optional read-only Express service

`backend/server.js` provides only `GET /api/health` and `GET /api/worlds`. The unauthenticated SQLite profile and mission write endpoints have been removed; cloud identity and profiles are managed by Supabase.

Run it with `npm run backend` if those read-only endpoints are needed.

The Phase 1 cloud profile supports cross-device identity and progress persistence. XP/progress updates are still client-synchronized; authoritative anti-cheat validation of mission rewards is not part of this phase.

## Run locally

Use these exact commands from the project root:

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/
```

To start the backend server in a separate terminal:

```bash
npm run backend
```

## Production build

```bash
npm run build
```

Then preview the production build:

```bash
npm run preview
```

## Phase 1 authentication configuration and validation

Validation commands:

```bash
npm test
npm run lint
npm run build
```

Latest results:

- TypeScript and the Vite production build pass; Oxlint passes.
- All 11 Boolean, mission, progression, scoring, movement-control, and local-progress import tests pass.
- The Express smoke test returned HTTP 200 for health/worlds and HTTP 404 for the removed unauthenticated profile write.
- Browser inspection confirmed the no-credentials screen and that protected dashboard navigation returns to account setup.
- Live signup, OAuth, SMS, cloud profile, and account deletion cannot be verified until a Supabase project and provider credentials are configured.
- The currently running local Vite server does not have Supabase credentials loaded; restart it after creating `.env.local`.

## Known limitations

- The app is an educational game prototype, not a full industry-grade EDA or multiplayer platform.
- Supabase auth/database features are integration-ready but not production-ready until providers, project URLs, and email/SMS settings are configured and tested.
- A production deployment still needs published privacy/terms pages and associated user-data policy review.
- XP and progress columns are owner-writable to support the existing game loop; server-authoritative reward validation is still required before trusting competitive rankings.
- HDL compilation is intentionally marked as educational-only because no external compiler is installed.
- Only Logic Land has playable 3D exploration and missions; the other seven worlds are previews.
- The 3D scenes use procedural low-poly geometry and simplified boundaries rather than a full physics engine or external character assets.

## Next recommended improvements

- Add server-side validation for mission completion and XP changes.
- Implement the remaining seven playable 3D worlds and their mission systems.
- Add richer collision/physics and additional Boolean circuit-building objectives.
- Add sound assets and polished audio manager.
- Add stronger backend sync and leaderboard features.
- Integrate real HDL compilers in an isolated sandbox environment.

## License

Educational project prototype for CHIPVERSE. Not affiliated with any proprietary semiconductor company or copyrighted game franchise.
