const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'newsvita.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Initialize database schema
db.serialize(() => {
  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'organizer', 'admin')) NOT NULL DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Events Table
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
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
    )
  `);

  // 3. Registrations Table
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      ticket_id TEXT UNIQUE NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'CONFIRMED',
      UNIQUE(user_id, event_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(event_id) REFERENCES events(id)
    )
  `);

  // Seed default campus events if table is empty
  db.get("SELECT COUNT(*) AS count FROM events", (err, row) => {
    if (err) return console.error('Error checking events:', err);
    if (row.count === 0) {
      console.log('🌱 Seeding initial campus events into database...');
      const seedEvents = [
        {
          title: 'Dandiya Night & Cultural Gala 2026',
          category: 'Cultural',
          description: 'Grand university-wide Garba & Dandiya celebration with live folk band, traditional music, and food stalls.',
          venue: 'University Sports Complex Ground',
          event_date: 'Oct 18, 2026 • 6:30 PM',
          total_seats: 150,
          seats_left: 45,
          banner_url: 'assets/images/festivals/rangotsav.jpg'
        },
        {
          title: 'HackVita 36-Hr Flagship Hackathon',
          category: 'Technical',
          description: '36-hour inter-college hackathon building real-world solutions across AI, Cloud, and Web3 with prizes worth ₹1 Lakh.',
          venue: 'Innovation & Research Lab, Block B',
          event_date: 'Nov 05, 2026 • 9:00 AM',
          total_seats: 80,
          seats_left: 18,
          banner_url: 'assets/images/events/advitya-fest.jpg'
        },
        {
          title: 'Winter Carnival & Alumni Gala',
          category: 'Flagship',
          description: 'Annual cultural festival connecting current university batches with distinguished alumni, musical performances and awards.',
          venue: 'Main University Open Amphitheatre',
          event_date: 'Dec 12, 2026 • 5:00 PM',
          total_seats: 200,
          seats_left: 92,
          banner_url: 'assets/images/events/convocation-day.jpg'
        },
        {
          title: 'Cloud Computing & AWS Architecture Workshop',
          category: 'Workshop',
          description: 'Hands-on practical session on deploying containerized microservices to AWS EC2, S3 asset buckets, and VPC security.',
          venue: 'Seminar Hall 3, Tech Tower',
          event_date: 'Dec 20, 2026 • 2:00 PM',
          total_seats: 60,
          seats_left: 12,
          banner_url: 'assets/images/events/rajasthan-cultural-tour.jpg'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO events (title, category, description, venue, event_date, total_seats, seats_left, banner_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      seedEvents.forEach(e => {
        stmt.run(e.title, e.category, e.description, e.venue, e.event_date, e.total_seats, e.seats_left, e.banner_url);
      });
      stmt.finalize();
      console.log('✅ Initial events seeded successfully.');
    }
  });
});

module.exports = db;
