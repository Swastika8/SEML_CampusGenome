import { Router } from 'express';
import { getCourses, getCourseById, addCourseReview } from '../controllers/courseController.js';
import { authenticateToken } from '../middleware/auth.js';

import { validate, courseReviewSchema } from '../middleware/validate.js';
const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/:id/reviews', authenticateToken, validate(courseReviewSchema), addCourseReview);

export default router;
