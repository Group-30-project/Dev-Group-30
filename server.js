/**
 * ========================= ORIGINAL CODE (PRESERVED, NOT REMOVED) =========================
 * Your original file is kept here for reference. It is fully commented out so the
 * secure version below can run. You can compare line-by-line easily.
 *
 * const express = require('express');
 * const mysql = require('mysql2');
 * const session = require('express-session');
 * const bcrypt = require('bcryptjs');
 * const bodyParser = require('body-parser');
 * const path = require('path');
 * const app = express();
 *
 * mode: 'production'
 *
 * const db = mysql.createConnection({
 *   host: 'localhost',
 *   user: 'root',
 *   password: '135791113',
 *   database: 'job_portal'
 * });
 * db.connect(err => {
 *   if (err) {
 *     console.error('MySQL connection error:', err);
 *     process.exit(1);
 *   }
 *   console.log('MySQL connected...');
 * });
 *
 * app.use(bodyParser.urlencoded({ extended: false }));
 * app.use(session({
 *   secret: '135791113',
 *   resave: false,
 *   saveUninitialized: false
 * }));
 * app.use(express.static(path.join(__dirname, 'public')));
 * app.set('view engine', 'ejs');
 *
 * function authMiddleware(req, res, next) {
 *   if (!req.session.userId) return res.redirect('/login');
 *   next();
 * }
 *
 * app.get('/', (req, res) => {
 *   if (req.session.userId) return res.redirect('/dashboard');
 *   res.redirect('/login');
 * });
 *
 * // REGISTER
 * app.get('/register', (req, res) => {
 *   res.render('register', { message: '' });
 * });
 *
 * app.post('/register', (req, res) => {
 *   const { name, email, password } = req.body;
 *   if (!name || !email || !password) return res.render('register', { message: 'Please fill all fields' });
 *
 *   db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
 *     if (err) {
 *       console.error(err);
 *       return res.render('register', { message: 'Database error' });
 *     }
 *     if (results.length > 0) return res.render('register', { message: 'Email already registered' });
 *
 *     bcrypt.hash(password, 10, (err, hash) => {
 *       if (err) {
 *         console.error(err);
 *         return res.render('register', { message: 'Error encrypting password' });
 *       }
 *       db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], err => {
 *         if (err) {
 *           console.error(err);
 *           return res.render('register', { message: 'Database insert error' });
 *         }
 *         res.redirect('/login');
 *       });
 *     });
 *   });
 * });
 *
 * // LOGIN
 * app.get('/login', (req, res) => {
 *   res.render('login', { message: '' });
 * });
 *
 * app.post('/login', (req, res) => {
 *   const { email, password } = req.body;
 *   if (!email || !password) return res.render('login', { message: 'Please enter email and password' });
 *
 *   db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
 *     if (err) {
 *       console.error(err);
 *       return res.render('login', { message: 'Database error' });
 *     }
 *     if (results.length === 0) return res.render('login', { message: 'Email not registered' });
 *
 *     const user = results[0];
 *     bcrypt.compare(password, user.password, (err, match) => {
 *       if (err) {
 *         console.error(err);
 *         return res.render('login', { message: 'Error checking password' });
 *       }
 *       if (match) {
 *         req.session.userId = user.id;
 *         req.session.userName = user.name;
 *         req.session.userEmail = user.email;
 *         res.redirect('/dashboard');
 *       } else {
 *         res.render('login', { message: 'Incorrect password' });
 *       }
 *     });
 *   });
 * });
 *
 * // DASHBOARD
 * app.get('/dashboard', authMiddleware, (req, res) => {
 *   db.query('SELECT id, name FROM users WHERE id != ?', [req.session.userId], (err, users) => {
 *     if (err) {
 *       console.error(err);
 *       return res.send('Database error');
 *     }
 *     res.render('dashboard', { name: req.session.userName, users });
 *   });
 * });
 *
 * // LOGOUT
 * app.get('/logout', (req, res) => {
 *   req.session.destroy(() => {
 *     res.redirect('/login');
 *   });
 * });
 *
 * // about
 * app.get('/about', (req, res) => { res.render('about'); });
 *
 * // service
 * app.get('/service', (req, res)=> { res.render('service'); })
 *
 * // jobs new
 * app.get('/jobs' , (req, res )=>{ res.render('jobs'); })
 *
 * // POST JOB - GET
 * app.get('/post-job', authMiddleware, (req, res) => {
 *   res.render('post-job', { userName: req.session.userName, userEmail: req.session.userEmail, message: '' });
 * });
 *
 * app.get('/chat' , authMiddleware, (req, res)=>{ res.render('chat'); })
 *
 * // POST JOB - POST
 * app.post('/post-job', authMiddleware, (req, res) => {
 *   const { title, description, company, location, telegram, whatsapp, imo, other_chat } = req.body;
 *   if (!title || !description || !company || !location) {
 *     return res.render('post-job', { userName: req.session.userName, userEmail: req.session.userEmail, message: 'Please fill all required fields' });
 *   }
 *   const sql = `INSERT INTO jobs (title, description, company, location, posted_by, telegram, whatsapp, imo, other_chat, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
 *   db.query(sql, [ title, description, company, location, req.session.userId, telegram || null, whatsapp || null, imo || null, other_chat || null ], err => {
 *     if (err) {
 *       console.error(err);
 *       return res.render('post-job', { userName: req.session.userName, userEmail: req.session.userEmail, message: 'Error saving job' });
 *     }
 *     res.redirect('/find-jobs');
 *   });
 * });
 *
 * // FIND JOBS
 * app.get('/find-jobs', authMiddleware, (req, res) => {
 *   const q = req.query.q ? `%${req.query.q}%` : '%';
 *   const sql = `
 *     SELECT jobs.*, users.name AS poster_name, users.email AS poster_email
 *     FROM jobs
 *     JOIN users ON jobs.posted_by = users.id
 *     WHERE jobs.title LIKE ? OR jobs.company LIKE ? OR jobs.location LIKE ?
 *     ORDER BY jobs.created_at DESC`;
 *   db.query(sql, [q, q, q], (err, results) => {
 *     if (err) { console.error(err); return res.send('Database error'); }
 *     res.render('find-jobs', { jobs: results, query: req.query.q || '' });
 *   });
 * });
 *
 * // CHAT GET (duplicate A)
 * app.get('/chat/:id', authMiddleware, (req, res) => {
 *   const otherUserId = req.params.id;
 *   const currentUserId = req.session.userId;
 *   db.query('SELECT id, name FROM users WHERE id = ?', [otherUserId], (err, userResults) => {
 *     if (err) { console.error(err); return res.redirect('/dashboard'); }
 *     if (userResults.length === 0) return res.redirect('/dashboard');
 *     const receiver = userResults[0];
 *     db.query(
 *       `SELECT * FROM messages
 *        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
 *        ORDER BY timestamp ASC`,
 *       [currentUserId, otherUserId, otherUserId, currentUserId],
 *       (err, messages) => {
 *         if (err) { console.error(err); return res.redirect('/dashboard'); }
 *         res.render('chat', { messages, receiverName: receiver.name, receiverId: receiver.id, userId: currentUserId });
 *       }
 *     );
 *   });
 * });
 *
 * // CHAT GET (duplicate B)
 * app.get('/chat/:id', authMiddleware, (req, res) => {
 *   const otherUserId = req.params.id;
 *   const currentUserId = req.session.userId;
 *   db.query('SELECT id, name FROM users WHERE id = ?', [otherUserId], (err, users) => {
 *     if (err) throw err;
 *     if (users.length === 0) return res.redirect('/dashboard');
 *     const receiver = users[0];
 *     db.query(
 *       `SELECT * FROM messages 
 *        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
 *        ORDER BY timestamp ASC`,
 *       [currentUserId, otherUserId, otherUserId, currentUserId],
 *       (err, messages) => {
 *         if (err) throw err;
 *         res.render('chat', { messages, receiverName: receiver.name, receiverId: receiver.id, userId: currentUserId });
 *       }
 *     );
 *   });
 * });
 *
 * // POST chat message
 * app.post('/chat/:id', authMiddleware, (req, res) => {
 *   const senderId = req.session.userId;
 *   const receiverId = req.params.id;
 *   const content = req.body.message;
 *   if (!content) return res.redirect(`/chat/${receiverId}`);
 *   const sql = 'INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())';
 *   db.query(sql, [senderId, receiverId, content], err => {
 *     if (err) throw err;
 *     res.redirect(`/chat/${receiverId}`);
 *   });
 * });
 *
 * // My posts
 * app.get('/my-posts', authMiddleware, (req, res) => {
 *   const userId = req.session.userId;
 *   const sql = `SELECT * FROM jobs WHERE posted_by = ? ORDER BY created_at DESC`;
 *   db.query(sql, [userId], (err, results) => {
 *     if (err) throw err;
 *     res.render('my-posts', { jobs: results, userName: req.session.userName });
 *   });
 * });
 *
 * // Delete post
 * app.post('/delete-post/:id', authMiddleware, (req, res) => {
 *   const postId = req.params.id;
 *   const userId = req.session.userId;
 *   const sql = 'DELETE FROM jobs WHERE id = ? AND posted_by = ?';
 *   db.query(sql, [postId, userId], (err, result) => {
 *     if (err) throw err;
 *     res.redirect('/my-posts');
 *   });
 * });
 *
 * // My posts (duplicate)
 * app.get('/my-posts', authMiddleware, (req, res) => {
 *   const userId = req.session.userId;
 *   const sql = `SELECT * FROM jobs WHERE posted_by = ? ORDER BY created_at DESC`;
 *   db.query(sql, [userId], (err, results) => {
 *     if (err) throw err;
 *     res.render('my-posts', { jobs: results, userName: req.session.userName });
 *   });
 * });
 *
 * // Extra apps and routes (kept)
 * const app1 = express();
 * app.use(express.static(path.join(__dirname, 'public')));
 * app.set('view engine', 'ejs');
 * app.get('/', (req, res) => { res.render('index'); });
 *
 * const app2 = express();
 * app.use(express.static(path.join(__dirname, 'public')));
 * app.set('view engine', 'ejs');
 * app.get('/', (req, res) => { res.render('index'); });   
 *
 * const PORT = process.env.PORT || 3000;
 * app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 *
 * ==========================================================================================
 */



