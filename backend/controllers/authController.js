const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
    res.status(201).json({ token: signToken(user.id), user: safeUser(user) });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user.id), user: safeUser(user) });
  } catch (err) { next(err); }
};

exports.getMe = (req, res) => res.json(req.user);
