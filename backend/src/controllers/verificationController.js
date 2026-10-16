import { transaction } from '../config/db.js';
import { updateRank } from './nodeController.js';
export const toggleVerification = async (req, res, next) => {
  try {
    const data = await transaction(async (client) => {
      const found = await client.query(
        "SELECT * FROM knowledge_nodes WHERE id=$1 AND status!='Removed' FOR UPDATE",
        [req.params.id],
      );
      if (!found.rows.length)
        throw Object.assign(new Error('Contribution not found.'), { status: 404 });
      const node = found.rows[0];
      if (node.user_id === req.user.id)
        throw Object.assign(
          new Error('Other students verify your contributions. You cannot verify your own.'),
          { status: 403 },
        );
      const existing = await client.query(
        'SELECT id FROM verifications WHERE user_id=$1 AND node_id=$2',
        [req.user.id, node.id],
      );
      const delta = existing.rows.length ? -1 : 1;
      if (delta === 1)
        await client.query('INSERT INTO verifications (user_id,node_id) VALUES ($1,$2)', [
          req.user.id,
          node.id,
        ]);
      else
        await client.query('DELETE FROM verifications WHERE user_id=$1 AND node_id=$2', [
          req.user.id,
          node.id,
        ]);
      const updated = await client.query(
        'UPDATE knowledge_nodes SET verification_count=GREATEST(0,verification_count+$1),updated_at=NOW() WHERE id=$2 RETURNING verification_count',
        [delta, node.id],
      );
      await client.query(
        'UPDATE users SET reputation_score=GREATEST(0,reputation_score+$1) WHERE id=$2',
        [delta * 5, node.user_id],
      );
      await updateRank(client, node.user_id);
      return { isVerified: delta === 1, verificationCount: updated.rows[0].verification_count };
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
