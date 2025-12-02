import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

import jobsRouter from './routes/jobs.routes.js';
import locationRouter from './routes/employer/location.router.js';
import SpecializationRouter from './routes/employer/specialization.router.js';
import authRoutes from './routes/auth.routes.js';
import employerSettingRouters from './routes/employer/setting.router.js';
import employerRouters from './routes/employer/employer.router.js';
import employerVerifyPhone from './routes/employer/verifyPhone.router.js';
import { verifyAccessToken } from './middlewares/auth.middleware.js';
import { httpLogger, errorLogger } from './middlewares/logger.middleware.js';
import './models/skill.model.js';
import './models/location.model.js';
import './models/jobGroup.model.js';
import './models/jobs.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

connectDB();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

// ROUTES
app.use('/api/auth', authRoutes);

app.use('/api/jobs', jobsRouter);

app.use(
  '/employer/account',
  verifyAccessToken,
  httpLogger,
  employerVerifyPhone,
);
app.use(
  '/employer/account/settings',
  verifyAccessToken,
  httpLogger,
  employerSettingRouters,
);
app.use(
  '/employer/account/settings/personal',
  verifyAccessToken,
  httpLogger,
  employerRouters,
);
app.use('/employer/api/jobs', jobsRouter);
app.use('/employer/jobs', jobsRouter);
app.use('/employer/api/locations', locationRouter);
app.use('/employer/api/specialization', SpecializationRouter);

app.use('/uploads', verifyAccessToken, httpLogger, express.static('uploads'));
app.use(errorLogger);
// ERROR HANDLER
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
