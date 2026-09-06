import pool from '../config/db.js';

export const getOpportunities = async (req, res, next) => {
  try {
    const careerRes = await pool.query(`
      SELECT 
        k.id,
        k.title,
        TO_CHAR(k.created_at, 'Month DD, YYYY') AS date,
        cr.opportunity_type AS type,
        cr.stats_or_package AS stats,
        cr.opportunity_status AS status,
        k.description,
        k.verification_count AS "verifyCount",
        k.comment_count AS "commentCount",
        cr.domain,
        cr.company,
        cr.role,
        cr.apply_link AS "applyLink"
      FROM knowledge_nodes k
      JOIN career_nodes cr ON k.id = cr.node_id
      WHERE k.category = 'Career' AND k.status != 'Removed'
      ORDER BY k.created_at DESC;
    `);

    res.status(200).json({
      success: true,
      data: careerRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oppRes = await pool.query(
      `SELECT 
        k.id, k.title, k.description, k.verification_count AS "verifyCount", k.comment_count AS "commentCount",
        cr.domain, cr.company, cr.role, cr.opportunity_type AS type, cr.stats_or_package AS stats,
        cr.opportunity_status AS status, cr.apply_link AS "applyLink"
       FROM knowledge_nodes k
       JOIN career_nodes cr ON k.id = cr.node_id
       WHERE k.id = $1 AND k.category = 'Career'`,
      [id]
    );

    if (oppRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Career opportunity not found.' });
    }

    res.status(200).json({
      success: true,
      data: oppRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
