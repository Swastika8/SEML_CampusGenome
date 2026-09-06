import pool from '../config/db.js';

export const getCommentsByNodeId = async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    const commentsRes = await pool.query(
      `SELECT 
        c.id, c.node_id, c.user_id, c.author_name, c.text, c.created_at,
        u.handle AS author_handle, u.rank AS author_rank, u.avatar_url AS author_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.node_id = $1
       ORDER BY c.created_at ASC;`,
      [nodeId]
    );

    res.status(200).json({
      success: true,
      data: commentsRes.rows,
      count: commentsRes.rows.length,
    });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { nodeId } = req.params;
    const { text, authorName } = req.body;
    const userId = req.user?.id || null;
    const author = authorName || req.user?.name || 'Campus Student';

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    // 1. Insert comment
    const insertRes = await client.query(
      `INSERT INTO comments (node_id, user_id, author_name, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, node_id, user_id, author_name, text, created_at;`,
      [nodeId, userId, author, text]
    );

    // 2. Increment comment_count on node
    await client.query(
      `UPDATE knowledge_nodes SET comment_count = comment_count + 1 WHERE id = $1`,
      [nodeId]
    );

    // 3. Award commenter +2 reputation points if logged in
    if (userId) {
      await client.query(
        `UPDATE users SET reputation_score = reputation_score + 2 WHERE id = $1`,
        [userId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: insertRes.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
