import app from './app.js';
import jobRoutes from "./routes/jobs.routes.js";
import "./models/skill.model.js";
import "./models/location.model.js";
import "./models/jobGroup.model.js";
import "./models/jobs.model.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/api/jobs", jobRoutes);