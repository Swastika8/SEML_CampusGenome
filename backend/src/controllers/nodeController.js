import pool, { transaction } from '../config/db.js';

export const nodeSelect = `SELECT k.*, u.name AS author_name, u.handle AS author_handle, u.rank AS author_rank,
  to_jsonb(ev.*) AS event_details, to_jsonb(ls.*) AS lifestyle_details, to_jsonb(cr.*) AS career_details,
  to_jsonb(ac.*) AS academic_details, to_jsonb(cm.*) AS community_details,
  EXISTS(SELECT 1 FROM verifications v WHERE v.node_id=k.id AND v.user_id=$1) AS is_verified_by_me,
  EXISTS(SELECT 1 FROM bookmarks b WHERE b.node_id=k.id AND b.user_id=$1) AS is_saved,
  EXISTS(SELECT 1 FROM event_attendees a WHERE a.node_id=k.id AND a.user_id=$1) AS is_attending,
  (SELECT COUNT(*)::int FROM event_attendees a WHERE a.node_id=k.id) AS attendee_count
  FROM knowledge_nodes k LEFT JOIN users u ON u.id=k.user_id
  LEFT JOIN event_nodes ev ON ev.node_id=k.id LEFT JOIN lifestyle_nodes ls ON ls.node_id=k.id
  LEFT JOIN career_nodes cr ON cr.node_id=k.id LEFT JOIN academic_nodes ac ON ac.node_id=k.id
  LEFT JOIN community_nodes cm ON cm.node_id=k.id`;
export const updateRank = (client, userId) =>
  client.query(
    `UPDATE users SET rank=CASE WHEN reputation_score>=250 THEN 'Nucleus' WHEN reputation_score>=100 THEN 'Chromosome' ELSE 'Helix' END WHERE id=$1`,
    [userId],
  );

