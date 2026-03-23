const Trip = require("../models/Trip");
const { tripSchema } = require("../validators/tripValidator");
const { getAIPlan, regenerateAIPlan } = require("../services/aiService");
const { getForecast } = require("../services/weatherService");
const { calculateAllocation } = require("../services/budgetService");
const { redisClient, isRedisReady } = require("../config/redisClient");
const { optimizeDailyRoute } = require("../utils/routeOptimizer");
const { sanitizeItinerary } = require("../utils/activityFilter");
const { attachExactLocations } = require("../utils/locationService");

/**
 * 1. CREATE AI-GENERATED TRIP 
 * Flow: Validation -> Budget Check -> AI Generation -> Personality Filter -> 
 * Route Optimization -> Weather -> DB Save -> Cache Clear
 */
exports.generateTrip = async (req, res, next) => {
    try {
        let { origin, destination, originCoordinates, destinationCoordinates, startDate, endDate, days, budget, interests, mode, peopleCount, smartPrompt } = req.body;

        // Ensure origin and destination are strings for the AI prompt
        origin = typeof origin === 'object' && origin !== null ? (origin.name || origin.address || '') : origin;
        destination = typeof destination === 'object' && destination !== null ? (destination.name || destination.address || '') : destination;

        console.log("📡 Initial Data Received in Backend:", { origin, destination, startDate, endDate, days, budget });

        // --- A. DATE CALCULATIONS ---
        if (!days && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
        const budgetAllocation = calculateAllocation(budget, days, mode);

        let aiPlan = await getAIPlan({
            origin,
            destination,
            days,
            budget,
            interests,
            totalBudget: budget,
            mode: mode,
            peopleCount,
            smartPrompt
        });

        // --- D. PERSONALITY FILTER (Sanitization) ---
        aiPlan = sanitizeItinerary(aiPlan, mode);

        // --- E. EXACT LOCATION DECORATION (Phase 2) ---
        aiPlan = await attachExactLocations(aiPlan);

        // --- F. ROUTE OPTIMIZATION ---
        if (aiPlan.dailyPlan) {
            for (let day of aiPlan.dailyPlan) {
                day.activities = await optimizeDailyRoute(day.activities, destination);
            }
        }

        // --- G. WEATHER INTEGRATION ---
        const weatherData = await getForecast(destination, startDate, days);
        if (weatherData && aiPlan.dailyPlan) {
            aiPlan.dailyPlan = aiPlan.dailyPlan.map((dayPlan, index) => ({
                ...dayPlan,
                weather: weatherData[index] || "No forecast available"
            }));
        }

        // --- G. SAVE TO DATABASE ---
        const trip = await Trip.create({
            userId: req.user.userId,
            origin,
            destination,
            originCoordinates,
            destinationCoordinates,
            days,
            startDate,
            endDate,
            budget: budget,
            budgetTier: budgetAllocation.tier,
            itinerary: aiPlan,
            mode,
            peopleCount
        });

        // --- H. CLEAR CACHE ---
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
 * 2. GET ALL TRIPS (Paginated & Cached)
 */
exports.getAllTrips = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const cacheKey = `trips_user_${req.user.userId}_page_${page}`;

        if (isRedisReady()) {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) return res.json(JSON.parse(cachedData));
        }

        const limit = 10;
        const skip = (page - 1) * limit;

        const trips = await Trip.find({ userId: req.user.userId })
            .select("destination days budget createdAt itinerary mode peopleCount")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        if (isRedisReady()) {
            await redisClient.set(cacheKey, JSON.stringify(trips), { EX: 60 });
        }

        res.json(trips);
    } catch (err) {
        next(err);
    }
};

/**
 * 3. GET SINGLE TRIP
 */
