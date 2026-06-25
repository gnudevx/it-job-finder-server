import express from 'express';
import * as SkillController from '../controllers/skill.controller.js';

const router = express.Router();

router.get('/', SkillController.getAllSkills);

export default router;
