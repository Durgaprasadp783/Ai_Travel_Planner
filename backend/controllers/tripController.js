const { getAIPlan } = require("../services/aiService");

exports.generateTrip = async (req, res) => {
    try {
        const aiPlan = await getAIPlan(req.body);
        res.json(aiPlan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
