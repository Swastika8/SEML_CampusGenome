import { Router } from 'express';
import { getCourses, getCourseById, addCourseReview } from '../controllers/courseController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/:id/reviews', optionalAuth, addCourseReview);

export default router;
