import express from 'express';
import { processDownload } from '../controllers/downloadController.js';

const router = express.Router();

router.post('/', processDownload);

export default router;
