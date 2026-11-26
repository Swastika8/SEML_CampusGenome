import { Router } from 'express';
import {
  getAllNodes,
  getNodeById,
  createNode,
  deleteNode,
  setBookmark,
  setRsvp,
} from '../controllers/nodeController.js';
import { getCommentsByNodeId, addComment } from '../controllers/commentController.js';
import { setPostVote, toggleVerification } from '../controllers/verificationController.js';
import { reportPost } from '../controllers/forumController.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';
import {
  validate,
  numericId,
  nodeSchema,
  commentSchema,
  commentListSchema,
  listSchema,
  postVoteSchema,
  postReportSchema,
} from '../middleware/validate.js';
const router = Router();
router.use((_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});
router.get('/', optionalAuth, validate(listSchema, 'query'), getAllNodes);
router.post('/', authenticateToken, validate(nodeSchema), createNode);
router.get('/:id', numericId(), optionalAuth, getNodeById);
router.delete('/:id', numericId(), authenticateToken, deleteNode);
router.post('/:id/verify', numericId(), authenticateToken, toggleVerification);
router.put('/:id/vote', numericId(), authenticateToken, validate(postVoteSchema), setPostVote);
router.put('/:id/report', numericId(), authenticateToken, validate(postReportSchema), reportPost);
router.put('/:id/bookmark', numericId(), authenticateToken, setBookmark);
router.delete('/:id/bookmark', numericId(), authenticateToken, setBookmark);
router.put('/:id/rsvp', numericId(), authenticateToken, setRsvp);
router.delete('/:id/rsvp', numericId(), authenticateToken, setRsvp);
router.get(
  '/:nodeId/comments',
  numericId('nodeId'),
  validate(commentListSchema, 'query'),
  getCommentsByNodeId,
);
router.post(
  '/:nodeId/comments',
  numericId('nodeId'),
  authenticateToken,
  validate(commentSchema),
  addComment,
);
export default router;
