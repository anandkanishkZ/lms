import express from 'express';
const router = express.Router();
router.get('/', (req: any, res: any) => res.json({ message: 'Routines endpoint - coming soon' }));
export default router;