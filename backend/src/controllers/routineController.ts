import express from 'express';

const router = express.Router();

// Placeholder routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Routines endpoint - implementation pending', data: [] });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Routine creation not implemented yet' });
});

export default router;