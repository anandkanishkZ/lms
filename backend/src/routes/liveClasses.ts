import express from 'express';

const router = express.Router();

// TODO: Implement live class routes
router.get('/', (req, res) => {
  res.json({ message: 'Live classes endpoint - coming soon' });
});

export default router;