import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Notices endpoint - implementation pending',
    data: []
  });
});

router.post('/', (req, res) => {
  res.status(501).json({ 
    success: false,
    message: 'Notice creation not implemented yet'
  });
});

export default router;