import pool from '../config/db.js';

// Helper function to update user rank according to reputation
const updateUserRank = async (client, userId) => {
  const repRes = await client.query('SELECT reputation_score FROM users WHERE id = $1', [userId]);
  if (repRes.rows.length === 0) return;
  const rep = repRes.rows[0].reputation_score;
  let rank = 'Helix';
  if (rep >= 250) {
    rank = 'Nucleus';
  } else if (rep >= 100) {
    rank = 'Chromosome';
  }
  await client.query('UPDATE users SET rank = $1 WHERE id = $2', [rank, userId]);
};

export const getAllNodes = async (req, res, next) => {
  try {
    const { category, status, search, sort, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`k.category ILIKE $${paramIndex++}`);
      params.push(category);
    }

    if (status) {
      conditions.push(`k.status = $${paramIndex++}`);
      params.push(status);
    } else {
      // By default do not return 'Removed' nodes
      conditions.push(`k.status != 'Removed'`);
    }

    if (search) {
      conditions.push(`(k.title ILIKE $${paramIndex} OR k.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    let orderBy = 'k.created_at DESC';
    if (sort === 'trending') {
      orderBy = 'k.verification_count DESC, k.comment_count DESC, k.created_at DESC';
    } else if (sort === 'top_verified') {
      orderBy = 'k.verification_count DESC';
    } else if (sort === 'oldest') {
      orderBy = 'k.created_at ASC';
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryText = `
      SELECT 
        k.id, k.category, k.title, k.description, k.status, 
        k.verification_count, k.comment_count, k.is_flagged, k.created_at, k.updated_at,
        u.id AS author_id, u.name AS author_name, u.handle AS author_handle, u.rank AS author_rank,
        -- JSON aggregates of child details if present
        COALESCE(to_jsonb(ev.*) - 'node_id', '{}'::jsonb) AS event_details,
        COALESCE(to_jsonb(ls.*) - 'node_id', '{}'::jsonb) AS lifestyle_details,
        COALESCE(to_jsonb(cr.*) - 'node_id', '{}'::jsonb) AS career_details,
        COALESCE(to_jsonb(ac.*) - 'node_id', '{}'::jsonb) AS academic_details,
        COALESCE(to_jsonb(cm.*) - 'node_id', '{}'::jsonb) AS community_details
      FROM knowledge_nodes k
      LEFT JOIN users u ON k.user_id = u.id
      LEFT JOIN event_nodes ev ON k.id = ev.node_id
      LEFT JOIN lifestyle_nodes ls ON k.id = ls.node_id
      LEFT JOIN career_nodes cr ON k.id = cr.node_id
      LEFT JOIN academic_nodes ac ON k.id = ac.node_id
      LEFT JOIN community_nodes cm ON k.id = cm.node_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    params.push(parseInt(limit, 10), offset);

    const countQuery = `
      SELECT COUNT(*) FROM knowledge_nodes k
      ${whereClause};
    `;
    const countParams = params.slice(0, paramIndex - 3);

    const [nodesRes, countRes] = await Promise.all([
      pool.query(queryText, params),
      pool.query(countQuery, countParams),
    ]);

    const total = parseInt(countRes.rows[0].count, 10);

    res.status(200).json({
      success: true,
      data: nodesRes.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getNodeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || null;

    const queryText = `
      SELECT 
        k.id, k.category, k.title, k.description, k.status, 
        k.verification_count, k.comment_count, k.is_flagged, k.created_at, k.updated_at,
        u.id AS author_id, u.name AS author_name, u.handle AS author_handle, u.rank AS author_rank, u.avatar_url AS author_avatar,
        COALESCE(to_jsonb(ev.*) - 'node_id', null) AS event_details,
        COALESCE(to_jsonb(ls.*) - 'node_id', null) AS lifestyle_details,
        COALESCE(to_jsonb(cr.*) - 'node_id', null) AS career_details,
        COALESCE(to_jsonb(ac.*) - 'node_id', null) AS academic_details,
        COALESCE(to_jsonb(cm.*) - 'node_id', null) AS community_details,
        EXISTS(SELECT 1 FROM verifications v WHERE v.node_id = k.id AND v.user_id = $2) AS is_verified_by_me
      FROM knowledge_nodes k
      LEFT JOIN users u ON k.user_id = u.id
      LEFT JOIN event_nodes ev ON k.id = ev.node_id
      LEFT JOIN lifestyle_nodes ls ON k.id = ls.node_id
      LEFT JOIN career_nodes cr ON k.id = cr.node_id
      LEFT JOIN academic_nodes ac ON k.id = ac.node_id
      LEFT JOIN community_nodes cm ON k.id = cm.node_id
      WHERE k.id = $1;
    `;

    const nodeRes = await pool.query(queryText, [id, currentUserId]);

    if (nodeRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Knowledge node not found.' });
    }

    // Also fetch comments
    const commentsRes = await pool.query(
      `SELECT c.id, c.text, c.author_name, c.created_at, u.handle AS author_handle, u.rank AS author_rank
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.node_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...nodeRes.rows[0],
        comments: commentsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createNode = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = req.user?.id || 1; // Defaults to StudentJohn if guest
    const {
      category,
      title,
      description,
      // Academics fields
      department,
      year,
      subject,
      insight,
      // Events fields
      eventDate,
      eventTime,
      eventLocation,
      eventDetails,
      publisher,
      imageUrl,
      // Lifestyle fields
      spotName,
      secret,
      tags,
      lifestyleCategory,
      pulseStatus,
      pulsePercentage,
      pulseColor,
      quote,
      // Career fields
      domain,
      companyRole,
      opportunityType,
      statsOrPackage,
      applyLink,
      // Community fields
      clubName,
      updateType,
      communityDetails,
      membersCount,
      nextMeeting,
    } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    // Determine default node title and description based on category if not explicitly provided
    let nodeTitle = title;
    let nodeDesc = description;

    if (!nodeTitle) {
      if (category === 'Academics') nodeTitle = `${department || 'General'} ${year || ''} - ${subject || 'Academic Insight'}`;
      else if (category === 'Events') nodeTitle = req.body.eventTitle || 'Campus Event';
      else if (category === 'Lifestyle') nodeTitle = spotName || 'Campus Spot';
      else if (category === 'Career') nodeTitle = `${domain || 'Career'}: ${companyRole || 'Opportunity'}`;
      else if (category === 'Communities') nodeTitle = `${clubName || 'Student Community'} Update`;
      else nodeTitle = 'New Contribution';
    }

    if (!nodeDesc) {
      nodeDesc = insight || eventDetails || secret || communityDetails || description || '';
    }

    // 1. Insert core knowledge node
    const insertNodeSql = `
      INSERT INTO knowledge_nodes (user_id, category, title, description, status, verification_count, comment_count)
      VALUES ($1, $2, $3, $4, 'Published', 0, 0)
      RETURNING id, category, title, description, status, verification_count, comment_count, created_at;
    `;
    const nodeResult = await client.query(insertNodeSql, [userId, category, nodeTitle, nodeDesc]);
    const newNode = nodeResult.rows[0];
    const nodeId = newNode.id;

    // 2. Insert category-specific details
    const normalizedCategory = category.toLowerCase();

    if (normalizedCategory === 'academics') {
      await client.query(
        `INSERT INTO academic_nodes (node_id, department, year, subject, insight_type)
         VALUES ($1, $2, $3, $4, $5);`,
        [nodeId, department || 'CS', year || 'FY', subject || 'General', 'Exam Strategy']
      );
    } else if (normalizedCategory === 'events') {
      await client.query(
        `INSERT INTO event_nodes (node_id, event_date, event_time, venue, publisher, publisher_logo, event_type, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          nodeId,
          eventDate || 'Upcoming',
          eventTime || 'TBA',
          eventLocation || 'Main Campus',
          publisher || 'Student Contributor',
          'SC',
          'C',
          imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
        ]
      );
    } else if (normalizedCategory === 'lifestyle') {
      await client.query(
        `INSERT INTO lifestyle_nodes (node_id, spot_name, location, lifestyle_category, pulse_status, pulse_percentage, pulse_color, secret_tip, tags, image_url, quote)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          nodeId,
          spotName || nodeTitle,
          req.body.location || 'Campus Grounds',
          lifestyleCategory || 'canteens',
          pulseStatus || 'Open',
          pulsePercentage || 50,
          pulseColor || 'bg-green-500',
          secret || nodeDesc,
          tags || ['Price: ₹', 'Vibe: Chill'],
          imageUrl || 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80',
          quote || 'Recommended by students.',
        ]
      );
    } else if (normalizedCategory === 'career') {
      await client.query(
        `INSERT INTO career_nodes (node_id, domain, company, role, opportunity_type, stats_or_package, opportunity_status, apply_link, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          nodeId,
          domain || 'Technology',
          req.body.company || companyRole || 'Top Firm',
          companyRole || 'Associate / Intern',
          opportunityType || 'Placement Drive',
          statsOrPackage || 'Competitive Package',
          'Upcoming',
          applyLink || 'https://campus.edu/careers',
          imageUrl || null,
        ]
      );
    } else if (normalizedCategory === 'communities') {
      await client.query(
        `INSERT INTO community_nodes (node_id, club_name, update_type, members_count, next_meeting, club_status, category, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          nodeId,
          clubName || nodeTitle,
          updateType || 'Announcement',
          membersCount || 50,
          nextMeeting || 'Next Friday, 5 PM',
          'Open',
          req.body.communityCategory || 'Technology',
          imageUrl || null,
        ]
      );
    }

    // 3. Award +10 reputation points to the contributor
    await client.query('UPDATE users SET reputation_score = reputation_score + 10 WHERE id = $1', [userId]);
    await updateUserRank(client, userId);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Knowledge node contributed successfully! +10 Reputation points awarded.',
      data: {
        id: nodeId,
        category,
        title: nodeTitle,
        description: nodeDesc,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

export const deleteNode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check ownership or admin
    const checkRes = await pool.query('SELECT user_id FROM knowledge_nodes WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Node not found.' });
    }

    if (checkRes.rows[0].user_id !== userId && userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this node.' });
    }

    await pool.query('DELETE FROM knowledge_nodes WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: 'Knowledge node deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
