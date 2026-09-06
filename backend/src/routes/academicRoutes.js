import { Router } from 'express';
import { getAcademicInsights } from '../controllers/academicController.js';

const router = Router();

router.get('/', getAcademicInsights);

export default router;
