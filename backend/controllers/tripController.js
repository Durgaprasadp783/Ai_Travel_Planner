const Trip = require("../models/Trip");
const { tripSchema } = require("../validators/tripValidator");
const { getAIPlan, regenerateAIPlan } = require("../services/aiService");
const { getForecast } = require("../services/weatherService");
const { calculateAllocation } = require("../services/budgetService");
const { redisClient, isRedisReady } = require("../config/redisClient");
const { optimizeDailyRoute } = require("../utils/routeOptimizer");

/**
 * 1. CREATE AI-GENERATED TRIP 
 * Combined: Budget Check + AI Generation + Route Optimization + Weather + DB Save
 */
exports.generateTrip = async (req, res, next) => {
    try {
        let { origin, destination, startDate, endDate, days, budget, interests, travelMode, smartPrompt } = req.body;
        console.log("📡 Initial Data Received in Backend:", { origin, destination, startDate, endDate, days, budget });

        // --- A. DATE CALCULATIONS ---
        if (!days && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            console.log(`🕒 Calculated Days: ${days} (from dates ${startDate} to ${endDate})`);
        } else {
            console.log(`🕒 Using Provided Days: ${days}`);
        }

        // --- B. BUDGET SURVIVABILITY CHECK ---
        const minDailyBudget = 30;
        if (budget / days < minDailyBudget) {
            return res.status(400).json({
                error: "Budget too low",
                message: `A budget of $${budget} is too low for a ${days}-day trip to ${destination}. We recommend at least $${days * minDailyBudget}.`
            });
        }

        // --- C. ALLOCATION & AI PLAN GENERATION ---
        const budgetAllocation = calculateAllocation(budget, days, travelMode);

        const aiPlan = await getAIPlan({
            origin,
            destination,
            days,
            budget,
            interests,
            totalBudget: budget,
            mode: travelMode,
            smartPrompt
        });

        // --- D. ROUTE OPTIMIZATION ---
        // Enhance the AI plan by sorting activities for better travel flow
        if (aiPlan.dailyPlan) {
            for (let day of aiPlan.dailyPlan) {
                day.activities = await optimizeDailyRoute(day.activities, destination);
            }
        }

        // --- E. WEATHER INTEGRATION ---
        const weatherData = await getForecast(destination, startDate, days);

        if (weatherData && aiPlan.dailyPlan) {
            aiPlan.dailyPlan = aiPlan.dailyPlan.map((dayPlan, index) => ({
                ...dayPlan,
                weather: weatherData[index] || "No forecast available"
            }));
        }

        // --- F. SAVE TO DATABASE ---
        const trip = await Trip.create({
            userId: req.user.userId,
            origin,
            destination,
            days,
            startDate,
            endDate,
            budget,
            budgetTier: budgetAllocation.tier,
            itinerary: aiPlan,
        });

        // --- G. CLEAR CACHE ---
        // Since we just created a new trip, we need to clear the cached list for this user
        if (isRedisReady()) {
            const cacheKey = `trips_user_${req.user.userId}_page_1`;
            await redisClient.del(cacheKey);
            console.log("🧹 Redis cache cleared for user's trip list");
        }

        res.status(201).json(trip);

    } catch (err) {
        console.error("DETAILED ERROR (Generate):", err);
        next(err);
    }
};

/**
 * 2. GET ALL TRIPS (For Logged-in User with Pagination & Cache)
 */
exports.getAllTrips = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;

        // IMPORTANT: Include user ID in cache key so users only see their own trips
        const cacheKey = `trips_user_${req.user.userId}_page_${page}`;

        // 1. Check cache safely
        if (isRedisReady()) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("⚡ Serving all trips from Redis cache");
                return res.json(JSON.parse(cachedData));
            }
        }

        const limit = 10;
        const skip = (page - 1) * limit;

        // 2. Fetch from DB: Filter by user AND apply pagination
        const trips = await Trip.find({ userId: req.user.userId })
            .select("destination days budget createdAt itinerary")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // 3. Store in cache for 60 seconds safely
        if (isRedisReady()) {
            await redisClient.set(cacheKey, JSON.stringify(trips), {
                EX: 60
            });
        }

        res.json(trips);
    } catch (err) {
        next(err);
    }
};

/**
 * 3. GET SINGLE TRIP (With Redis Cache)
 */
exports.getTripById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `trip:${id}`;

        if (isRedisReady()) {
            const cachedTrip = await redisClient.get(cacheKey);
            if (cachedTrip) {
                return res.status(200).json(JSON.parse(cachedTrip));
            }
        }

        const trip = await Trip.findById(id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (isRedisReady()) {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(trip));
        }

        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};

/**
 * 4. UPDATE TRIP (Manual & Re-runs AI Generation)
 */
exports.updateTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error } = tripSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { destination, days, budget } = req.body;

        const existingTrip = await Trip.findById(id);
        if (!existingTrip) return res.status(404).json({ message: "Trip not found" });

        // Re-generate itinerary based on updated parameters
        const newItinerary = await getAIPlan({
            destination,
            days,
            budget,
            totalBudget: budget
        });

        // Optimization for updated plan
        if (newItinerary.dailyPlan) {
            for (let day of newItinerary.dailyPlan) {
                day.activities = await optimizeDailyRoute(day.activities, destination);
            }
        }

        existingTrip.destination = destination;
        existingTrip.days = days;
        existingTrip.budget = budget;
        existingTrip.itinerary = newItinerary;

        await existingTrip.save();

        if (isRedisReady()) await redisClient.del(`trip:${id}`);

        res.status(200).json({ message: "Trip updated successfully", trip: existingTrip });
    } catch (err) {
        next(err);
    }
};

/**
 * 5. REGENERATE TRIP (Based on User Text Instructions)
 */
exports.regenerateTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userInstruction } = req.body;

        if (!userInstruction) return res.status(400).json({ error: "Instruction is required" });

        const existingTrip = await Trip.findById(id);
        if (!existingTrip) return res.status(404).json({ error: "Trip not found" });

        const newItinerary = await regenerateAIPlan(existingTrip, userInstruction);

        // Optimize the newly generated instruction-based plan
        if (newItinerary.dailyPlan) {
            for (let day of newItinerary.dailyPlan) {
                day.activities = await optimizeDailyRoute(day.activities, existingTrip.destination);
            }
        }

        existingTrip.itinerary = newItinerary;
        await existingTrip.save();

        if (isRedisReady()) await redisClient.del(`trip:${id}`);

        res.status(200).json({ message: "Trip regenerated", trip: existingTrip });
    } catch (err) {
        next(err);
    }
};

/**
 * 6. DELETE TRIP
 */
exports.deleteTrip = async (req, res, next) => {
    try {
        const deletedTrip = await Trip.findByIdAndDelete(req.params.id);

        if (!deletedTrip) return res.status(404).json({ message: "Trip not found" });

        if (isRedisReady()) await redisClient.del(`trip:${req.params.id}`);

        res.status(200).json({ message: "Trip deleted successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * 7. GET SHARED TRIP (Public Access)
 */
exports.getSharedTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const trip = await Trip.findById(id).select("-userId -user");
        if (!trip) return res.status(404).json({ message: "Shared trip not found" });
        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};

/**
 * 8. CREATE TRIP (Manual - No AI)
 */
exports.createTripManual = async (req, res, next) => {
    try {
        const newTrip = new Trip({ ...req.body, userId: req.user.userId });
        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);
    } catch (err) {
        next(err);
    }
};