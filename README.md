# 🏥 Hospital Scheduler

> **Full-Stack Interactive Prototype with Backend API**
>
> A responsive, interactive healthcare scheduling system with Node.js/Express backend, REST API endpoints, and real Google Maps integration. Perfect for demonstrations, portfolio showcase, and understanding full-stack development.

![Stack](https://img.shields.io/badge/Stack-Full%20Stack-blue) ![Backend](https://img.shields.io/badge/Backend-Express.js-green) ![Status](https://img.shields.io/badge/Status-Prototype-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-orange)

---

## 📋 Table of Contents

- [What This Is](#what-this-is)
- [What's Included](#whats-included)
- [What's NOT Included](#whats-not-included)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Backend API](#backend-api)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Technologies](#technologies)
- [File Structure](#file-structure)
- [Demo Data](#demo-data)
- [Video Demo](#video-demo)
- [Perfect For](#perfect-for)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 What This Is

Hospital Scheduler is a **full-stack prototype** that demonstrates a complete healthcare scheduling system with:

### Frontend ✅
- Interactive UI with 4 dashboards
- Google Maps API integration
- Responsive design

### Backend ✅
- Node.js/Express server
- REST API with 20+ endpoints
- Booking management system
- Availability management system
- In-memory data storage

### Purpose
- 🎬 Presentations and pitches
- 🎨 Portfolio showcase
- 👥 Client demonstrations
- 📚 Learning full-stack development
- 🎓 Understanding system architecture

---

## ✅ What's Included

### Frontend Features ✅
- **4 Complete Dashboards**
  - Coordinator Dashboard (schedule & capacity)
  - Professional Dashboard (personal schedule & navigation)
  - Patient Dashboard (appointment booking)
  - Supervisor Dashboard (workload monitoring)

- **Google Maps Integration** (REAL!)
  - Click any address to open Google Maps
  - Real location pins with exact coordinates
  - Actual Oulu city locations

- **Responsive Design**
  - Works on desktop, tablet, mobile
  - Touch-friendly interface
  - Professional styling

### Backend Features ✅
- **Express.js Server**
  - Runs on http://localhost:3000
  - CORS enabled
  - Body parser middleware
  - Static file serving

- **REST API Endpoints** (20+)
  - Coordinator API
  - Supervisor API
  - Professional API
  - Patient API
  - Availability management (full CRUD)
  - Booking management (full CRUD)
  - Scheduler endpoint
  - Export functionality

- **Data Management**
  - Mock staff data (5 professionals)
  - Mock patient data (5 patients with real Oulu coordinates)
  - Availability tracking
  - Booking tracking
  - Schedule generation

- **Functional Systems**
  - Complete booking workflow
  - Availability submission system
  - CSV export feature
  - Health check endpoint

---

## ❌ What's NOT Included

### Database
```
✗ No SQL database (PostgreSQL/MySQL)
✗ Data stored in-memory (JavaScript objects)
✗ Data lost when server restarts
✗ Perfect for demo, not for production
```

### AI & Algorithms
```
✗ No real AI scheduling algorithm
✗ No intelligent staff-patient matching
✗ Schedule generation is simulated
✗ Route optimization is basic
```

### Authentication & Security
```
✗ No user login system
✗ No password authentication
✗ No JWT tokens or sessions
✗ No role-based access control
✗ Everyone sees same demo data
```

### Advanced Features
```
✗ No real-time updates (WebSockets)
✗ No file uploads
✗ No email notifications
✗ No SMS notifications
✗ No data persistence across restarts
```

---

## 🏗️ Architecture

### Current Architecture (Full-Stack Prototype)

```
┌─────────────────────────────────────┐
│     Frontend (Client Layer)         │
│  • HTML5, CSS3, JavaScript          │
│  • 4 Interactive Dashboards         │
│  • Google Maps API                  │
│  • Responsive UI                    │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │   REST API      │
        │   20+ Endpoints │
        │   (Express.js)  │
        └────────┬────────┘
                 │
┌────────────────▼────────────────────┐
│  Backend (Node.js/Express)          │
│  • API routing                      │
│  • Business logic                   │
│  • Mock data generation             │
│  • Availability handling            │
│  • Booking management               │
│  • Schedule processing              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│     Data Layer (In-Memory)          │
│  • mockStaff (5 professionals)      │
│  • mockPatients (5 with real coords)│
│  • mockSchedule (generated)         │
│  • staffAvailability (object)       │
│  • bookings (object)                │
│  • Resets on server restart         │
└─────────────────────────────────────┘
```

### Production Architecture (Future)

To make this production-ready, add:

```
Frontend
   ↓
Backend (Node.js/Express)
   ↓
Database (PostgreSQL/MySQL)
   ↓
Real AI Engine
   ↓
Authentication Service
   ↓
Notification Service
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ (for backend)
- npm (package manager)
- Modern web browser
- Internet connection (for Google Maps)

### 2-Minute Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open in browser
http://localhost:3000

# 4. Choose dashboard and explore!
```

### What You'll See
- Server running message: "🏥 Hospital Scheduler Demo running on http://localhost:3000"
- Frontend loads automatically
- All 4 dashboards working
- API endpoints responding
- Google Maps integration working

---

## 📡 Backend API

### API Base URL
```
http://localhost:3000/api
```

### Available Endpoints

#### Coordinator
```
GET /api/coordinator
  → Returns staff, patients, schedule, capacity
```

#### Supervisor
```
GET /api/supervisor
  → Returns workload, schedule, team metrics
```

#### Professional
```
GET /api/professional/:staffId
  → Returns personal schedule and route
```

#### Patient
```
GET /api/patient/:patientId
  → Returns patient info and upcoming visits
```

#### Availability Management
```
POST /api/availability/submit
  → Submit availability (days, hours, coverage)

GET /api/availability/:staffId
  → Get staff availability submissions

GET /api/availability
  → Get all availability submissions

DELETE /api/availability/:staffId/:submissionId
  → Delete availability submission
```

#### Booking Management (Full CRUD)
```
POST /api/bookings/create
  → Create new appointment booking

GET /api/bookings
  → Get all bookings

GET /api/bookings/patient/:patientId
  → Get patient's bookings

GET /api/bookings/professional/:professionalId
  → Get professional's bookings

PUT /api/bookings/:bookingId
  → Update booking status

DELETE /api/bookings/:bookingId
  → Cancel booking

GET /api/professionals/:professionalId/availability/:date
  → Get available time slots for professional on date
```

#### Scheduler
```
POST /api/run-scheduler
  → Run schedule optimization (simulated AI)
```

#### Export
```
GET /api/export-schedule
  → Download schedule as CSV file
```

#### Health Check
```
GET /api/health
  → Check if server is running
```

---

## ▶️ Running the Application

### Development Mode

```bash
# With auto-restart on file changes (requires nodemon)
npm install -g nodemon
nodemon server.js

# Standard mode
node server.js
```

### Access Points
```
Frontend:       http://localhost:3000
API:            http://localhost:3000/api/*
Health Check:   http://localhost:3000/api/health
```

### Testing Endpoints

#### Using curl
```bash
# Get coordinator data
curl http://localhost:3000/api/coordinator

# Get supervisor data
curl http://localhost:3000/api/supervisor

# Get professional schedule
curl http://localhost:3000/api/professional/1

# Get patient info
curl http://localhost:3000/api/patient/101
```

#### Using Postman
1. Import collection (optional)
2. Create requests for each endpoint
3. Test GET, POST, PUT, DELETE operations

#### Using Browser
```
http://localhost:3000/api/coordinator
http://localhost:3000/api/supervisor
http://localhost:3000/api/professional/1
```

---

## 📊 API Endpoints Details

### 1. Availability Management

**Submit Availability**
```javascript
POST /api/availability/submit

Request:
{
  staffId: 1,
  staffName: "Dr. Pekka",
  days: ["Monday", "Tuesday", "Wednesday"],
  startTime: "09:00",
  endTime: "17:00",
  maxHours: 8,
  coverageAreas: ["Oulu", "Kempale"],
  notes: "Available for all care types"
}

Response:
{
  success: true,
  submission: {
    id: 1699000000000,
    staffId: 1,
    staffName: "Dr. Pekka",
    submittedAt: "10/30/2025, 14:23:45",
    ...
  }
}
```

### 2. Booking Management

**Create Booking**
```javascript
POST /api/bookings/create

Request:
{
  patientId: 101,
  patientName: "A. Marika",
  patientPhone: "+358-xxx-xxxx",
  patientEmail: "patient@example.com",
  professionalId: 1,
  professionalName: "Dr. Pekka",
  serviceType: "Palliative Care",
  bookingDate: "2025-11-05",
  bookingTime: "09:00",
  duration: "1 hour",
  location: "Oulu",
  notes: "Regular home visit",
  priority: "normal"
}

Response:
{
  success: true,
  booking: {
    id: 1,
    status: "pending",
    createdAt: "10/30/2025, 14:23:45",
    confirmedAt: null,
    completedAt: null,
    ...
  }
}
```

**Get Available Slots**
```javascript
GET /api/professionals/1/availability/2025-11-05

Response:
{
  date: "2025-11-05",
  availableSlots: ["09:00", "10:00", "11:00", "13:00", "14:00"],
  bookedCount: 3
}
```

### 3. Scheduler

**Run Scheduler**
```javascript
POST /api/run-scheduler

Response (after ~1.5 seconds):
{
  success: true,
  schedule: [
    {
      staffId: 1,
      staffName: "Dr. Pekka",
      patientId: 101,
      patientName: "A. Marika",
      careType: "Palliative",
      time: "09:00",
      location: "Oulu",
      address: "Isokatu 1",
      duration: 45,
      travelTime: 15,
      status: "Scheduled"
    },
    ...
  ],
  message: "Schedule optimized successfully"
}
```

---

## 🛠️ Technologies

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling & responsive design
- **JavaScript (ES6+)** - Interactivity & UI logic
- **Google Maps API** - Real map integration

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin requests
- **Body-parser** - JSON parsing

### Data Storage
- **In-Memory JavaScript Objects** - Temporary storage
- **Mock Data** - Simulated real data

### APIs Used
- **Google Maps JavaScript API** - Location services

---

## 📁 File Structure

```
hospital-scheduler/
│
├── index.html              ← Main frontend file
│
├── public/
│   ├── css/
│   │   └── styles.css      ← All styling
│   │
│   └── js/
│       ├── app.js          ← Frontend application
│       └── maps.js         ← Google Maps integration
│
├── server.js               ← Backend (Express.js)
│
├── package.json            ← Dependencies
├── README.md               ← Documentation
└── .gitignore
```

### File Descriptions

**server.js** - Backend server
- Express.js setup
- CORS and middleware
- 20+ API endpoints
- Mock data definition
- In-memory storage
- Scheduler logic

**index.html** - Frontend HTML
- 4 dashboard sections
- Navigation elements
- Forms for input
- Layout structure

**app.js** - Frontend JavaScript
- Dashboard switching
- Demo data (appState)
- Form handling
- UI state management

**styles.css** - Frontend Styling
- Responsive design
- Dashboard styles
- Form styling
- Mobile optimization

**maps.js** - Google Maps Integration
- Map initialization
- Pin placement
- Location handling

---

## 📊 Mock Data

### Staff (5 professionals)
```javascript
[
  { id: 1, name: 'Dr. Pekka', role: 'Doctor', expertise: ['Palliative', 'Infection'] },
  { id: 2, name: 'Dr. Teemu', role: 'Doctor', expertise: ['Acute', 'Geriatrics'] },
  { id: 3, name: 'Nurse Nuura', role: 'Nurse', expertise: ['Infection', 'Palliative'] },
  { id: 4, name: 'Nurse Anne', role: 'Nurse', expertise: ['Palliative', 'Geriatrics'] },
  { id: 5, name: 'Nurse Sanna', role: 'Nurse', expertise: ['Acute'] }
]
```

### Patients (5 with real Oulu coordinates)
```javascript
[
  { id: 101, name: 'A. Marika', location: 'Oulu', latitude: 65.01585, longitude: 25.47898 },
  { id: 102, name: 'T. Vikke', location: 'Oulu', latitude: 65.06318, longitude: 25.48467 },
  { id: 103, name: 'T. Mäki', location: 'Kiiminki', latitude: 65.21678, longitude: 25.32988 },
  { id: 104, name: 'Laouri', location: 'Kempale', latitude: 64.92385, longitude: 25.50677 },
  { id: 105, name: 'P. Laine', location: 'Oulu', latitude: 65.00808, longitude: 25.44903 }
]
```

### Locations
- Real Oulu city coordinates
- Actual Finnish place names
- Realistic healthcare scenarios

---

## 🎬 Video Demo

### 5-Minute Demo Available

Shows all features in action:
- Coordinator Dashboard
- Professional Dashboard with Google Maps
- Patient Dashboard & booking
- Supervisor Dashboard

---

## 🎯 Perfect For

### ✅ Presentations & Pitches
- Show working prototype
- Demonstrate concept
- Get stakeholder feedback

### ✅ Portfolio
- Show full-stack skills
- Demonstrate backend API knowledge
- Show frontend integration

### ✅ Learning
- Understand full-stack architecture
- Learn Express.js basics
- Learn frontend-backend integration
- Study API design

### ✅ Client Demos
- Show working functionality
- Demonstrate workflows
- Get design feedback

---

## 🚀 Roadmap - Future Development

### Phase 1: Database Integration (Essential)
- Add PostgreSQL/MySQL
- Migrate in-memory data to database
- Add persistence
- Estimated: 40-80 hours

### Phase 2: Real AI (Important)
- Implement real scheduling algorithm
- Add route optimization
- Intelligent matching logic
- Estimated: 100-200 hours

### Phase 3: Authentication (Essential)
- User login system
- Password hashing
- JWT tokens
- Role-based access
- Estimated: 30-50 hours

### Phase 4: Advanced Features (Nice to Have)
- Real-time updates (WebSockets)
- Email/SMS notifications
- Mobile app
- Advanced analytics
- Estimated: 100+ hours

### Total for Production
**Estimated: 300-500+ hours of development**

---

## 🐛 Troubleshooting

### Server Won't Start

**Error:** "Port 3000 already in use"

**Solution:**
```bash
# Use different port
PORT=3001 node server.js

# Or kill existing process
# On Windows: netstat -ano | findstr :3000
# On Mac/Linux: lsof -i :3000
```

### Google Maps Not Showing

**Solution:**
1. Check internet connection
2. Clear browser cache
3. Check API key (if using custom)
4. Try different browser

### API Endpoints Not Responding

**Solution:**
1. Verify server is running
2. Check terminal for errors
3. Verify port 3000 is open
4. Try health check: http://localhost:3000/api/health

### Data Lost After Restart

**Expected Behavior:** This is intentional!

Data is stored in server memory (JavaScript objects) and resets when server restarts. This is because:
- ✓ No database to save to
- ✓ It's a prototype
- ✓ Shows the concept

To make data persistent, add a real database.

### Forms Not Saving

**Expected Behavior:** Demo only!

Forms demonstrate the interface. In production, they would:
- Save to database
- Send confirmations
- Create actual records

---

## 🤝 Contributing

Contributions welcome for:
- Bug fixes
- API improvements
- UI/UX enhancements
- Documentation
- Additional demo features

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 📞 Support

- **Documentation:** Read this README
- **Issues:** Check GitHub issues
- **Questions:** Create an issue

---

## 🎉 Summary

### What You Get

✅ **Full-Stack Prototype** (Frontend + Backend)
✅ **Express.js Backend** with 20+ API endpoints
✅ **Booking System** fully functional
✅ **Availability Management** fully functional
✅ **Google Maps Integration** working
✅ **4 Professional Dashboards** complete
✅ **Perfect for Portfolio** or presentations

### What You Don't Get (Yet)

❌ Real database (in-memory only)
❌ Real AI algorithm (simulated)
❌ User authentication
❌ Production-ready reliability
❌ Data persistence

### Best Use

🎬 Demonstrations & presentations
🎨 Portfolio showcase
👥 Client feedback
📚 Learning full-stack development
🎓 Understanding system architecture

---

## 🚀 Ready to Use?

```bash
npm install
node server.js
# Open http://localhost:3000
```

That's it! 🎉

**Enjoy the full-stack prototype!**

---

Made with ❤️ as a full-stack prototype

Last Updated: October 2025  
Version: 1.0.0 (Full-Stack Prototype)