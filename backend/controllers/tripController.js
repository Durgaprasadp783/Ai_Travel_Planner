const Trip = require("../models/Trip");
const { tripSchema } = require("../validators/tripValidator");
const { getAIPlan } = require("../services/aiService");
const { getForecast } = require("../services/weatherService");
const { calculateAllocation } = require("../services/budgetService");
const redisClient = require("../config/redisClient");

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

/* 2. GET ALL TRIPS */
exports.getAllTrips = async (req, res) => {
    try {
        const trips = await Trip.find().sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        console.error("DETAILED ERROR (Get):", err);
        res.status(500).json({
            message: "Failed to fetch trips",
            details: err.message
        });
    }
};

/* 2.1 CREATE TRIP (MANUAL) */
exports.createTrip = async (req, res) => {
    try {
        const newTrip = new Trip(req.body);
        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* 2.2 GET SINGLE TRIP (WITH REDIS CACHE) */
exports.getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `trip:${id}`;

        // 1️⃣ Check cache
        const cachedTrip = await redisClient.get(cacheKey);

        if (cachedTrip) {
            console.log("⚡ Serving from Redis cache");
            return res.status(200).json(JSON.parse(cachedTrip));
        }

        // 2️⃣ Fetch from DB
        const trip = await Trip.findById(id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // 3️⃣ Store in cache (Expire in 10 minutes)
        await redisClient.setEx(
            cacheKey,
            600,
            JSON.stringify(trip)
        );

        console.log("💾 Data cached in Redis");
        res.status(200).json(trip);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch trip",
            error: error.message
        });
    }
};

// ✅ Updated updateTrip: Re-runs AI itinerary generation
exports.updateTrip = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Validate input first
        const { error } = tripSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation error",
                details: error.details[0].message
            });
        }

        const { destination, days, budget } = req.body;

        // 1️⃣ Check if trip exists
        const existingTrip = await Trip.findById(id);
        if (!existingTrip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        // 2️⃣ Re-run AI with new inputs
        // Using existing getAIPlan from aiService
        const newItinerary = await getAIPlan({
            destination,
            days,
            budget,
            totalBudget: budget // mapping budget to totalBudget for compatibility
        });

        // 3️⃣ Update trip in DB
        existingTrip.destination = destination;
        existingTrip.days = days;
        existingTrip.budget = budget;
        existingTrip.itinerary = newItinerary;

        await existingTrip.save();

        // 🧹 Clear cache
        await redisClient.del(`trip:${id}`);

        res.status(200).json({
            message: "Trip updated successfully",
            trip: existingTrip,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update trip",
            error: error.message,
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