exports.getTripById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `trip:${id}`;

        if (isRedisReady()) {
            const cachedTrip = await redisClient.get(cacheKey);
            if (cachedTrip) return res.status(200).json(JSON.parse(cachedTrip));
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
 * 4. REGENERATE TRIP (Based on User Text Instructions)
 * Added Sanitization & Optimization to the regeneration flow
 */
exports.regenerateTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userInstruction } = req.body;

        if (!userInstruction) return res.status(400).json({ error: "Instruction is required" });

        const existingTrip = await Trip.findById(id);
        if (!existingTrip) return res.status(404).json({ error: "Trip not found" });

        // Generate the new itinerary
        let newItinerary = await regenerateAIPlan(existingTrip, userInstruction);

        // Apply Personality Filter
        newItinerary = sanitizeItinerary(newItinerary, existingTrip.mode);

        // Attach exact locations (Phase 2)
        newItinerary = await attachExactLocations(newItinerary);

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
 * 5. DELETE TRIP
 */
exports.deleteTrip = async (req, res, next) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!deletedTrip) return res.status(404).json({ message: "Trip not found" });
        if (isRedisReady()) await redisClient.del(`trip:${req.params.id}`);

        res.json({ message: "Trip deleted successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * 6. CREATE TRIP (MANUAL)
 */
exports.createTripManual = async (req, res, next) => {
    try {
        const { destination, originCoordinates, destinationCoordinates, days, budget, itinerary, mode, peopleCount, origin, startDate, endDate } = req.body;

        const trip = await Trip.create({
            userId: req.user.userId,
            origin,
            destination,
            originCoordinates,
            destinationCoordinates,
            days,
            startDate,
            endDate,
            budget,
            itinerary,
            mode,
            peopleCount
        });

        if (isRedisReady()) {
            const cacheKey = `trips_user_${req.user.userId}_page_1`;
            await redisClient.del(cacheKey);
        }

        res.status(201).json(trip);
    } catch (err) {
        next(err);
    }
};

/**
 * 7. UPDATE TRIP (Re-runs AI regeneration)
 */
exports.updateTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { destination, originCoordinates, destinationCoordinates, budget, startDate, endDate, mode, peopleCount, interests } = req.body;

        const trip = await Trip.findById(id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        // Update fields if provided
        if (destination) trip.destination = destination;
        if (originCoordinates) trip.originCoordinates = originCoordinates;
        if (destinationCoordinates) trip.destinationCoordinates = destinationCoordinates;
        if (budget) trip.budget = budget;
        if (startDate) trip.startDate = startDate;
        if (endDate) trip.endDate = endDate;
        if (mode) trip.mode = mode;
        if (peopleCount) trip.peopleCount = peopleCount;

        // Recalculate days if dates were updated
        if (startDate || endDate) {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const diffTime = Math.abs(end - start);
            trip.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        // Re-generate the entire plan
        const budgetAllocation = calculateAllocation(trip.budget, trip.days, trip.mode);

        let aiPlan = await getAIPlan({
            origin: trip.origin,
            destination: trip.destination,
            days: trip.days,
            budget: trip.budget,
            interests: interests || [],
            totalBudget: trip.budget,
            mode: trip.mode,
            peopleCount: trip.peopleCount
        });

        aiPlan = sanitizeItinerary(aiPlan, trip.mode);

        // Attach exact locations (Phase 2)
        aiPlan = await attachExactLocations(aiPlan);

        if (aiPlan.dailyPlan) {
            for (let day of aiPlan.dailyPlan) {
                day.activities = await optimizeDailyRoute(day.activities, trip.destination);
            }
        }

        trip.itinerary = aiPlan;
        trip.budgetTier = budgetAllocation.tier;

        await trip.save();

        if (isRedisReady()) {
            await redisClient.del(`trip:${id}`);
            await redisClient.del(`trips_user_${req.user.userId}_page_1`);
        }

        res.json({ message: "Trip updated and regenerated", trip });
    } catch (err) {
        next(err);
    }
};

/**
 * 8. GET SHARED TRIP (PUBLIC)
 */
exports.getSharedTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `trip_shared:${id}`;

        if (isRedisReady()) {
            const cachedTrip = await redisClient.get(cacheKey);
            if (cachedTrip) return res.status(200).json(JSON.parse(cachedTrip));
        }

        const trip = await Trip.findById(id).select("-userId -createdAt -updatedAt");
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (isRedisReady()) {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(trip));
        }

        res.status(200).json(trip);
    } catch (err) {
        next(err);
    }
};
