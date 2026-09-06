import pool from '../config/db.js';

export const getCommunities = async (req, res, next) => {
  try {
    const clubsRes = await pool.query(`
      SELECT 
        k.id,
        cm.club_name AS name,
        k.description,
        cm.members_count AS members,
        cm.next_meeting AS "nextMeeting",
        cm.club_status AS status,
        cm.category,
        cm.image_url AS image,
        k.verification_count AS "verifyCount",
        k.comment_count AS "commentCount"
      FROM knowledge_nodes k
      JOIN community_nodes cm ON k.id = cm.node_id
      WHERE k.category = 'Communities' AND k.status != 'Removed'
      ORDER BY cm.members_count DESC;
    `);

    res.status(200).json({
      success: true,
      data: clubsRes.rows,
      totalClubs: clubsRes.rows.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getCommunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clubRes = await pool.query(
      `SELECT 
        k.id, cm.club_name AS name, k.description, cm.members_count AS members,
        cm.next_meeting AS "nextMeeting", cm.club_status AS status, cm.category,
        cm.image_url AS image
       FROM knowledge_nodes k
       JOIN community_nodes cm ON k.id = cm.node_id
       WHERE k.id = $1 AND k.category = 'Communities'`,
      [id]
    );

    if (clubRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Community/club not found.' });
    }

    res.status(200).json({
      success: true,
      data: clubRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
