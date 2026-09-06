import pool from '../config/db.js';

export const getAcademicInsights = async (req, res, next) => {
  try {
    const { dept, year } = req.query;

    const conditions = ["k.category = 'Academics'", "k.status != 'Removed'"];
    const params = [];
    let paramIndex = 1;

    if (dept) {
      conditions.push(`ac.department ILIKE $${paramIndex++}`);
      params.push(dept);
    }

    if (year && year !== 'All Years') {
      conditions.push(`ac.year ILIKE $${paramIndex++}`);
      params.push(year);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const insightsRes = await pool.query(
      `SELECT 
        k.id,
        u.name AS author,
        u.handle AS "authorHandle",
        k.title,
        k.description AS content,
        ac.department,
        ac.year,
        ac.subject,
        ac.insight_type AS "insightType",
        k.verification_count AS "verifiedBy",
        k.comment_count AS comments,
        12 AS reposts
       FROM knowledge_nodes k
       JOIN academic_nodes ac ON k.id = ac.node_id
       LEFT JOIN users u ON k.user_id = u.id
       ${whereClause}
       ORDER BY k.verification_count DESC;`,
      params
    );

    res.status(200).json({
      success: true,
      data: insightsRes.rows,
      count: insightsRes.rows.length,
    });
  } catch (err) {
    next(err);
  }
};
