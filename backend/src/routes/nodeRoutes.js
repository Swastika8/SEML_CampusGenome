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
import { toggleVerification } from '../controllers/verificationController.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';
import {
  validate,
  numericId,
  nodeSchema,
  commentSchema,
  listSchema,
} from '../middleware/validate.js';
const router = Router();
router.get('/', optionalAuth, validate(listSchema, 'query'), getAllNodes);
router.post('/', authenticateToken, validate(nodeSchema), createNode);
router.get('/:id', numericId(), optionalAuth, getNodeById);
router.delete('/:id', numericId(), authenticateToken, deleteNode);
router.post('/:id/verify', numericId(), authenticateToken, toggleVerification);
router.put('/:id/bookmark', numericId(), authenticateToken, setBookmark);
router.delete('/:id/bookmark', numericId(), authenticateToken, setBookmark);
router.put('/:id/rsvp', numericId(), authenticateToken, setRsvp);
router.delete('/:id/rsvp', numericId(), authenticateToken, setRsvp);
router.get('/:nodeId/comments', numericId('nodeId'), getCommentsByNodeId);
router.post(
  '/:nodeId/comments',
  numericId('nodeId'),
  authenticateToken,
  validate(commentSchema),
  addComment,
);
export default router;
