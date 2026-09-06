import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_change_me');
    const userRes = await pool.query(
      'SELECT id, handle, name, email, role, reputation_score, rank FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token: User not found.' });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_change_me');
    const userRes = await pool.query(
      'SELECT id, handle, name, email, role, reputation_score, rank FROM users WHERE id = $1',
      [decoded.id]
    );
    if (userRes.rows.length > 0) {
      req.user = userRes.rows[0];
    }
  } catch (err) {
    // If token invalid, proceed as guest
    req.user = null;
  }
  next();
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || (req.user.role !== role && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires ${role} privileges.`,
      });
    }
    next();
  };
};
