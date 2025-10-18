import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as adminAuth from '../middlewares/adminAuth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/subjects
 * Get all subjects for dropdown lists
 */
router.get('/', adminAuth.authenticateAdmin, async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
    });
  }
});

export default router;
