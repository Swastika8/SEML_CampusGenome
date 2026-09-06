import pool from '../config/db.js';

export const getLifestyle = async (req, res, next) => {
  try {
    const lifestyleRes = await pool.query(`
      SELECT 
        k.id,
        ls.spot_name AS name,
        ls.location,
        ls.lifestyle_category,
        json_build_object(
          'status', ls.pulse_status,
          'percentage', ls.pulse_percentage,
          'color', ls.pulse_color
        ) AS pulse,
        ls.secret_tip AS secret,
        ls.tags,
        ls.image_url AS image,
        k.verification_count AS "verifiedBy",
        k.comment_count AS comments,
        ls.quote
      FROM knowledge_nodes k
      JOIN lifestyle_nodes ls ON k.id = ls.node_id
      WHERE k.category = 'Lifestyle' AND k.status != 'Removed'
      ORDER BY k.verification_count DESC;
    `);

    // Group items into 'canteens', 'green-spots', 'housing' matching frontend
    const grouped = {
      canteens: [],
      'green-spots': [],
      housing: [],
    };

    lifestyleRes.rows.forEach((row) => {
      const cat = row.lifestyle_category;
      if (grouped[cat]) {
        grouped[cat].push(row);
      } else {
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(row);
      }
    });

    res.status(200).json({
      success: true,
      data: grouped,
      totalSpots: lifestyleRes.rows.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getLifestyleSpotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const spotRes = await pool.query(
      `SELECT 
        k.id, ls.spot_name AS name, ls.location, ls.lifestyle_category,
        json_build_object('status', ls.pulse_status, 'percentage', ls.pulse_percentage, 'color', ls.pulse_color) AS pulse,
        ls.secret_tip AS secret, ls.tags, ls.image_url AS image,
        k.verification_count AS "verifiedBy", k.comment_count AS comments, ls.quote
       FROM knowledge_nodes k
       JOIN lifestyle_nodes ls ON k.id = ls.node_id
       WHERE k.id = $1 AND k.category = 'Lifestyle'`,
      [id]
    );

    if (spotRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lifestyle spot not found.' });
    }

    res.status(200).json({
      success: true,
      data: spotRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
