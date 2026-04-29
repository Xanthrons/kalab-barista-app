const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const registrationRoutes = require("./routes/registrationRoutes");
const applicantRoutes = require("./routes/applicantRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const reminderService = require("./services/reminderService");
const { bootstrapSystem } = require("./services/bootstrapService");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Kalab Barista API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/register", registrationRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin-users", adminUserRoutes);
app.use("/api/system-settings", systemSettingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
  await bootstrapSystem();
  reminderService.start();
  console.log(`Server running on port ${PORT}`);
});
