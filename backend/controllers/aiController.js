const { generateItinerary } = require("../services/aiService");

exports.createAITrip = async (req, res) => {
    try {
        console.log("🚀 AI route hit!");
        console.log("Request body:", req.body);

        const itinerary = await generateItinerary(req.body);

        res.json({ itinerary });

    } catch (err) {
        console.error("🔥 CONTROLLER ERROR:", err);

        res.status(500).json({
            message: err.message || "AI generation failed"
        });
    }
};
