# 💪 GymXP

A production-ready gamified fitness mobile application built with React Native (Expo) + .NET 8 Web API.

---

## 🗂 Project Structure

```
GymXP/
├── backend/                        # .NET 8 Web API (Clean Architecture)
│   ├── GymXP.Domain/               # Entities, Enums, Base classes
│   ├── GymXP.Infrastructure/       # EF Core DbContext, Repositories
│   ├── GymXP.Application/          # Interfaces, Services, DTOs
│   ├── GymXP.Workflows/            # Temporal Workflows & Activities
│   ├── GymXP.API/                  # Controllers, Middleware, Program.cs
│   └── Dockerfile
├── frontend/                       # React Native (Expo) App
│   ├── app/
│   │   ├── onboarding.tsx          # Login / Register screen
│   │   └── (tabs)/
│   │       ├── index.tsx           # Dashboard
│   │       ├── workout.tsx         # Today's Workout
│   │       ├── progress.tsx        # XP & Streak history
│   │       ├── leaderboard.tsx     # Weekly rankings
│   │       └── profile.tsx         # User profile
│   ├── components/
│   │   ├── XPProgressBar.tsx
│   │   ├── WorkoutCard.tsx
│   │   ├── StreakTracker.tsx
│   │   └── LeaderboardCard.tsx
│   ├── store/useStore.ts           # Zustand state management
│   ├── services/api.ts             # Axios API client
│   ├── types/index.ts              # TypeScript types
│   └── constants/index.ts         # Colors, levels, labels
└── docker-compose.yml
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo), TypeScript, NativeWind |
| State | Zustand |
| Backend | .NET 8 Web API (Clean Architecture) |
| Workflow | Temporal |
| Database | PostgreSQL |
| ORM | Entity Framework Core |
| Auth | JWT Bearer |
| AI | OpenAI (gpt-4o-mini) with fallback |
| DevOps | Docker, docker-compose |

---

## 🛠 Local Development

### Prerequisites
- Docker + Docker Compose
- .NET 8 SDK (for backend dev)
- Node.js 20+ (for frontend dev)
- Expo CLI: `npm install -g expo`

---

### 1. Start infrastructure with Docker

```bash
# (Optional) Set your OpenAI key for AI-generated workouts
export OPENAI_API_KEY=your_key_here

docker-compose up -d
```

Services started:
- **PostgreSQL** → `localhost:5432`
- **Temporal** → `localhost:7233`
- **Temporal UI** → http://localhost:8080
- **GymXP API** → http://localhost:5000

---

### 2. Run the backend locally (without Docker)

```bash
cd backend
dotnet run --project GymXP.API
```

> API docs at: http://localhost:5000/swagger

---

### 3. Run the frontend

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with the Expo Go app, or press `a` for Android / `i` for iOS.

> **Note:** Update `API_BASE_URL` in `app.json` to point to your API server.

---

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/user-profile` | ✅ | Get profile |
| PUT | `/api/user-profile` | ✅ | Update profile |
| GET | `/api/workouts/today` | ✅ | Today's workout |
| POST | `/api/workouts/generate` | ✅ | AI generate workout |
| POST | `/api/workouts/{id}/complete` | ✅ | Complete workout |
| GET | `/api/workouts/history` | ✅ | Workout history |
| GET | `/api/xp` | ✅ | XP summary |
| GET | `/api/streaks` | ✅ | Streak info |
| GET | `/api/leaderboard` | ✅ | Top users |
| GET | `/api/leaderboard/me` | ✅ | My rank |

---

## 🤖 AI Integration

- `GenerateWorkoutPlanAsync()` — creates a personalized workout based on user profile
- `GenerateMotivationMessageAsync()` — generates a motivational message

If `OpenAI:ApiKey` is not set, the service gracefully falls back to built-in workout templates.

---

## ⚙️ Temporal Workflows

| Workflow | Trigger | Description |
|---|---|---|
| `DailyWorkoutGeneratorWorkflow` | Scheduled/On-demand | Generates a daily AI workout |
| `XPUpdateWorkflow` | Post-workout | Awards XP to user |
| `StreakTrackingWorkflow` | Post-workout | Updates daily streak |

---

## 🎮 Gamification

- **XP System**: Earn XP by completing workouts (50–200 XP per session)
- **Levels**: Every 500 XP = 1 level (Newcomer → GymXP God)
- **Streaks**: Consecutive daily activity tracked with 🔥 flame indicator
- **Leaderboard**: Real-time ranking by total XP
- **Motivation**: AI-generated personalized messages

---

## 🏗 Architecture

```
API Controller
     ↓
Application Service (Interface → Implementation)
     ↓
Repository (Generic IRepository<T>)
     ↓
EF Core DbContext
     ↓
PostgreSQL
```