import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(2),
  jobDescription: z.string(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),

  salaryFrom: z.string().optional(),
  salaryTo: z.string().optional(),
  salaryNegotiable: z.boolean().optional(),

  workingTime: z.string().optional(),
  applicationDeadline: z.string().optional(),

  ward: z.string().min(1),
  address: z.string().optional(),

  domainKnowledge: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  softSkills: z.array(z.string()).optional(),

  experience: z.string().optional(),
});
