import Skill from '../models/skill.model.js';

export const getAllSkills = async () => {
  return await Skill.find({}).sort({ name: 1 }).lean();
};
