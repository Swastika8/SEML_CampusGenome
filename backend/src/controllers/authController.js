import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { isDemo } from '../config/db.js';
import { jwtSecret, jwtOptions } from '../config/security.js';

export const generateToken = (user) =>
  jwt.sign({ id: user.id }, jwtSecret, {
    algorithm: 'HS256',
    issuer: jwtOptions.issuer,
    audience: jwtOptions.audience,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
const publicUser = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};
const session = (res, user, status = 200) =>
  res.status(status).json({ success: true, token: generateToken(user), user: publicUser(user) });
export const register = async (req, res, next) => {
  try {
    const { name, handle, email, password, department, graduationYear } = req.body;
    const formattedHandle = '@' + handle.replace(/^@/, '');
    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(handle) = LOWER($2)',
      [email, formattedHandle],
    );
    if (existing.rows.length)
      return res
        .status(409)
        .json({ success: false, message: 'That email or handle is already in use.' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, handle, email, password_hash, department, graduation_year, reputation_score) VALUES ($1,$2,$3,$4,$5,$6,0) RETURNING *',
      [
        name,
        formattedHandle,
        email,
        hash,
        department || 'General',
        graduationYear || new Date().getFullYear() + 4,
      ],
    );
    session(res, result.rows[0], 201);
  } catch (err) {
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(handle) = LOWER($1)',
      [loginIdentifier],
    );
    const user = result.rows[0];
    // Fixed dummy hash keeps unknown-user and wrong-password work comparable.
    const valid = await bcrypt.compare(
      password,
      user?.password_hash || '$2b$10$fthrhnYe0zH53fBEQnp4Fe346WJR/Ce7rKdsc/RtrE8uT1JezZ1eq',
    );
    if (!user || !valid)
      return res
        .status(401)
        .json({ success: false, message: 'Email, handle or password is incorrect.' });
    session(res, user);
  } catch (err) {
    next(err);
  }
};
export const demoLogin = async (req, res, next) => {
  if (!isDemo)
    return res.status(404).json({ success: false, message: 'Demo access is not enabled.' });
  try {
    const result = await pool.query("SELECT * FROM users WHERE handle = '@StudentJohn'");
    session(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};
export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.*,
      (SELECT COUNT(*)::int FROM knowledge_nodes WHERE user_id=u.id AND status!='Removed') AS contribution_count,
      (SELECT COUNT(*)::int FROM bookmarks WHERE user_id=u.id) AS saved_count,
      (SELECT COUNT(*)::int FROM event_attendees WHERE user_id=u.id) AS rsvp_count
      FROM users u WHERE u.id=$1`,
      [req.user.id],
    );
    res.json({ success: true, user: publicUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};
