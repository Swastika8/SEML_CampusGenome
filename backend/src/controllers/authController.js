import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { handle, name, email, password, department, graduationYear } = req.body;

    if (!handle || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Handle, name, email, and password are required.',
      });
    }

    const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;

    // Check if handle or email already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR handle = $2',
      [email.toLowerCase(), formattedHandle]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with that email or handle already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (handle, name, email, password_hash, department, graduation_year, reputation_score, rank, role)
       VALUES ($1, $2, $3, $4, $5, $6, 10, 'Helix', 'student')
       RETURNING id, handle, name, email, department, graduation_year, reputation_score, rank, role, created_at`,
      [formattedHandle, name, email.toLowerCase(), passwordHash, department || 'General', graduationYear || 2026]
    );

    const user = newUser.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const loginIdentifier = req.body.loginIdentifier || req.body.email || req.body.handle;
    const { password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/handle and password are required.',
      });
    }

    const userRes = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(handle) = LOWER($1)`,
      [loginIdentifier]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = generateToken(user);

    // Omit password_hash
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userRes = await pool.query(
      `SELECT u.id, u.handle, u.name, u.email, u.department, u.graduation_year, 
              u.reputation_score, u.rank, u.role, u.avatar_url, u.created_at,
              (SELECT COUNT(*) FROM knowledge_nodes WHERE user_id = u.id) AS contribution_count,
              (SELECT COUNT(*) FROM verifications WHERE user_id = u.id) AS verified_actions_count
       FROM users u WHERE u.id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: userRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
