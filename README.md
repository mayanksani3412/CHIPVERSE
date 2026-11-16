# 🚀 CHIPVERSE — Explore. Learn. Play. Level Up.

<img width="1983" height="793" alt="image" src="https://github.com/user-attachments/assets/0437e85b-862f-449b-aa02-e4590019eebe" />


<p align="center">
  <img src="https://img.shields.io/badge/Project-CHIPVERSE-blueviolet" alt="Project">
  <img src="https://img.shields.io/badge/Domain-VLSI-blue" alt="VLSI">
  <img src="https://img.shields.io/badge/Frontend-React-blue" alt="React">
  <img src="https://img.shields.io/badge/Build-Vite-purple" alt="Vite">
  <img src="https://img.shields.io/badge/Backend-Supabase-green" alt="Supabase">
  <img src="https://img.shields.io/badge/Authentication-Google%20OAuth-orange" alt="Google OAuth">
  <img src="https://img.shields.io/badge/Developer-Mayank%20Saini-black" alt="Developer">
</p>


## 🌌 About CHIPVERSE

**CHIPVERSE** is an interactive web-based gaming project designed to provide an engaging digital experience through exploration, missions, achievements, and player progression.

Players can create their own accounts, enter the CHIPVERSE universe, explore different sections, track their progress, earn experience points (XP), and manage their personal player profiles.

The project combines an interactive frontend with backend services to provide authentication and persistent player data. Player progress and settings can be saved so that users can continue their journey even after refreshing the website or logging in again.

CHIPVERSE aims to make the gaming experience more engaging through a structured player progression system and an interactive user interface.

## 🎮 How to Play CHIPVERSE

Getting started with CHIPVERSE is simple.

### Step 1: Open the Game

Visit the live CHIPVERSE website:

**Live Game:** http://localhost:5175/

If you are running the project locally, follow the installation instructions in the Development Setup section.

### Step 2: Create Your Account

- Open the CHIPVERSE website.
- Navigate to the account or login page.
- Choose **Create Account**.
- Enter your required details.
- Accept the account data notice.
- Complete the registration process.

You can also use **Continue with Google** if Google authentication is enabled.

### Step 3: Sign In

If you already have an account:

- Open the Sign In section.
- Enter your registered email or use Google Login.
- Complete the authentication process.
- Access your player account.

### Step 4: Enter the Dashboard

After successful login, you can access your CHIPVERSE dashboard.

The dashboard acts as your main gaming area, where you can view your player information and navigate through the available sections.

### Step 5: Explore the Universe

Visit the **Universe** section to explore the available game universe and its worlds.

Explore the available content and check which worlds or areas are unlocked for your player.

### Step 6: Explore Labs and Missions

Visit the **Labs** section to explore its available interactive content and activities.

Complete the missions and activities provided in the game to make progress.

### Step 7: Earn XP and Track Your Progress

As you progress through the game, your player profile can track information such as:

- Experience Points (XP)
- Completed Missions
- Unlocked Worlds
- Achievements
- Collectibles

Your progress is associated with your account and can persist between sessions.

### Step 8: Customize Your Settings

Open the Settings section to manage the available player preferences.

Your saved settings can remain available when you return to the game.

**Start exploring, complete missions, and level up your CHIPVERSE journey!**

## ✨ Key Features

### 🔐 User Authentication

- Create a new player account.
- Sign in using email authentication.
- Google Sign-In integration.
- Secure account-based access.
- Logout functionality.

### 👤 Player Profile

- Individual player profile.
- Player information and avatar.
- Player progression tracking.
- Saved game-related information.
- Persistent player data.

### 🌍 Universe

- Explore the CHIPVERSE universe.
- View available worlds.
- Track unlocked worlds.
- Experience an interactive gaming environment.

### 🧪 Labs

- Dedicated Labs section.
- Explore the available activities and interactive content.
- Access the Labs area through the game dashboard.

### ⭐ XP and Progression System

- Track player experience points.
- Maintain completed mission records.
- Monitor player progression.
- Track achievements and collectibles.

### 🏆 Achievements and Collectibles

- Maintain achievement records.
- Track collected items.
- View player accomplishments.

### ⚙️ Settings

- Manage available player settings.
- Save preferences.
- Retain settings across sessions.

### ☁️ Cloud Data Persistence

- Supabase backend integration.
- Account-based player data.
- Persistent profile information.
- Saved game progress and settings.

## 🖼️ Game Screenshots

Here are some screenshots of the CHIPVERSE gaming experience.

### 1. Account Creation and Login

<img width="1906" height="941" alt="image" src="https://github.com/user-attachments/assets/e909349f-5381-4116-a19d-12c88b3dea87" />


### 2. Player Dashboard

<img width="1220" height="888" alt="image" src="https://github.com/user-attachments/assets/1f143059-b6b3-4a24-82fc-e8797e07caca" />


### 3. Universe

<img width="1919" height="945" alt="image" src="https://github.com/user-attachments/assets/a6545567-2187-4f1c-ad42-842b16b8b695" />


### 4. Labs

<img width="1215" height="532" alt="image" src="https://github.com/user-attachments/assets/483a9283-2483-492a-82f5-5e1b00ae9924" />


### 5. Player Profile

<img width="1919" height="820" alt="image" src="https://github.com/user-attachments/assets/e89277ae-b1cb-4142-85b0-88e2e68627e2" />


