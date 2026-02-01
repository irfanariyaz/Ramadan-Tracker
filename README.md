# 🌙 Ramadan Daily Tracker

A beautiful full-stack family-oriented Ramadan tracking application built with FastAPI and Next.js. Track prayers, fasting, Quran progress, and daily goals while staying motivated together as a family.

![Ramadan Tracker](https://img.shields.io/badge/Ramadan-Tracker-gold?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square)

## ✨ Features

### 🎯 Core Features
- **Family Management**: Create families and add multiple family members
- **Daily Tracking**: Track fasting status, prayers (5 daily + Taraweeh), Quran progress, and daily goals
- **Family Dashboard**: View everyone's progress in one place to stay motivated together
- **Prayer Times**: Automatic prayer times based on location using Aladhan.com API
- **Iftar Countdown**: Live countdown timer to Maghrib (Iftar time)
- **Photo Profiles**: Upload photos for each family member
- **Auto-Save**: All progress is automatically saved as you track

### 🎨 Beautiful UI
- **Ramadan Theme**: Deep blues, golds, and purples with moon and star decorations
- **Circular Progress Bars**: Rewarding visual feedback for Quran progress
- **Smooth Animations**: Fade-ins, slide-ups, and glow effects
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Real-time Updates**: Family dashboard refreshes automatically

## 🏗️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Lightweight database (perfect for family use)
- **Pydantic**: Data validation
- **httpx**: Async HTTP client for prayer times API
- **Pillow**: Image processing for photo uploads

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Data fetching and caching
- **Lucide React**: Beautiful icons

## 📁 Project Structure

```
ramadan-tracker/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── crud.py                 # Database operations
│   ├── database.py             # Database configuration
│   ├── prayer_times.py         # Prayer times API integration
│   ├── file_upload.py          # Photo upload handler
│   ├── requirements.txt        # Python dependencies
│   └── static/photos/          # Uploaded photos
│
└── frontend/
    ├── app/
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Main tracker page
    │   ├── dashboard/
    │   │   └── page.tsx        # Family dashboard
    │   └── setup/
    │       └── page.tsx        # Family setup
    ├── components/
    │   ├── DailyChecklist.tsx  # Daily tracking component
    │   ├── CircularProgress.tsx # Progress bar
    │   ├── IftarCountdown.tsx  # Countdown timer
    │   ├── PrayerTimes.tsx     # Prayer times display
    │   └── PhotoUpload.tsx     # Photo upload
    ├── lib/
    │   └── api.ts              # API client
    ├── types/
    │   └── index.ts            # TypeScript types
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**:
   ```bash
   python main.py
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Backend will be running at**: `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   ```
   
   The `.env.local` file should contain:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Frontend will be running at**: `http://localhost:3000`

## 📖 Usage Guide

### First Time Setup

1. **Start both servers** (backend and frontend)

2. **Open the app** at `http://localhost:3000`

3. **Create a family**:
   - Click "Create Family"
   - Enter your family name
   - Optionally add your city and country for accurate prayer times
   - Click "Create Family"

4. **Add family members**:
   - Add each person's name
   - Upload a photo for each member (optional)
   - Click "Finish Setup"

### Daily Tracking

1. **Select your family** from the dropdown

2. **Select your name** from the member dropdown

3. **Track your day**:
   - Set your fasting status
   - Check off prayers as you complete them
   - Update your Quran progress (Juz or Pages)
   - Write your daily goal

4. **View family progress**:
   - Click "View Family Dashboard"
   - See everyone's progress for the day
   - Stay motivated together!

### Prayer Times & Countdown

- **Prayer times** are displayed on the left sidebar
- **Iftar countdown** shows time remaining until Maghrib
- **Suhoor time** (Fajr) is shown for the next day

## 🔌 API Endpoints

### Family Endpoints
- `POST /api/families` - Create a new family
- `GET /api/families` - Get all families
- `GET /api/families/{family_id}` - Get specific family

### Member Endpoints
- `POST /api/members` - Create a family member
- `GET /api/families/{family_id}/members` - Get family members
- `GET /api/members/{member_id}` - Get specific member
- `POST /api/members/{member_id}/photo` - Upload member photo

### Daily Entry Endpoints
- `GET /api/daily-stats/{member_id}` - Get daily stats
- `POST /api/update-entry` - Update daily entry

### Progress & Prayer Times
- `GET /api/family-progress/{family_id}` - Get family progress
- `GET /api/prayer-times` - Get prayer times

## 🎨 Customization

### Changing Colors
Edit `frontend/tailwind.config.ts` to customize the Ramadan theme colors:

```typescript
colors: {
  ramadan: {
    dark: "#0a0e27",      // Background
    gold: "#d4af37",      // Accent color
    teal: "#1dd3b0",      // Success color
    // ... add your colors
  },
}
```

### Adding More Features
- Edit backend models in `backend/models.py`
- Add new API endpoints in `backend/main.py`
- Create new React components in `frontend/components/`

## 🐛 Troubleshooting

### Backend Issues

**Database errors**:
```bash
# Delete the database and restart
rm ramadan_tracker.db
python main.py
```

**Port already in use**:
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

### Frontend Issues

**API connection errors**:
- Ensure backend is running on port 8000
- Check `.env.local` has correct API URL
- Verify CORS settings in `backend/main.py`

**Build errors**:
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 📝 Database Schema

### Family
- `id`: Primary key
- `name`: Family name
- `location_city`, `location_country`: For prayer times
- `latitude`, `longitude`: Alternative location method

### FamilyMember
- `id`: Primary key
- `family_id`: Foreign key to Family
- `name`: Member name
- `photo_path`: Path to uploaded photo

### DailyEntry
- `id`: Primary key
- `member_id`: Foreign key to FamilyMember
- `date`: Entry date
- `fasting_status`: "fasting", "not_fasting", "excused"
- `fajr`, `dhuhr`, `asr`, `maghrib`, `isha`, `taraweeh`: Prayer completion
- `quran_juz`, `quran_page`: Quran progress
- `daily_goal`: Text goal for the day

## 🌟 Tips for Best Experience

1. **Set your location** when creating a family for accurate prayer times
2. **Upload photos** for each family member to make the dashboard more personal
3. **Check the family dashboard** regularly to stay motivated together
4. **Use the Iftar countdown** to know exactly when to break your fast
5. **Set daily goals** to track your spiritual growth beyond just numbers

## 🤝 Contributing

This is a family-oriented project. Feel free to:
- Add new features
- Improve the UI/UX
- Fix bugs
- Add translations
- Share with your community

## 📄 License

This project is open source and available for personal and community use.

## 🙏 Acknowledgments

- Prayer times provided by [Aladhan.com](https://aladhan.com/)
- Icons by [Lucide](https://lucide.dev/)
- Built with love for the Muslim community

---

**May Allah accept your worship this Ramadan! 🌙**

*Ramadan Mubarak to you and your family!*
