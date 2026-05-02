require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Middlewares ─────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/activity', require('./routes/activity'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', db: 'postgresql', orm: 'prisma', timestamp: new Date().toISOString() })
);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found` }));

// ── Global Error Handler ──────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
});
