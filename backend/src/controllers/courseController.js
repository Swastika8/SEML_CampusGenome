import pool from '../config/db.js';

export const getCourses = async (req, res, next) => {
  try {
    const coursesRes = await pool.query(`
      SELECT 
        id,
        code,
        name,
        description,
        category,
        professor,
        json_build_object(
          'difficulty', difficulty,
          'practicalFocus', practical_focus,
          'history', history,
          'reviews', reviews
        ) AS details
      FROM courses
      ORDER BY id ASC;
    `);

    res.status(200).json({
      success: true,
      data: coursesRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const courseRes = await pool.query(
      `SELECT 
        id, code, name, description, category, professor,
        json_build_object(
          'difficulty', difficulty,
          'practicalFocus', practical_focus,
          'history', history,
          'reviews', reviews
        ) AS details
       FROM courses WHERE id = $1`,
      [id]
    );

    if (courseRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.status(200).json({
      success: true,
      data: courseRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const addCourseReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user?.handle || req.body.author || '@Student';

    if (!content) {
      return res.status(400).json({ success: false, message: 'Review content is required.' });
    }

    const newReview = {
      author,
      content,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    const updateRes = await pool.query(
      `UPDATE courses 
       SET reviews = reviews || $1::jsonb 
       WHERE id = $2
       RETURNING id, code, name, reviews;`,
      [JSON.stringify([newReview]), id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Course review added.',
      data: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
