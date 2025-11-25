import { jobSchema } from '../validations/job.schema.js';

export const validateJob = (req, res, next) => {
  const result = jobSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.issues,
    });
  }

  req.body = result.data; // dữ liệu sạch
  next();
};
