import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { jwtSecret, jwtOptions } from '../config/security.js';

async function identify(req) {
  const match = /^Bearer ([^ ]+)$/.exec(req.headers.authorization || '');
  if (!match) return null;
  let decoded;
  try {
    decoded = jwt.verify(match[1], jwtSecret, jwtOptions);
  } catch {
    return null;
  }
  const result = await pool.query(
    'SELECT id, handle, name, email, role, reputation_score, rank FROM users WHERE id = $1',
    [decoded.id],
  );
  return result.rows[0] || null;
}
export const authenticateToken = async (req, res, next) => {
  try {
    req.user = await identify(req);
    if (!req.user)
      return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
    next();
  } catch (err) {
    next(err);
  }
};
export const optionalAuth = async (req, res, next) => {
  try {
    req.user = await identify(req);
    next();
  } catch (err) {
    next(err);
  }
};
export const requireRole = (role) => (req, res, next) => {
  if (!req.user || ![role, 'admin'].includes(req.user.role))
    return res
      .status(403)
      .json({ success: false, message: 'You do not have permission to do this.' });
  next();
};
