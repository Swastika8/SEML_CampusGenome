// Legacy posts resolve to their category's forum without rewriting existing rows.
export const forumCommunityJoins = `
  LEFT JOIN forum_communities category_forum ON category_forum.default_category=k.category
  LEFT JOIN forum_communities fc ON fc.id=COALESCE(k.forum_community_id,category_forum.id)`;

export const voteScore = '(COALESCE(k.verification_count,0)-k.downvote_count)';

export function forumError(status, message) {
  return Object.assign(new Error(message), { status });
}

export function isSiteModerator(user) {
  return ['admin', 'moderator'].includes(user?.role);
}

export async function lockVisiblePost(client, id) {
  const { rows } = await client.query(
    `SELECT k.id,k.user_id,k.verification_count,k.downvote_count,fc.owner_id AS community_owner_id
     FROM knowledge_nodes k ${forumCommunityJoins}
     WHERE k.id=$1 AND k.status!='Removed' FOR UPDATE OF k`,
    [id],
  );
  if (!rows[0]) throw forumError(404, 'Post not found.');
  return rows[0];
}
