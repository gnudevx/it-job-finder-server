import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import jobsRouter from './routes/jobs.routes.js';
import locationRouter from './routes/employer/location.router.js';
import SpecializationRouter from './routes/employer/specialization.router.js';
dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// ROUTER API
app.use('/api/jobs', jobsRouter);
app.use('/employer/api/jobs', jobsRouter);
app.use('/employer/jobs', jobsRouter);
app.use('/employer/api/locations', locationRouter);
app.use('/employer/api/specialization', SpecializationRouter);
// ERROR HANDLER (sửa signature!)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
