import { transaction } from '../config/db.js';
import { forumError, lockVisiblePost } from '../lib/forumData.js';
import { updateRank } from './nodeController.js';

async function changeVote(req, res, next, toggle) {
  try {
    const data = await transaction(async (client) => {
      const post = await lockVisiblePost(client, req.params.id);
      if (post.user_id === req.user.id) throw forumError(403, 'You can’t vote on your own post.');
      const params = [post.id, req.user.id];
      const {
        rows: [existing],
      } = await client.query(
        `SELECT EXISTS(SELECT 1 FROM verifications WHERE node_id=$1 AND user_id=$2) AS up,
                EXISTS(SELECT 1 FROM forum_downvotes WHERE node_id=$1 AND user_id=$2) AS down`,
        params,
      );
      const value = toggle ? (existing.up ? 0 : 1) : req.body.value;
      const upDelta = Number(value === 1) - Number(existing.up);
      const downDelta = Number(value === -1) - Number(existing.down);
      let ups = post.verification_count || 0;
      let downs = post.downvote_count;
      if (upDelta || downDelta) {
        if (upDelta === 1)
          await client.query('INSERT INTO verifications (node_id,user_id) VALUES ($1,$2)', params);
        if (upDelta === -1)
          await client.query('DELETE FROM verifications WHERE node_id=$1 AND user_id=$2', params);
        if (downDelta === 1)
          await client.query(
            'INSERT INTO forum_downvotes (node_id,user_id) VALUES ($1,$2)',
            params,
          );
        if (downDelta === -1)
          await client.query('DELETE FROM forum_downvotes WHERE node_id=$1 AND user_id=$2', params);
        const {
          rows: [totals],
        } = await client.query(
          `UPDATE knowledge_nodes SET verification_count=GREATEST(0,COALESCE(verification_count,0)+$1),
               downvote_count=GREATEST(0,downvote_count+$2),updated_at=NOW()
           WHERE id=$3 RETURNING verification_count,downvote_count`,
          [upDelta, downDelta, post.id],
        );
        ups = totals.verification_count;
        downs = totals.downvote_count;
        if (upDelta) {
          await client.query(
            'UPDATE users SET reputation_score=GREATEST(0,reputation_score+$1) WHERE id=$2',
            [upDelta * 5, post.user_id],
          );
          await updateRank(client, post.user_id);
        }
      }
      return { value, score: ups - downs, verificationCount: ups, isVerified: value === 1 };
    });
    res.json({
      success: true,
      data: toggle
        ? { isVerified: data.isVerified, verificationCount: data.verificationCount }
        : data,
    });
  } catch (error) {
    next(error);
  }
}

export const toggleVerification = (req, res, next) => changeVote(req, res, next, true);
export const setPostVote = (req, res, next) => changeVote(req, res, next, false);
