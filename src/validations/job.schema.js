import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(2),
  jobDescription: z.string(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  level: z.string().optional(),
  salaryNegotiable: z.boolean().optional(),
  salaryFrom: z.string().optional(),
  salaryTo: z.string().optional(),
  salary_raw: z.string().optional(),
  workingTime: z
    .object({
      dayFrom: z.string(),
      dayTo: z.string(),
      timeFrom: z.string(),
      timeTo: z.string(),
    })
    .optional(),
  applicationDeadline: z.string().optional(),

  ward: z.string().min(1),
  address: z.string().optional(),

  domainKnowledge: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  mustHaveSkills: z.array(z.string()).optional(),
  optionalSkills: z.array(z.string()).optional(),
  portfolioRequired: z.boolean().optional(),
  gender: z.string().optional(),
  education: z.string().optional(),
  ageRange: z.string().optional(),
  specialization: z.string().optional(),
  jobType: z.string().optional(),
  quantity: z.number().optional(),
  experienceLevel: z.string().optional(),
  experience: z.string().optional(),
  employer_id: z.string().optional(),
  publishStatus: z
    .enum(['draft', 'pending', 'approved', 'rejected'])
    .optional(),
  visibility: z.enum(['hidden', 'visible', 'expired']).optional(),
});
