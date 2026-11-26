import pool, { transaction } from '../config/db.js';
import {
  forumCommunityJoins,
  forumError,
  isSiteModerator,
  lockVisiblePost,
} from '../lib/forumData.js';
import { removePost } from './nodeController.js';

const communityColumns = `fc.id,fc.slug,fc.name,fc.campus,fc.description,fc.default_category,fc.created_at,
  COALESCE(fc.owner_id=$1,false) AS is_owner,
  EXISTS(SELECT 1 FROM forum_memberships m WHERE m.community_id=fc.id AND m.user_id=$1) AS is_joined,
  (SELECT COUNT(*)::int FROM forum_memberships m WHERE m.community_id=fc.id) AS member_count`;

async function communityBySlug(client, slug, userId) {
  const {
    rows: [community],
  } = await client.query(`SELECT ${communityColumns} FROM forum_communities fc WHERE fc.slug=$2`, [
    userId,
    slug,
  ]);
  if (!community) throw forumError(404, 'Community not found.');
  return community;
}

export async function listCommunities(req, res, next) {
  try {
    const { search, campus, joined, page, limit } = req.query;
    if (joined === 'true' && !req.user) throw forumError(401, 'Sign in to see joined communities.');
    const params = [req.user?.id ?? null];
    const filters = [];
    if (search) {
      const pattern = params.push('%' + search.replace(/[\\%_]/g, '\\$&') + '%');
      filters.push(
        `(fc.name ILIKE $${pattern} OR fc.slug ILIKE $${pattern} OR fc.campus ILIKE $${pattern})`,
      );
    }
    if (campus) filters.push(`LOWER(fc.campus)=LOWER($${params.push(campus)})`);
    if (joined === 'true')
      filters.push(
        'EXISTS(SELECT 1 FROM forum_memberships m WHERE m.community_id=fc.id AND m.user_id=$1)',
      );
    const selection = `SELECT ${communityColumns} FROM forum_communities fc${filters.length ? ' WHERE ' + filters.join(' AND ') : ''}`;
    const offset = (page - 1) * limit;
    const limitParam = params.push(limit + 1);
    const offsetParam = params.push(offset);
    const { rows } = await pool.query(
      `${selection} ORDER BY member_count DESC,fc.id ASC LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params,
    );
    res.json({ success: true, data: rows.slice(0, limit), hasMore: rows.length > limit });
  } catch (error) {
    next(error);
  }
}

export async function getCommunity(req, res, next) {
  try {
    const data = await communityBySlug(pool, req.params.slug, req.user?.id ?? null);
    const {
      rows: [{ post_count }],
    } = await pool.query(
      `SELECT COUNT(*)::int AS post_count FROM knowledge_nodes k
       WHERE k.status!='Removed' AND (k.forum_community_id=$1 OR (k.forum_community_id IS NULL AND k.category=$2))`,
      [data.id, data.default_category],
    );
    res.json({ success: true, data: { ...data, post_count } });
  } catch (error) {
    next(error);
  }
}

export async function createCommunity(req, res, next) {
  try {
    const { slug, name, campus, description } = req.body;
    const data = await transaction(async (client) => {
      await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [req.user.id]);
      const {
        rows: [{ count }],
      } = await client.query(
        'SELECT COUNT(*)::int AS count FROM forum_communities WHERE owner_id=$1',
        [req.user.id],
      );
      if (count >= 8) throw forumError(400, 'Each account can start up to eight communities.');
      const {
        rows: [community],
      } = await client.query(
        'INSERT INTO forum_communities (slug,name,campus,description,owner_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING RETURNING id',
        [slug, name, campus, description, req.user.id],
      );
      if (!community) return null;
      await client.query('INSERT INTO forum_memberships (community_id,user_id) VALUES ($1,$2)', [
        community.id,
        req.user.id,
      ]);
      return communityBySlug(client, slug, req.user.id);
    });
    if (!data)
      return res.status(409).json({
        success: false,
        message: 'That community address is taken. Choose another address.',
      });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function setMembership(req, res, next) {
  try {
    const data = await transaction(async (client) => {
      const { id } = await communityBySlug(client, req.params.slug, req.user.id);
      const sql =
        req.method === 'PUT'
          ? 'INSERT INTO forum_memberships (community_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING'
          : 'DELETE FROM forum_memberships WHERE community_id=$1 AND user_id=$2';
      await client.query(sql, [id, req.user.id]);
      return communityBySlug(client, req.params.slug, req.user.id);
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function reportPost(req, res, next) {
  try {
    await transaction(async (client) => {
      const post = await lockVisiblePost(client, req.params.id);
      if (post.user_id === req.user.id)
        throw forumError(400, 'You can remove your own post from its menu.');
      await client.query(
        'INSERT INTO forum_reports (node_id,reporter_id,reason) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [post.id, req.user.id, req.body.reason],
      );
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function listReports(req, res, next) {
  try {
    const siteModerator = isSiteModerator(req.user);
    if (!siteModerator) {
      const { rows } = await pool.query(
        'SELECT id FROM forum_communities WHERE owner_id=$1 LIMIT 1',
        [req.user.id],
      );
      if (!rows.length)
        throw forumError(403, 'Only moderators and community owners can review reports.');
    }
    const { rows } = await pool.query(
      `SELECT k.id,k.title,fc.slug AS community_slug,COUNT(*)::int AS report_count,
         array_agg(DISTINCT r.reason ORDER BY r.reason) AS reasons,MIN(r.created_at) AS reported_at
       FROM forum_reports r JOIN knowledge_nodes k ON k.id=r.node_id ${forumCommunityJoins}
       WHERE r.resolved_at IS NULL AND k.status!='Removed' AND ($2::boolean OR fc.owner_id=$1)
       GROUP BY k.id,k.title,fc.slug ORDER BY reported_at,k.id LIMIT 50`,
      [req.user.id, siteModerator],
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function reviewReport(req, res, next) {
  try {
    await transaction(async (client) => {
      const post = await lockVisiblePost(client, req.params.id);
      if (!isSiteModerator(req.user) && post.community_owner_id !== req.user.id)
        throw forumError(403, 'You can only review reports in communities you moderate.');
      const result = await client.query(
        'UPDATE forum_reports SET resolved_at=NOW() WHERE node_id=$1 AND resolved_at IS NULL RETURNING node_id',
        [post.id],
      );
      if (!result.rows.length) throw forumError(404, 'This report has already been reviewed.');
      if (req.body.action === 'remove') await removePost(client, post);
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
