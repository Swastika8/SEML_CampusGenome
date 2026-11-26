import pool from '../config/db.js';
import { createRsvpCalendar } from '../lib/calendarExport.js';

export const MAX_EXPORT_ITEMS = 1000;

function tooMany(res, collection) {
  return res.status(413).json({
    success: false,
    message: `This ${collection} export contains more than ${MAX_EXPORT_ITEMS} items. Export is limited to ${MAX_EXPORT_ITEMS} items; no partial file was created.`,
  });
}

function isoTimestamp(value) {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export const exportPocket = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT k.id,k.category,k.title,k.description,k.created_at,
        u.name AS author_name,b.created_at AS saved_at
       FROM bookmarks b
       JOIN knowledge_nodes k ON k.id=b.node_id
       LEFT JOIN users u ON u.id=k.user_id
       WHERE b.user_id=$1 AND k.status!='Removed'
       ORDER BY b.created_at DESC NULLS LAST,k.id DESC
       LIMIT $2`,
      [req.user.id, MAX_EXPORT_ITEMS + 1],
    );
    if (rows.length > MAX_EXPORT_ITEMS) return tooMany(res, 'pocket');
    const items = rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description || '',
      authorName: row.author_name || 'Campus contributor',
      path: '/nodes/' + row.id,
      createdAt: isoTimestamp(row.created_at),
      savedAt: isoTimestamp(row.saved_at),
    }));
    res.attachment('campus-genome-pocket.json');
    res.json({
      success: true,
      data: { generatedAt: new Date().toISOString(), count: items.length, items },
    });
  } catch (err) {
    next(err);
  }
};

export const exportCalendar = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT k.id,k.title,k.description,e.event_date,e.venue
       FROM event_attendees a
       JOIN event_nodes e ON e.node_id=a.node_id
       JOIN knowledge_nodes k ON k.id=e.node_id
       WHERE a.user_id=$1 AND k.status!='Removed'
       ORDER BY e.event_date ASC,k.id ASC
       LIMIT $2`,
      [req.user.id, MAX_EXPORT_ITEMS + 1],
    );
    if (rows.length > MAX_EXPORT_ITEMS) return tooMany(res, 'calendar');
    const { content, skipped } = createRsvpCalendar(rows);
    res.set('X-Campus-Skipped-Events', String(skipped));
    res.attachment('campus-genome-rsvps.ics');
    res.type('text/calendar; charset=utf-8').send(content);
  } catch (err) {
    next(err);
  }
};
