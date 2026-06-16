import axios from 'axios';

export const generateJobEmbedding = async (jobData) => {
  try {
    const text = [
      jobData.title,
      jobData.jobDescription,
      ...(jobData.requirements || []),
      ...(jobData.mustHaveSkills || []),
      ...(jobData.optionalSkills || []),
      ...(jobData.domainKnowledge || []),
      ...(jobData.languages || []),
    ]
      .filter(Boolean)
      .join(' ');

    const response = await axios.post(
      `${process.env.CV_RECOMMEND_URL}/job-embedding`,
      { text },
    );

    return response.data.embedding || [];
  } catch (error) {
    console.error('Generate embedding error:', error.message);
    return [];
  }
};
