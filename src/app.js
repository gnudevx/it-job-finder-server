import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';

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

// Router API
// app.use('/api/users', verifyAccessToken, httpLogger, userRouter);

app.use((err, res) => {
  // middleware xử lý lỗi thực sự
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
