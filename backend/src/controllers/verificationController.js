import pool from '../config/db.js';

export const toggleVerification = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id: nodeId } = req.params;
    const userId = req.user?.id || 1; // Default to StudentJohn for guest test convenience

    // Check if node exists and get author
    const nodeRes = await client.query('SELECT user_id, verification_count FROM knowledge_nodes WHERE id = $1', [nodeId]);
    if (nodeRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Node not found.' });
    }

    const authorId = nodeRes.rows[0].user_id;

    // Check if existing verification exists
    const existing = await client.query(
      'SELECT id FROM verifications WHERE node_id = $1 AND user_id = $2',
      [nodeId, userId]
    );

    let isVerified = false;
    let newCount = nodeRes.rows[0].verification_count;

    if (existing.rows.length > 0) {
      // Remove verification
      await client.query('DELETE FROM verifications WHERE node_id = $1 AND user_id = $2', [nodeId, userId]);
      await client.query('UPDATE knowledge_nodes SET verification_count = GREATEST(0, verification_count - 1) WHERE id = $1', [nodeId]);
      if (authorId) {
        await client.query('UPDATE users SET reputation_score = GREATEST(0, reputation_score - 5) WHERE id = $1', [authorId]);
      }
      isVerified = false;
      newCount = Math.max(0, newCount - 1);
    } else {
      // Add verification
      await client.query('INSERT INTO verifications (node_id, user_id) VALUES ($1, $2)', [nodeId, userId]);
      await client.query('UPDATE knowledge_nodes SET verification_count = verification_count + 1 WHERE id = $1', [nodeId]);
      if (authorId) {
        await client.query('UPDATE users SET reputation_score = reputation_score + 5 WHERE id = $1', [authorId]);
      }
      isVerified = true;
      newCount = newCount + 1;
    }

    // Recalculate rank for author
    if (authorId) {
      const repRes = await client.query('SELECT reputation_score FROM users WHERE id = $1', [authorId]);
      const rep = repRes.rows[0]?.reputation_score || 0;
      let newRank = 'Helix';
      if (rep >= 250) newRank = 'Nucleus';
      else if (rep >= 100) newRank = 'Chromosome';
      await client.query('UPDATE users SET rank = $1 WHERE id = $2', [newRank, authorId]);
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: isVerified ? 'Node verified successfully (+5 Author Reputation).' : 'Verification removed.',
      data: {
        nodeId: parseInt(nodeId, 10),
        isVerified,
        verificationCount: newCount,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
