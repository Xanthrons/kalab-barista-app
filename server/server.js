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
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const reminderService = require("./services/reminderService");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Kalab Barista API is running."
  });
});

app.use("/api/register", registrationRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/student", studentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  reminderService.start();
  console.log(`Server running on port ${PORT}`);
});