export const getAllNodes = async (req, res, next) => {
  try {
    const { category, search, sort, page, limit, saved, status, department, year } = req.query;
    if (saved === 'true' && !req.user)
      return res.status(401).json({ success: false, message: 'Sign in to see your saved items.' });
    const params = [req.user?.id || null];
    const conditions = ["k.status != 'Removed'"];
    const add = (clause, value) => {
      params.push(value);
      conditions.push(clause.replace('?', '$' + params.length));
    };
    if (category) add('k.category = ?', category);
    if (department) add('ac.department = ?', department);
    if (year) add('ac.year = ?', year);
    if (status) add('k.status = ?', status);
    if (search) {
      params.push('%' + search.replace(/[\\%_]/g, '\\$&') + '%');
      conditions.push(
        '(k.title ILIKE $' + params.length + ' OR k.description ILIKE $' + params.length + ')',
      );
    }
    if (saved === 'true')
      conditions.push('EXISTS(SELECT 1 FROM bookmarks b WHERE b.node_id=k.id AND b.user_id=$1)');
    const where = ' WHERE ' + conditions.join(' AND ');
    const orders = {
      recent: 'k.created_at DESC,k.id DESC',
      oldest: 'k.created_at ASC,k.id ASC',
      trending: '(k.verification_count*2+k.comment_count) DESC,k.id DESC',
      top_verified: 'k.verification_count DESC,k.id DESC',
    };
    // Count uses the same joins and parameters, including the personalization parameter.
    const all = nodeSelect + where;
    const count = await pool.query(
      'SELECT COUNT(*)::int AS total FROM (' + all + ') filtered',
      params,
    );
    params.push(limit, (page - 1) * limit);
    const result = await pool.query(
      all +
        ' ORDER BY ' +
        orders[sort] +
        ' LIMIT $' +
        (params.length - 1) +
        ' OFFSET $' +
        params.length,
      params,
    );
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: count.rows[0].total,
        page,
        limit,
        totalPages: Math.ceil(count.rows[0].total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getNodeById = async (req, res, next) => {
  try {
    const result = await pool.query(nodeSelect + " WHERE k.id=$2 AND k.status!='Removed'", [
      req.user?.id || null,
      req.params.id,
    ]);
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Contribution not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
export const createNode = async (req, res, next) => {
  try {
    const data = await transaction(async (client) => {
      const b = req.body;
      const inserted = await client.query(
        'INSERT INTO knowledge_nodes (user_id,category,title,description) VALUES ($1,$2,$3,$4) RETURNING *',
        [req.user.id, b.category, b.title, b.description],
      );
      const node = inserted.rows[0],
        id = node.id;
      if (b.category === 'Academics')
        await client.query(
          'INSERT INTO academic_nodes (node_id,department,year,subject,insight_type) VALUES ($1,$2,$3,$4,$5)',
          [
            id,
            b.department || 'General',
            b.year || 'All Years',
            b.subject || b.title,
            'Student guide',
          ],
        );
      if (b.category === 'Events')
        await client.query(
          'INSERT INTO event_nodes (node_id,event_date,event_time,venue,publisher,image_url) VALUES ($1,$2,$3,$4,$5,$6)',
          [
            id,
            b.eventDate,
            b.eventTime || 'Time to be confirmed',
            b.eventLocation || 'Campus',
            req.user.name,
            b.imageUrl || null,
          ],
        );
      if (b.category === 'Lifestyle')
        await client.query(
          'INSERT INTO lifestyle_nodes (node_id,spot_name,location,lifestyle_category,secret_tip,tags,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [
            id,
            b.spotName || b.title,
            b.location || 'Campus',
            'student-spots',
            b.secret || b.description,
            b.tags || [],
            b.imageUrl || null,
          ],
        );
      if (b.category === 'Career')
        await client.query(
          'INSERT INTO career_nodes (node_id,domain,company,role,opportunity_type,stats_or_package,apply_link,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [
            id,
            b.domain || 'Career development',
            b.company || 'Campus network',
            b.companyRole || b.title,
            b.opportunityType || 'Opportunity',
            b.statsOrPackage || '',
            b.applyLink || null,
            b.imageUrl || null,
          ],
        );
      if (b.category === 'Communities')
        await client.query(
          'INSERT INTO community_nodes (node_id,club_name,category,next_meeting) VALUES ($1,$2,$3,$4)',
          [
            id,
            b.clubName || b.title,
            b.communityCategory || 'Student community',
            b.nextMeeting || 'Ask the organizer',
          ],
        );
      await client.query('UPDATE users SET reputation_score=reputation_score+10 WHERE id=$1', [
        req.user.id,
      ]);
      await updateRank(client, req.user.id);
      return node;
    });
    res.status(201).json({
      success: true,
      data,
      message: 'Your contribution is published. +10 reputation points!',
    });
  } catch (err) {
    next(err);
  }
};
export const deleteNode = async (req, res, next) => {
  try {
    await transaction(async (client) => {
      const found = await client.query(
        "SELECT user_id,verification_count FROM knowledge_nodes WHERE id=$1 AND status!='Removed' FOR UPDATE",
        [req.params.id],
      );
      if (!found.rows.length)
        throw Object.assign(new Error('Contribution not found.'), { status: 404 });
      if (found.rows[0].user_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role))
        throw Object.assign(new Error('You can only remove your own contributions.'), {
          status: 403,
        });
      await client.query(
        "UPDATE knowledge_nodes SET status='Removed', updated_at=NOW() WHERE id=$1",
        [req.params.id],
      );
      await client.query(
        'UPDATE users SET reputation_score=GREATEST(0,reputation_score-$1) WHERE id=$2',
        [10 + found.rows[0].verification_count * 5, found.rows[0].user_id],
      );
      await updateRank(client, found.rows[0].user_id);
    });
    res.json({ success: true, message: 'Contribution removed.' });
  } catch (err) {
    next(err);
  }
};
export const setBookmark = async (req, res, next) => {
  try {
    const found = await pool.query(
      "SELECT id FROM knowledge_nodes WHERE id=$1 AND status!='Removed'",
      [req.params.id],
    );
    if (!found.rows.length)
      return res.status(404).json({ success: false, message: 'Contribution not found.' });
    const saved = req.method === 'PUT';
    if (saved)
      await pool.query(
        'INSERT INTO bookmarks (user_id,node_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.user.id, req.params.id],
      );
    else
      await pool.query('DELETE FROM bookmarks WHERE user_id=$1 AND node_id=$2', [
        req.user.id,
        req.params.id,
      ]);
    res.json({ success: true, data: { is_saved: saved } });
  } catch (err) {
    next(err);
  }
};
export const setRsvp = async (req, res, next) => {
  try {
    const found = await pool.query(
      "SELECT k.id,ev.event_date FROM knowledge_nodes k JOIN event_nodes ev ON ev.node_id=k.id WHERE k.id=$1 AND k.status!='Removed'",
      [req.params.id],
    );
    if (!found.rows.length)
      return res.status(404).json({ success: false, message: 'Event not found.' });
    const attending = req.method === 'PUT';
    if (attending && new Date(found.rows[0].event_date) < new Date(new Date().setHours(0, 0, 0, 0)))
      return res.status(400).json({ success: false, message: 'This event has already ended.' });
    if (attending)
      await pool.query(
        'INSERT INTO event_attendees (user_id,node_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [req.user.id, req.params.id],
      );
    else
      await pool.query('DELETE FROM event_attendees WHERE user_id=$1 AND node_id=$2', [
        req.user.id,
        req.params.id,
      ]);
    res.json({ success: true, data: { is_attending: attending } });
  } catch (err) {
    next(err);
  }
};
