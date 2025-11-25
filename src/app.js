import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import path from "path";
import { fileURLToPath } from "url";

import jobsRoutes from './routes/jobs.routes.js';
import authRoutes from "./routes/auth.routes.js";

import "./models/skill.model.js";
import "./models/location.model.js";
import "./models/jobGroup.model.js";
import "./models/jobs.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

connectDB();

const app = express();

// MIDDLEWARE ĐÚNG THỨ TỰ 
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

// ROUTES
app.use("/api/auth", authRoutes);
app.use('/api/jobs', jobsRoutes);

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
