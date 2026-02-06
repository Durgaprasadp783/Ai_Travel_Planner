require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes"); // 👈 ADD THIS

const app = express();


// =====================
// Middleware section
// =====================
app.use(cors());
app.use(express.json());


// =====================
// Routes section
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes); // 👈 ADD IT HERE


// =====================
// Database connection
// =====================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.log(err));


// =====================
// Start server
// =====================
app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
