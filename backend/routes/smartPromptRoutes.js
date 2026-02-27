const express = require("express");
const router = express.Router();
const { parseTravelPrompt } = require("../services/smartPromptService");

/**
 * @swagger
 * /api/smart-plan:
 *   post:
 *     summary: Parse natural language travel prompt into structured data
 *     tags: [Trips]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "I want to go to Tokyo for 5 days with a budget of 2000 dollars, I love sushi and temples"
 *     responses:
 *       200:
 *         description: Structured travel data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     destination:
 *                       type: string
 *                     days:
 *                       type: number
 *                     budget:
 *                       type: number
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.post("/smart-plan", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const structuredData = await parseTravelPrompt(prompt);

        res.json({
            success: true,
            data: structuredData
        });

    } catch (error) {
        console.error("Smart Parsing Error:", error);
        res.status(500).json({ error: "Smart parsing failed" });
    }
});

module.exports = router;
