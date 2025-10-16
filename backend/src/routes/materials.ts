import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Materials endpoint - implementation pending',
    data: []
  });
});

router.post('/', (req, res) => {
  res.status(501).json({ 
    success: false,
    message: 'Material creation not implemented yet'
  });
});

export default router;