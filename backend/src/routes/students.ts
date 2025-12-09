import express from 'express';
import { getStudentDashboard } from '../controllers/studentDashboardController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

// All student routes require authentication and STUDENT role
router.use(authenticateToken);
router.use(authorizeRoles('STUDENT'));

// Student dashboard
router.get('/dashboard', getStudentDashboard);

export default router;
