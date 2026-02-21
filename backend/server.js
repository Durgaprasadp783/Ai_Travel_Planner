require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const mapsRoutes = require("./routes/mapsRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug Middleware: Log all requests
app.use((req, res, next) => {
    console.log(`📡 Request received: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/budget", budgetRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ DB Error:", err));

const PORT = process.env.PORT || 5000;

// ✅ Global Error Handler
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
