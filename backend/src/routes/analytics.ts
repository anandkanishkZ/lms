import express from 'express';
const router = express.Router();
router.get('/', (req: any, res: any) => res.json({ message: 'Analytics endpoint - coming soon' }));
export default router;