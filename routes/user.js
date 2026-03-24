import express from 'express';
import { getHistory, saveDownload, updatePreferences } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Enforce auth middleware globally internally to this router
router.use(protect);

router.get('/history', getHistory);
router.post('/save-download', saveDownload);
router.patch('/preferences', updatePreferences);

export default router;
