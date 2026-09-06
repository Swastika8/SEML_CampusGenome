import pool from '../config/db.js';

export const getEvents = async (req, res, next) => {
  try {
    const eventsRes = await pool.query(`
      SELECT 
        k.id,
        ev.event_type AS type,
        k.title,
        k.description,
        ev.event_date AS date,
        ev.publisher,
        ev.publisher_logo AS "publisherLogo",
        '2h' AS "timeAgo",
        ev.image_url AS image,
        ev.venue,
        k.verification_count AS "verifyCount",
        k.comment_count AS "commentCount",
        'News' AS category
      FROM knowledge_nodes k
      JOIN event_nodes ev ON k.id = ev.node_id
      WHERE k.category = 'Events' AND k.status != 'Removed'
      ORDER BY k.created_at DESC;
    `);

    // Top engaging list
    const topEngaging = eventsRes.rows.slice(0, 3).map((item) => ({
      id: item.id,
      title: item.title,
      timeAgo: '3h',
      comments: item.commentCount,
    }));

    res.status(200).json({
      success: true,
      data: eventsRes.rows,
      topEngaging,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventRes = await pool.query(
      `SELECT 
        k.id, k.title, k.description, k.verification_count AS "verifyCount", k.comment_count AS "commentCount",
        ev.event_date AS date, ev.event_time AS time, ev.venue, ev.publisher, ev.publisher_logo AS "publisherLogo",
        ev.image_url AS image, ev.event_type AS type
       FROM knowledge_nodes k
       JOIN event_nodes ev ON k.id = ev.node_id
       WHERE k.id = $1 AND k.category = 'Events'`,
      [id]
    );

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.status(200).json({
      success: true,
      data: eventRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
