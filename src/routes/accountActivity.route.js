import express from 'express';
import { getAccountActivities } from '../controllers/accountActivity.controller.js';

const router = express.Router();

router.get('/account-setting', getAccountActivities);

export default router;
