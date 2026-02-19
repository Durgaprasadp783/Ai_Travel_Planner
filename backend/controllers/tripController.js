const Trip = require("../models/Trip");
const { getAIPlan } = require("../services/aiService");
const { getForecast } = require("../services/weatherService");
const { calculateAllocation } = require("../services/budgetService");

/* 1. CREATE AI-GENERATED TRIP WITH WEATHER & BUDGET VALIDATION */
exports.generateTrip = async (req, res) => {
    try {
        let { origin, destination, startDate, endDate, days, budget, interests } = req.body;

        // --- A. DATE CALCULATIONS ---
        if (!days && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }


        // --- B. BUDGET SURVIVABILITY CHECK ---
        // Prevents calling external APIs if the budget is unrealistic
        const minDailyBudget = 30;
        if (budget / days < minDailyBudget) {
            return res.status(400).json({
                error: "Budget too low",
                message: `A budget of $${budget} is too low for a ${days}-day trip to ${destination}. We recommend at least $${days * minDailyBudget}.`
            });
        }


        // --- C. ALLOCATION & AI PLAN GENERATION ---
        // Get the optimized breakdown (optional: you can pass this into getAIPlan)
        const budgetAllocation = calculateAllocation(budget, days);

        // Fetch the AI itinerary (The aiService now uses the budget info internally)
        const aiPlan = await getAIPlan({
            destination,
            days,
            budget,
            interests,
            totalBudget: budget // Passing total budget explicitly if needed
        });

        // --- D. WEATHER INTEGRATION ---
        const weatherData = await getForecast(destination, startDate, days);

        if (weatherData && aiPlan.dailyPlan) {
            aiPlan.dailyPlan = aiPlan.dailyPlan.map((dayPlan, index) => {
                return {
                    ...dayPlan,
                    weather: weatherData[index] || "No forecast available"
                };
            });
        }

        // --- E. SAVE TO DATABASE ---
        const trip = await Trip.create({
            user: req.user.userId,
            origin,
            destination,
            days,
            startDate,
            endDate,
            budget,
            budgetTier: budgetAllocation.tier, // Storing the calculated tier
            itinerary: aiPlan,
        });

        res.status(201).json(trip);

    } catch (err) {
        console.error("DETAILED ERROR (Generate):", err);
        res.status(500).json({
            error: "Failed to build itinerary with weather",
            details: err.message
        });
    }
};

/* 2. GET ALL USER TRIPS */
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        console.error("DETAILED ERROR (Get):", err);
        res.status(500).json({
            message: "Failed to fetch trips",
            details: err.message
        });
    }
};

/* 3. UPDATE TRIP */
exports.updateTrip = async (req, res) => {
    try {
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found or unauthorized" });
        }

        res.json(updatedTrip);
    } catch (err) {
        console.error("DETAILED ERROR (Update):", err);
        res.status(500).json({
            error: "Failed to update trip",
            details: err.message
        });
    }
};

/* 4. DELETE TRIP */
exports.deleteTrip = async (req, res) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!deletedTrip) {
            return res.status(404).json({ message: "Trip not found or unauthorized" });
        }

        res.json({ message: "Trip deleted successfully" });
    } catch (err) {
        console.error("DETAILED ERROR (Delete):", err);
        res.status(500).json({
            error: "Failed to delete trip",
            details: err.message
        });
    }
};