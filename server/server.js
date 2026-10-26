const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { authenticateToken, optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend assets from repository root
app.use(express.static(path.join(__dirname, '..')));

// ==========================================
// 1. AUTHENTICATION APIS
// ==========================================

// Register New User (Student or Organizer)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  const userRole = role === 'organizer' ? 'organizer' : 'student';

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()], async (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database query error.' });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      }

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), hashedPassword, userRole],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ error: 'Failed to create user account.' });

          const userId = this.lastID;
          const userPayload = { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: userRole };
          const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

          res.status(201).json({
            message: 'Registration successful!',
            token,
            user: userPayload
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database query error.' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: userPayload
    });
  });
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 2. EVENTS APIS
// ==========================================

// Get All Events (with optional category & search filter)
app.get('/api/events', optionalAuth, (req, res) => {
  const { category, search } = req.query;
  const userId = req.user ? req.user.id : null;

  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    query += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  if (search && search.trim() !== '') {
    query += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(venue) LIKE ?)';
    const term = `%${search.toLowerCase().trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY id ASC';

  db.all(query, params, (err, events) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch events from database.' });

    // If user is authenticated, attach registration status for each event
    if (userId) {
      db.all('SELECT event_id, ticket_id FROM registrations WHERE user_id = ?', [userId], (regErr, regs) => {
        if (regErr) return res.json({ events });

        const regMap = new Map();
        regs.forEach(r => regMap.set(r.event_id, r.ticket_id));

        const enrichedEvents = events.map(e => ({
          ...e,
          is_registered: regMap.has(e.id),
          ticket_id: regMap.get(e.id) || null
        }));

        res.json({ events: enrichedEvents });
      });
    } else {
      res.json({ events });
    }
  });
});

// Create New Event (Organizer Only)
app.post('/api/events', authenticateToken, (req, res) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only club organizers can publish campus events.' });
  }

  const { title, category, description, venue, event_date, total_seats, banner_url } = req.body;

  if (!title || !category || !venue || !event_date || !total_seats) {
    return res.status(400).json({ error: 'Please provide title, category, venue, date, and total seat capacity.' });
  }

  const seats = parseInt(total_seats, 10);
  if (isNaN(seats) || seats <= 0) {
    return res.status(400).json({ error: 'Total seats must be a positive number.' });
  }

  const defaultBanner = banner_url || 'assets/images/events/advitya-fest.jpg';

  db.run(
    `INSERT INTO events (title, category, description, venue, event_date, total_seats, seats_left, organizer_id, banner_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, category, description || '', venue, event_date, seats, seats, req.user.id, defaultBanner],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create event.' });

      res.status(201).json({
        message: 'Event published successfully!',
        eventId: this.lastID
      });
    }
  );
});

// ==========================================
// 3. REGISTRATIONS & TICKET PASS APIS
// ==========================================

// Register Student for an Event
app.post('/api/events/:id/register', authenticateToken, (req, res) => {
  const eventId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  // 1. Fetch Event and verify seat availability
  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, event) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    // 2. Check if user is already registered
    db.get('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId], (checkErr, existingReg) => {
      if (checkErr) return res.status(500).json({ error: 'Database check error.' });
      if (existingReg) {
        return res.status(409).json({
          error: 'You have already registered for this event!',
          ticket_id: existingReg.ticket_id
        });
      }

      // 3. Check seat availability
      if (event.seats_left <= 0) {
        return res.status(400).json({ error: 'Housefull! No remaining seats for this event.' });
      }

      // 4. Generate unique digital Ticket Code (e.g. NV-2026-X9K3)
      const ticketId = `NV-${eventId}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // 5. Atomic Update: Decrement seat count and insert registration
      db.run('UPDATE events SET seats_left = seats_left - 1 WHERE id = ? AND seats_left > 0', [eventId], function (updateErr) {
        if (updateErr || this.changes === 0) {
          return res.status(400).json({ error: 'Registration failed: seats just filled up!' });
        }

        db.run(
          'INSERT INTO registrations (user_id, event_id, ticket_id) VALUES (?, ?, ?)',
          [userId, eventId, ticketId],
          function (regInsertErr) {
            if (regInsertErr) {
              // Rollback seat count if registration insert failed
              db.run('UPDATE events SET seats_left = seats_left + 1 WHERE id = ?', [eventId]);
              return res.status(500).json({ error: 'Failed to record registration.' });
            }

            res.status(201).json({
              message: 'Registration confirmed! Digital Pass generated.',
              ticket: {
                ticket_id: ticketId,
                event_title: event.title,
                category: event.category,
                venue: event.venue,
                event_date: event.event_date,
                student_name: req.user.name,
                student_email: req.user.email,
                seats_remaining: event.seats_left - 1
              }
            });
          }
        );
      });
    });
  });
});

// Get Logged-In User's Registered Passes
app.get('/api/my-registrations', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      r.id AS registration_id,
      r.ticket_id,
      r.registered_at,
      r.status,
      e.id AS event_id,
      e.title,
      e.category,
      e.venue,
      e.event_date,
      e.banner_url
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.id DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch registrations.' });
    res.json({ registrations: rows });
  });
});

// Cancel a Registration
app.delete('/api/registrations/:ticket_id', authenticateToken, (req, res) => {
  const ticketId = req.params.ticket_id;
  const userId = req.user.id;

  db.get('SELECT * FROM registrations WHERE ticket_id = ? AND user_id = ?', [ticketId, userId], (err, reg) => {
    if (err) return res.status(500).json({ error: 'Database lookup error.' });
    if (!reg) return res.status(404).json({ error: 'Registration not found or unauthorized.' });

    db.run('DELETE FROM registrations WHERE id = ?', [reg.id], function (delErr) {
      if (delErr) return res.status(500).json({ error: 'Failed to cancel registration.' });

      // Increment seat back to event
      db.run('UPDATE events SET seats_left = seats_left + 1 WHERE id = ?', [reg.event_id]);

      res.json({ message: 'Registration cancelled successfully. Seat has been released.' });
    });
  });
});

// Fallback to index.html for client-side navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 NewsVita Full-Stack Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite initialized with tables`);
  console.log(`===============================================`);
});