require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const util = require('util');
const app = express();
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',              
  password: process.env.DB_PASS || '135791113',       
  database: process.env.DB_NAME || 'job_portal'
});
db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('MySQL connected...');
});
const query = util.promisify(db.query).bind(db);
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });     
const postLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });    

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret_now',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: false, // set true ybal https weymn proxy sihon
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));
function authMiddleware(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

function sanitizeText(input, { min = 1, max = 1000 } = {}) {
  const trimmed = (input ?? '').toString().trim();
  const withoutControl = trimmed.replace(/[\u0000-\u001F\u007F]/g, '');
  const collapsed = withoutControl.replace(/\s+/g, ' ');
  const safe = validator.stripLow(validator.escape(collapsed), true);
  if (!validator.isLength(safe, { min, max })) return null;
  return safe;
}

function sanitizeEmail(input) {
  const email = validator.normalizeEmail(input ?? '', { gmail_remove_dots: false });
  if (!email || !validator.isEmail(email)) return null;
  return email;
}

function isValidId(v) {
  return validator.isInt(String(v), { min: 1, max: 2_147_483_647 });
}


// leRoot
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  return res.redirect('/login');
});
app.get('/register', (req, res) => {
  res.render('register', { message: '' });
});app.post('/register', authLimiter, async (req, res) => {
  try {
    const rawName = req.body.name;
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    // leValidate input
    const name = sanitizeText(rawName, { min: 2, max: 80 });
    const email = sanitizeEmail(rawEmail);
    const password = (rawPassword ?? '').toString();

    if (!name || !email || !validator.isLength(password, { min: 8, max: 100 })) {
      return res.status(400).render('register', { message: 'Please provide a valid name, email, and a password (min 8 chars).' });
    }
    const users = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(409).render('register', { message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 12);
    await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
    return res.redirect('/login');
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).render('register', { message: 'Server error during registration' });
  }
});
app.get('/login', (req, res) => {
  res.render('login', { message: '' });
});

