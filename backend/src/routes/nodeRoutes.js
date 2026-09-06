import { Router } from 'express';
import { getAllNodes, getNodeById, createNode, deleteNode } from '../controllers/nodeController.js';
import { getCommentsByNodeId, addComment } from '../controllers/commentController.js';
import { toggleVerification } from '../controllers/verificationController.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';

const router = Router();

// Knowledge Nodes List & Details
router.get('/', optionalAuth, getAllNodes);
router.get('/:id', optionalAuth, getNodeById);
router.post('/', optionalAuth, createNode); // Allows guest or authenticated contribution
router.delete('/:id', authenticateToken, deleteNode);

// Verification / Upvoting
router.post('/:id/verify', optionalAuth, toggleVerification);

// Comments on a Knowledge Node
router.get('/:nodeId/comments', getCommentsByNodeId);
router.post('/:nodeId/comments', optionalAuth, addComment);

export default router;
