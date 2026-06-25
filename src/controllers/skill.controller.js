import * as SkillService from '../services/skill.service.js';

export const getAllSkills = async (req, res, next) => {
  try {
    const skills = await SkillService.getAllSkills();

    return res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};