app.post('/login', authLimiter, async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = (req.body.password ?? '').toString();

    if (!email || !validator.isLength(password, { min: 1 })) {
      return res.status(400).render('login', { message: 'Please enter valid email and password' });
    }

    const rows = await query('SELECT id, name, email, password FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).render('login', { message: 'Email not registered' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).render('login', { message: 'Incorrect password' });
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('login', { message: 'Server error during login' });
  }
});
app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const users = await query('SELECT id, name FROM users WHERE id != ?', [req.session.userId]);
    return res.render('dashboard', { name: req.session.userName, users });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).send('Database error');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});
app.get('/about', (_req, res) => res.render('about'));
app.get('/service', (_req, res) => res.render('service'));
app.get('/jobs', (_req, res) => res.render('jobs'));
app.get('/post-job', authMiddleware, (req, res) => {
  res.render('post-job', {
    userName: req.session.userName,
    userEmail: req.session.userEmail,
    message: ''
  });
});
app.post('/post-job', authMiddleware, postLimiter, async (req, res) => {
  try {
    const title = sanitizeText(req.body.title, { min: 3, max: 120 });
    const description = sanitizeText(req.body.description, { min: 10, max: 5000 });
    const company = sanitizeText(req.body.company, { min: 2, max: 120 });
    const location = sanitizeText(req.body.location, { min: 2, max: 120 });
    const telegram = sanitizeText(req.body.telegram ?? '', { min: 0, max: 60 });
    const whatsapp = sanitizeText(req.body.whatsapp ?? '', { min: 0, max: 60 });
    const imo = sanitizeText(req.body.imo ?? '', { min: 0, max: 60 });
    const other_chat = sanitizeText(req.body.other_chat ?? '', { min: 0, max: 120 });
    if (!title || !description || !company || !location) {
      return res.status(400).render('post-job', {
        userName: req.session.userName,
        userEmail: req.session.userEmail,
        message: 'Please fill all required fields with valid values'
      });
    }
    const sql = `
      INSERT INTO jobs
        (title, description, company, location, posted_by, telegram, whatsapp, imo, other_chat, created_at VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    await query(sql, [
      title,
      description,
      company,
      location,
      req.session.userId,
      telegram || null,
      whatsapp || null,
      imo || null,
      other_chat || null
    ]);
    return res.redirect('/find-jobs');
  } catch (err) {
    console.error('Post-job error:', err);
    return res.status(500).render('post-job', {
      userName: req.session.userName,
      userEmail: req.session.userEmail,
      message: 'Error saving job'
    });
  }
});
app.get('/find-jobs', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q ?? '').toString();
    const safeQ = sanitizeText(q, { min: 0, max: 120 }) || '';
    const like = safeQ ? `%${safeQ}%` : '%';

    const sql = `SELECT jobs.*, users.name AS poster_name, users.email AS poster_emailFROM jobs JOIN users ON jobs.posted_by = users.idWHERE jobs.title LIKE ? OR jobs.company LIKE ? OR jobs.location LIKE ?ORDER BY jobs.created_at DESC`;
    const results = await query(sql, [like, like, like]);
    return res.render('find-jobs', { jobs: results, query: safeQ });
  } catch (err) {
    console.error('Find-jobs error:', err);
    return res.status(500).send('Database error');
  }
});
app.get('/chat/:id', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.id;
    const currentUserId = req.session.userId;
    if (!isValidId(otherUserId)) return res.redirect('/dashboard');

    const userRows = await query('SELECT id, name FROM users WHERE id = ?', [otherUserId]);
    if (userRows.length === 0) return res.redirect('/dashboard');

    const receiver = userRows[0];
    const messages = await query(
      `SELECT id, sender_id, receiver_id, content, timestamp
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY timestamp ASC`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );
    return res.render('chat', {
      messages,
      receiverName: receiver.name,
      receiverId: receiver.id,
      userId: currentUserId
    });
  } catch (err) {
    console.error('Chat GET error:', err);
    return res.redirect('/dashboard');
  }
});
app.post('/chat/:id', authMiddleware, postLimiter, async (req, res) => {
  try {
    const senderId = req.session.userId;
    const receiverId = req.params.id;
    const content = sanitizeText(req.body.message, { min: 1, max: 2000 });
    if (!isValidId(receiverId)) return res.redirect('/dashboard');
    if (!content) return res.redirect(`/chat/${receiverId}`);
    const sql = 'INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())';
    await query(sql, [senderId, receiverId, content]);

    return res.redirect(`/chat/${receiverId}`);
  } catch (err) {
    console.error('Chat POST error:', err);
    return res.redirect(`/chat/${req.params.id}`);
  }
});
app.get('/my-posts', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.userId;
    const rows = await query(
      `SELECT id, title, company, location, created_at
       FROM jobs
       WHERE posted_by = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.render('my-posts', { jobs: rows, userName: req.session.userName });
  } catch (err) {
    console.error('My-posts error:', err);
    return res.status(500).send('Database error');
  }
});
app.post('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.userId;
    if (!isValidId(postId)) return res.redirect('/my-posts');
    const result = await query('DELETE FROM jobs WHERE id = ? AND posted_by = ?', [postId, userId]);
    return res.redirect('/my-posts');
  } catch (err) {
    console.error('Delete-post error:', err);
    return res.redirect('/my-posts');
  }
});
app.get('/index', (_req, res) => res.render('index')); 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on http://localhost:${PORT}`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
