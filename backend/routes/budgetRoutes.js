const express = require("express");
const { optimizeBudget } = require("../utils/budgetOptimizer");

const router = express.Router();

router.post("/optimize", (req, res) => {
    const { totalBudget, days, travelStyle } = req.body;

    if (!totalBudget || !days) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const result = optimizeBudget(totalBudget, days, travelStyle);
    res.json(result);
});

module.exports = router;
