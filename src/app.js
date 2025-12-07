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
import { verifyToken } from './middlewares/jwt.js';
import { httpLogger, errorLogger } from './middlewares/logger.middleware.js';
import userRoutes from './routes/user.routes.js';
import candidateRoutes from './routes/candidate/candidate.routes.js';
import favoritesRouter from './routes/candidate/favorites.routes.js';
import managingRouter from './routes/admin/managing.routes.js';
import applyJobRouter from './routes/candidate/applyJobs.routes.js';
import resumeRouter from './routes/candidate/resume.routes.js';
import employerApplicationsRouter from './routes/employer/application.router.js';

import employersupport from './routes/employer/support.router.js';
import employerFeedback from './routes/employer/feedback.router.js';
import adminLicense from './routes/admin/adminLicense.route.js';
import AdminJob from './routes/admin/adminJob.route.js';
import AdminEmployer from './routes/admin/adminEmployer.js';
import AdminNotification from './routes/notification.router.js';
import EmployerNotification from './routes/employer/notificationEmployer.router.js';
import adminTickets from './routes/admin/adminTickets.route.js';
import dashboardRoutes from './routes/admin/adminDashboard.routes.js';

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
  '/employer/support-box/suggest',
  verifyAccessToken,
  httpLogger,
  employersupport,
);
app.use(
  '/employer/support-box/feedback',
  verifyAccessToken,
  httpLogger,
  employerFeedback,
);
app.use(
  '/employer/account/settings/personal',
  verifyAccessToken,
  httpLogger,
  employerRouters,
);
app.use(
  '/employer/api/applications',
  verifyAccessToken,
  httpLogger,
  employerApplicationsRouter,
);
app.use('/api/candidates', verifyAccessToken, httpLogger, candidateRoutes);
app.use(
  '/candidates/applications',
  verifyToken, // dùng verifyToken để lấy req.user.id
  httpLogger,
  applyJobRouter,
);
app.use('/api/resumes', verifyAccessToken, httpLogger, resumeRouter);
app.use('/api/user', verifyAccessToken, httpLogger, userRoutes);
app.use('/api/favorites', verifyAccessToken, httpLogger, favoritesRouter);
app.use('/employer', verifyAccessToken, httpLogger, employerRouters);
app.use('/employer/api/jobs', verifyAccessToken, httpLogger, jobsRouter);
app.use('/employer/jobs', verifyAccessToken, httpLogger, jobsRouter);
app.use(
  '/employer/api/locations',
  verifyAccessToken,
  httpLogger,
  locationRouter,
);
app.use(
  '/employer/api/specialization',
  verifyAccessToken,
  httpLogger,
  SpecializationRouter,
);
app.use('/admin/managing', verifyAccessToken, httpLogger, managingRouter);
app.use(
  '/employer/system-notification',
  verifyAccessToken,
  httpLogger,
  EmployerNotification,
);

app.use('/admin/', verifyAccessToken, httpLogger, AdminJob);
app.use('/admin/manage', verifyAccessToken, httpLogger, AdminEmployer);
app.use(
  '/admin/manage/SupportTickets',
  verifyAccessToken,
  httpLogger,
  adminTickets,
);
app.use(
  '/admin/business-license/',
  verifyAccessToken,
  httpLogger,
  adminLicense,
);
app.use(
  '/admin/notification',
  verifyAccessToken,
  httpLogger,
  AdminNotification,
);
app.use('/admin/dashboard', dashboardRoutes);

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
