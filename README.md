# 📰 NewsVita — Campus Media & Event Intelligence Platform (Full-Stack)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_&_Bcrypt-blue?style=for-the-badge)](#)

> **NewsVita** is a full-stack campus event and announcement intelligence portal engineered for university ecosystems. It replaces fragmented social media flyers and manual registration spreadsheets with a unified web portal featuring **Role-Based Access Control (RBAC)**, **Atomic Seat Capacity Tracking**, and automated **Digital QR Admit Passes**.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Frontend                        │
│   • HTML5 • Tailwind CSS • Vanilla JavaScript (ES6 Modules) │
│   • Dynamic RSVP Buttons • Modals • Digital Pass Generator  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (RESTful JSON / JWT Auth)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js REST API                      │
│   • Auth Controller (Bcrypt Hashing & JWT Signing)         │
│   • Event Engine (CRUD, Category Filtering & Search)        │
│   • RSVP Engine (Atomic Seat Validation & Token Issuance)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (SQL Queries & Foreign Keys)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Relational Database (SQLite)                │
│   • users (id, name, email, password, role)                │
│   • events (id, title, category, venue, seats_left...)      │
│   • registrations (id, user_id, event_id, ticket_id...)     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Full-Stack Features & Capabilities

### 1. 🔐 Role-Based Access Control (RBAC) with JWT & Bcrypt
- **Student Role:** Browse fests, filter by categories, RSVP for events with live seat validation, view digital admit passes, and cancel registrations.
- **Club Organizer Role:** Publish new campus fests, workshops, and technical summits with seat capacity limits.
- **Security:** Passwords salted and hashed with `bcryptjs` (cost factor 10). Authenticated routes protected via Bearer JWT tokens.

### 2. ⚡ Real-Time Seat Capacity & Concurrency Protection
- Events have a strict capacity limit (`total_seats` and `seats_left`).
- When a student registers, the server performs an **atomic database validation**:
  ```sql
  UPDATE events SET seats_left = seats_left - 1 WHERE id = ? AND seats_left > 0;
  ```
- Prevents double bookings and race conditions when multiple students reserve simultaneously.
- If seats reach zero, the UI automatically transitions to an unclickable **"Housefull"** status.

### 3. 🎫 Automated Digital QR Admit Pass
- Upon registration, an official university admit ticket is issued with a unique reference code (`NV-<event_id>-<token>`).
- Includes event date, campus venue, student name, and an interactive printable SVG QR verification code.
- "My Tickets" dashboard allows students to review or print all their booked passes anytime.

### 4. 📸 Categorized Campus Media Archive & Video Reels
- Categorized photo coverage for university cultural fests (*Rangotsav, Ganesh Utsav, Advitya*) and academic ceremonies (*Convocation Day*).
- Built-in responsive HTML5 video reel player with high-frame-rate event coverage.
- Accessible keyboard lightbox modal (`Esc`, `←`, `→`).

---

## 📊 Database Schema Design

```sql
-- 1. Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('student', 'organizer', 'admin')) DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events Table
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  event_date TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  seats_left INTEGER NOT NULL,
  organizer_id INTEGER,
  banner_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(organizer_id) REFERENCES users(id)
);

-- 3. Registrations Table
CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  ticket_id TEXT UNIQUE NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'CONFIRMED',
  UNIQUE(user_id, event_id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(event_id) REFERENCES events(id)
);
```

---

## 🔌 RESTful API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new student or organizer account |
| `POST` | `/api/auth/login` | Public | Verify credentials and return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session profile |
| `GET` | `/api/events` | Public / Optional Auth | List campus events with seat counts & RSVP status |
| `POST` | `/api/events` | Organizer Only | Publish a new campus event with capacity |
| `POST` | `/api/events/:id/register` | Student Only | Atomic seat reservation & ticket issuance |
| `GET` | `/api/my-registrations` | Student Only | Get all active passes reserved by user |
| `DELETE` | `/api/registrations/:ticket_id` | Student Only | Cancel registration and restore event seat |

---

## 🚀 Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/code-with-apoorv/Newsvita.git
cd Newsvita
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Full-Stack Application
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🎯 Interview Cheat Sheet (How to Explain this Project)

When an interviewer asks: *"Tell me about NewsVita and its engineering design."*

> *"NewsVita is an end-to-end full-stack campus event intelligence and registration portal.  
> Rather than a static frontend showcase, it is powered by an **Express.js REST API** connected to a **relational database with ACID transactions**.*  
>  
> *I designed role-based access control with **JWT authentication and Bcrypt password hashing**. The core technical challenge I addressed was **race condition prevention during peak seat registrations**—I ensured atomic SQL checks so an event can never exceed its hall capacity.*  
>  
> *Once reserved, the platform generates a unique digital ticket with simulated QR verification tokens for entry security.*"

---

## 👤 Author
**Apoorv Kumar Singh**  
- B.Tech CSE (Cloud Computing & Automation), VIT Bhopal  
- GitHub: [@code-with-apoorv](https://github.com/code-with-apoorv)  
- Email: [apoorv.singh2421@gmail.com](mailto:apoorv.singh2421@gmail.com)
