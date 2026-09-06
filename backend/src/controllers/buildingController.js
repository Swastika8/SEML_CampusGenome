import pool from '../config/db.js';

export const getBuildings = async (req, res, next) => {
  try {
    const buildingsRes = await pool.query(`
      SELECT 
        id,
        name,
        description,
        category,
        json_build_object(
          'wifi', wifi,
          'quietSpots', quiet_spots,
          'history', history
        ) AS details
      FROM buildings
      ORDER BY id ASC;
    `);

    res.status(200).json({
      success: true,
      data: buildingsRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getBuildingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buildingRes = await pool.query(
      `SELECT 
        id, name, description, category,
        json_build_object('wifi', wifi, 'quietSpots', quiet_spots, 'history', history) AS details
       FROM buildings WHERE id = $1`,
      [id]
    );

    if (buildingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Building not found.' });
    }

    res.status(200).json({
      success: true,
      data: buildingRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const addBuildingHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { change, author } = req.body;

    if (!change) {
      return res.status(400).json({ success: false, message: 'Change description is required.' });
    }

    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      change,
      author: author || req.user?.handle || '@Anonymous',
    };

    const updateRes = await pool.query(
      `UPDATE buildings 
       SET history = history || $1::jsonb 
       WHERE id = $2
       RETURNING id, name, history;`,
      [JSON.stringify([newEntry]), id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Building not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Building history updated.',
      data: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
