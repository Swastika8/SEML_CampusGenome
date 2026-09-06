import pool from '../config/db.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboardRes = await pool.query(`
      SELECT 
        u.id,
        u.handle,
        u.name,
        u.reputation_score AS reputation,
        u.rank,
        u.department,
        u.avatar_url,
        (SELECT COUNT(*) FROM verifications v JOIN knowledge_nodes k ON v.node_id = k.id WHERE k.user_id = u.id) AS "verifiedCount"
      FROM users u
      ORDER BY u.reputation_score DESC
      LIMIT 10;
    `);

    res.status(200).json({
      success: true,
      data: leaderboardRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { handleOrId } = req.params;

    const isNumeric = /^\d+$/.test(handleOrId);
    const whereClause = isNumeric ? 'u.id = $1' : 'LOWER(u.handle) = LOWER($1)';
    const param = isNumeric ? parseInt(handleOrId, 10) : (handleOrId.startsWith('@') ? handleOrId : `@${handleOrId}`);

    const userRes = await pool.query(
      `SELECT 
        u.id, u.handle, u.name, u.email, u.department, u.graduation_year,
        u.reputation_score, u.rank, u.role, u.avatar_url, u.created_at
       FROM users u 
       WHERE ${whereClause}`,
      [param]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];

    // Fetch user contributions
    const contributionsRes = await pool.query(
      `SELECT id, category, title, description, status, verification_count, comment_count, created_at
       FROM knowledge_nodes
       WHERE user_id = $1
       ORDER BY created_at DESC;`,
      [user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...user,
        contributions: contributionsRes.rows,
        totalContributions: contributionsRes.rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
