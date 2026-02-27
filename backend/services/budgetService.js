const travelModes = require('../config/travelModes');

/**
 * Calculates a constrained budget allocation based on duration and travel mode.
 * Combines dynamic weighting, tier classification, and category breakdown.
 */
exports.calculateAllocation = (totalBudget, days, mode = 'solo') => {
    // 1. Get weights based on travel mode (solo, couple, family, etc.)
    // Fallback to a hardcoded default if travelModes config isn't found
    const defaultWeights = {
        accommodation: 0.40,
        food: 0.25,
        activities: 0.20,
        transport: 0.15
    };

    const weights = travelModes[mode]?.budgetWeight || defaultWeights;

    // 2. Determine "Tier" (Budget, Mid-Range, Luxury)
    const dailyTotal = totalBudget / days;
    let tier = "Mid-Range";

    if (dailyTotal < 50) {
        tier = "Budget";
    } else if (dailyTotal > 250) {
        tier = "Luxury";
    }

    // 3. Calculate Pools & Daily Limits
    const accommodationPool = totalBudget * weights.accommodation;
    const foodPool = totalBudget * weights.food;
    const activitiesPool = totalBudget * weights.activities;
    const transportPool = totalBudget * (weights.transport || 0.15); // Ensure transport exists

    return {
        tier,
        dailyAverage: Math.round(dailyTotal),
        breakdown: {
            accommodationTotal: Math.round(accommodationPool),
            avgNightlyRate: Math.round(accommodationPool / days),
            dailyFood: Math.round(foodPool / days),
            dailyActivities: Math.round(activitiesPool / days),
            transportTotal: Math.round(transportPool),
            // Helpful for the UI to show total expected spend per category
            foodTotal: Math.round(foodPool),
            activitiesTotal: Math.round(activitiesPool)
        }
    };
};