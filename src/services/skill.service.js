import * as SkillRepository from '../repositories/skill.repository.js';

export const getAllSkills = async () => {
  const skills = await SkillRepository.getAllSkills();

  return skills.map((skill) => ({
    value: skill.name,
    label: skill.name,
  }));
};
