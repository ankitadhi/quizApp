# 🎯 QuizMaster

A full-stack quiz application built with **React + TypeScript** (frontend) and **Django** (backend). Users can register, take timed quizzes across multiple categories, and compete on a global leaderboard.

---

## 🖥️ Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- React Router v7
- Zustand (state management)
- Axios (HTTP client)
- js-cookie (JWT token storage)

**Backend**
- Django + Django REST Framework
- JWT Authentication (SimpleJWT)
- SQLite (development) / PostgreSQL (production)

---

## ✨ Features

- 🔐 JWT-based authentication (register, login, logout with token blacklisting)
- 📚 Browse quizzes by category and difficulty (easy / medium / hard)
- ⏱️ Timed quiz taking with auto-submit on expiry
- 📝 MCQ, True/False, and Multi-select question types
- 📊 Detailed results with per-question review and explanations
- 🏆 Global leaderboard ranked by total score
- 🔒 Protected routes — unauthenticated users are redirected to login

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip

---

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/quizmaster.git
cd quizmaster/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

### Backend Setup

```bash
cd quizmaster/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Linux / macOS
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

```bash
# Run migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api`.

---

## 📁 Project Structure

```
quizmaster/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts          # Axios instance + interceptors
│   │   │   └── endpoints.ts       # API functions + TypeScript interfaces
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── QuizList.tsx
│   │   │   ├── QuizDetail.tsx
│   │   │   ├── QuizTake.tsx
│   │   │   ├── QuizResults.tsx
│   │   │   └── Leaderboard.tsx
│   │   ├── store/
│   │   │   └── authStore.ts       # Zustand auth state
│   │   └── styles/                # Per-page CSS files
│   ├── .env.example
│   └── package.json
│
└── backend/
    ├── manage.py
    ├── requirements.txt
    └── ...
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Create a new account |
| POST | `/api/login/` | Login and receive JWT tokens |
| POST | `/api/logout/` | Blacklist refresh token |
| POST | `/api/token/refresh/` | Refresh access token |
| GET | `/api/me/` | Get current user profile |
| PATCH | `/api/me/` | Update user profile |
| GET | `/api/categories/` | List all categories |
| GET | `/api/quizzes/` | List quizzes (filter by category, difficulty, search) |
| GET | `/api/quizzes/:id/` | Get quiz detail with questions |
| POST | `/api/quizzes/:id/submit/` | Submit quiz answers |
| GET | `/api/attempts/` | Get user's attempt history |
| GET | `/api/attempts/:id/` | Get attempt detail and results |
| GET | `/api/leaderboard/` | Get global leaderboard |

---

## 🔧 Available Scripts

**Frontend**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

**Backend**

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start development server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py makemigrations` | Create new migrations |
| `python manage.py createsuperuser` | Create admin user |

---

## 🌐 Environment Variables

**Frontend (`.env.local`)**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

**Backend (`.env`)**

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode (`True` / `False`) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `DATABASE_URL` | Database connection string |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
