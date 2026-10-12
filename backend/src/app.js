const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");
const adminRoutes = require("./routes/admin.routes");
const studentRoutes = require("./routes/student.routes");
const documentRoutes = require("./routes/document.routes");
const adminDocumentRoutes = require("./routes/admin.document.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IEM-UEM Admission System API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/student/application", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/student/documents", documentRoutes);
app.use("/api/admin/documents", adminDocumentRoutes);
app.use("/api/student/payments", paymentRoutes);

module.exports = app;