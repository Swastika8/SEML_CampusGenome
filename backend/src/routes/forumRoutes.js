import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import {
  communitySchema,
  forumDirectorySchema,
  forumSlug,
  numericId,
  reportReviewSchema,
  validate,
} from '../middleware/validate.js';
import {
  createCommunity,
  getCommunity,
  listCommunities,
  listReports,
  reviewReport,
  setMembership,
} from '../controllers/forumController.js';

const router = Router();
const slugParam = (req, res, next) =>
  forumSlug.safeParse(req.params.slug).success
    ? next()
    : res.status(404).json({ success: false, message: 'Community not found.' });

router.use((_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});
router.get('/communities', optionalAuth, validate(forumDirectorySchema, 'query'), listCommunities);
router.post('/communities', authenticateToken, validate(communitySchema), createCommunity);
router.get('/communities/:slug', slugParam, optionalAuth, getCommunity);
router.put('/communities/:slug/membership', slugParam, authenticateToken, setMembership);
router.delete('/communities/:slug/membership', slugParam, authenticateToken, setMembership);
router.get('/reports', authenticateToken, listReports);
router.post(
  '/reports/:id',
  numericId(),
  authenticateToken,
  validate(reportReviewSchema),
  reviewReport,
);
export default router;
