import pool, { transaction } from '../config/db.js';
import { updateRank } from './nodeController.js';
import { forumError, lockVisiblePost } from '../lib/forumData.js';
export const getCommentsByNodeId = async (req, res, next) => {
  try {
    const found = await pool.query(
      "SELECT id FROM knowledge_nodes WHERE id=$1 AND status!='Removed'",
      [req.params.nodeId],
    );
    if (!found.rows.length)
      return res.status(404).json({ success: false, message: 'Contribution not found.' });
    const { after, limit } = req.query;
    const result = await pool.query(
      `SELECT c.*,u.handle AS author_handle,u.rank AS author_rank
       FROM comments c LEFT JOIN users u ON u.id=c.user_id
       WHERE c.node_id=$1 AND c.id>$2 ORDER BY c.id LIMIT $3`,
      [req.params.nodeId, after, limit + 1],
    );
    const data = result.rows.slice(0, limit);
    res.json({
      success: true,
      data,
      nextCursor: result.rows.length > limit ? data.at(-1).id : null,
    });
  } catch (err) {
    next(err);
  }
};
export const addComment = async (req, res, next) => {
  try {
    const data = await transaction(async (client) => {
      const post = await lockVisiblePost(client, req.params.nodeId);
      let depth = 0;
      if (req.body.parentId) {
        const {
          rows: [parent],
        } = await client.query('SELECT depth FROM comments WHERE node_id=$1 AND id=$2', [
          post.id,
          req.body.parentId,
        ]);
        if (!parent) throw forumError(400, 'That comment isn’t in this discussion.');
        if (parent.depth >= 6)
          throw forumError(400, 'This reply chain has reached its depth limit.');
        depth = parent.depth + 1;
      }
      const result = await client.query(
        'INSERT INTO comments (node_id,user_id,author_name,text,parent_id,depth) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [post.id, req.user.id, req.user.name, req.body.text, req.body.parentId || null, depth],
      );
      await client.query(
        'UPDATE knowledge_nodes SET comment_count=COALESCE(comment_count,0)+1,updated_at=NOW() WHERE id=$1',
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
