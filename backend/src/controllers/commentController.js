import pool, { transaction } from '../config/db.js';
import { updateRank } from './nodeController.js';
export const getCommentsByNodeId = async (req, res, next) => {
  try {
    const found = await pool.query(
      "SELECT id FROM knowledge_nodes WHERE id=$1 AND status!='Removed'",
      [req.params.nodeId],
    );
    if (!found.rows.length)
      return res.status(404).json({ success: false, message: 'Contribution not found.' });
    const result = await pool.query(
      `SELECT c.*,u.handle AS author_handle,u.rank AS author_rank FROM comments c LEFT JOIN users u ON u.id=c.user_id WHERE node_id=$1 ORDER BY c.created_at,c.id LIMIT 200`,
      [req.params.nodeId],
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
export const addComment = async (req, res, next) => {
  try {
    const data = await transaction(async (client) => {
      const found = await client.query(
        "SELECT id FROM knowledge_nodes WHERE id=$1 AND status!='Removed' FOR UPDATE",
        [req.params.nodeId],
      );
      if (!found.rows.length)
        throw Object.assign(new Error('Contribution not found.'), { status: 404 });
      const result = await client.query(
        'INSERT INTO comments (node_id,user_id,author_name,text) VALUES ($1,$2,$3,$4) RETURNING *',
        [req.params.nodeId, req.user.id, req.user.name, req.body.text],
      );
      await client.query(
        'UPDATE knowledge_nodes SET comment_count=comment_count+1,updated_at=NOW() WHERE id=$1',
        [req.params.nodeId],
      );
      await client.query('UPDATE users SET reputation_score=reputation_score+2 WHERE id=$1', [
        req.user.id,
      ]);
      await updateRank(client, req.user.id);
      return { ...result.rows[0], author_handle: req.user.handle };
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
