const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createAITrip } = require("../controllers/aiController");

router.post("/generate", auth, createAITrip);

module.exports = router;
