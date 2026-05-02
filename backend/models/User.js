const bcrypt = require('bcryptjs');
const db = require('../db');

/**
 * Shape a DB row into a safe user object.
 * Returns both `id` and `_id` so the frontend works without changes.
 */
function format(row) {
  if (!row) return null;
  const { password, ...rest } = row;
  return { ...rest, _id: rest.id };
}

/** Find user by email (includes password for auth checks) */
async function findByEmail(email) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

/** Find user by id (no password) */
async function findById(id) {
  const { rows } = await db.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return format(rows[0]);
}

/** Get all users (no passwords) */
async function findAll() {
  const { rows } = await db.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at'
  );
  return rows.map(format);
}

/** Create a new user (hashes password automatically) */
async function create({ name, email, password, role = 'member' }) {
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email.toLowerCase(), hashed, role]
  );
  return format(rows[0]);
}

/** Update a user's role */
async function updateRole(id, role) {
  const { rows } = await db.query(
    `UPDATE users SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, created_at, updated_at`,
    [role, id]
  );
  return format(rows[0]);
}

/** Compare plain text password against stored hash */
function matchPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { findByEmail, findById, findAll, create, updateRole, matchPassword };
