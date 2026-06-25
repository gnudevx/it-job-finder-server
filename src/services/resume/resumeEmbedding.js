import axios from 'axios';
import Resume from '../../models/resumes.model.js';
import ParsedResume from '../../models/ParsedResumeSchema.module.js';

export const generateResumeEmbedding = async (resumeId) => {
  const parsedResume = await ParsedResume.findOne({ resumeId });

  if (!parsedResume) {
    throw new Error(`Parsed resume not found for resumeId ${resumeId}`);
  }

  const { rawText, skills } = parsedResume;

  const response = await axios.post(
    `${process.env.CV_RECOMMEND_URL}/cv-embedding`,
    {
      rawText,
      skills,
    },
  );

  const embedding = response.data.embedding || [];

  await ParsedResume.findByIdAndUpdate(parsedResume._id, {
    embedding,
  });

  await Resume.findByIdAndUpdate(resumeId, {
    embedding,
  });

  return embedding;
};