### 6. Settings

<img width="1113" height="235" alt="image" src="https://github.com/user-attachments/assets/9b43c0d9-6779-4a80-ad98-4384e59ca054" />

## 🛠️ Technology Stack

| Technology              | Purpose                             |
| ----------------------- | ----------------------------------- |
| React                   | Frontend user interface             |
| Vite                    | Development server and build tool   |
| JavaScript / TypeScript | Application development             |
| Supabase                | Backend services and database       |
| Supabase Authentication | User authentication                 |
| Google OAuth            | Google Sign-In                      |
| CSS                     | Interface styling                   |
| Git and GitHub          | Version control and project hosting |

*The exact technologies used in individual modules may vary according to the project implementation.*

## 🏗️ Project Architecture

CHIPVERSE uses a frontend and backend architecture.

```text
                 CHIPVERSE
                     |
          -----------------------
          |                     |
      Frontend              Backend
          |                     |
      React + Vite           Supabase
          |                     |
   ----------------       -------------
   |      |       |       |           |
Dashboard Universe Labs Authentication
                              |
                         Player Profiles
                              |
                         Game Progress
```

## 📂 Project Structure

A simplified overview of the project structure:

```text
CHIPVERSE/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── context/
│   ├── App.jsx
│   └── main.jsx
│
├── docs/
│   └── screenshots/
│       ├── chipverse-banner.png
│       ├── login.png
│       ├── dashboard.png
│       ├── universe.png
│       ├── labs.png
│       ├── profile.png
│       └── settings.png
│
├── supabase/
│   └── migrations/
│
├── package.json
├── README.md
└── vite.config.js
```

*This is an illustrative structure. Your actual folders and filenames may differ.*

## 💻 Development Setup

Want to run CHIPVERSE on your own computer? Follow these steps.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- A code editor such as Visual Studio Code
- A Supabase project with the required database and authentication configuration

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/mayanksani3412/CHIPVERSE
```

### 2. Navigate to the Project Folder

```bash
cd CHIPVERSE
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add the Supabase configuration required by your application.

For example, if your code uses these variable names:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Use the exact environment variable names expected by your source code.

**Important:** Never upload your Supabase service role key, private credentials, or Google OAuth client secret to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Open CHIPVERSE

Open the local URL displayed in your terminal. 

```text
http://localhost:5175/
```

Your Vite server may select a different available port.

## 🔑 Supabase Configuration

CHIPVERSE uses Supabase for backend services.

To configure your own instance:

1. Create a Supabase project.
2. Configure the required database tables.
3. Apply the database migration files included in the repository.
4. Enable the authentication providers used by the application.
5. Configure the required Google OAuth credentials if you want Google Sign-In.
6. Add the correct environment variables to your local `.env` file.
7. Configure the authentication redirect URLs for your local or deployed website.

Make sure the database schema and authentication configuration match the application code.

## 🔒 Security

- Authentication is handled through Supabase.
- Player data is associated with authenticated accounts.
- Database access should be protected using Row Level Security (RLS).
- Users should only be allowed to access or modify their own player data.
- Private API keys and service role credentials must never be exposed in frontend code or public repositories.
- Environment variables should be configured securely.

## 🚀 Deployment

CHIPVERSE can be deployed using a hosting platform such as Vercel.

General deployment steps:

1. Push the project to GitHub.
2. Import the GitHub repository into Vercel.
3. Configure the required environment variables.
4. Build the project using the configured Vite build command.
5. Deploy the application.
6. Update the Supabase Site URL and Redirect URLs.
7. Update the Google OAuth authorized origins and redirect configuration.
8. Test registration, login, logout, and player data persistence on the live website.

**Live Demo:** http://localhost:5175/

## 🧪 Testing Checklist

The following application flows have been tested during development:

- [x] Google Login and Logout
- [x] Email Account Creation and Login
- [x] Player Profile Persistence
- [x] XP and Player Progress Persistence
- [x] Dashboard Navigation
- [x] Universe Page
- [x] Labs Page
- [x] Settings Persistence

## 🎯 Project Goals

The main goals of CHIPVERSE are:

- To create an interactive web-based gaming experience.
- To provide account-based player progression.
- To make exploration and missions engaging.
- To maintain player data using backend services.
- To provide a structured and expandable gaming environment.
- To build a foundation for future game features and improvements.

## 🔮 Future Enhancements

Possible future improvements include:

- More interactive worlds.
- Additional missions and challenges.
- New achievements and collectibles.
- Advanced player progression and level systems.
- Leaderboards and player rankings.
- Multiplayer features.
- More game activities and interactive Labs.
- Improved animations and visual effects.
- Mobile-responsive improvements.
- Additional customization options.

## 🤝 Contributing

Contributions and suggestions are welcome.

If you want to contribute:

1. Fork this repository.
2. Create a new feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a Pull Request with a description of your contribution.

## 👨‍💻 Developer

**Project Name:** CHIPVERSE

**Project Type:** Interactive Web-Based Gaming Project

**Frontend:** React + Vite

**Backend:** Supabase

**Repository:** https://github.com/mayanksani3412/CHIPVERSE

**Live Website:** http://localhost:5175/

\<p align="center">
&#x20; \<strong>🚀 Welcome to CHIPVERSE!\</strong>\<br>
&#x20; Explore New Worlds. Complete Missions. Earn XP. Level Up.
\</p>
