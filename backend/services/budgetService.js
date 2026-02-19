/**
 * Calculates a constrained budget allocation based on trip duration.
 */
exports.calculateAllocation = (totalBudget, days) => {
    // 1. Initial Category Weights
    const weights = {
        accommodation: 0.40,
        food: 0.25,
        activities: 0.20,
        transport: 0.15
    };

    // 2. Calculate Total Category Pools
    const accommodationPool = totalBudget * weights.accommodation;
    const dailyFoodLimit = (totalBudget * weights.food) / days;
    const dailyActivityLimit = (totalBudget * weights.activities) / days;
    const transportPool = totalBudget * weights.transport;

    // 3. Determine "Tier" (Budget, Mid-Range, Luxury)
    let tier = "Mid-Range";
    const dailyTotal = totalBudget / days;

    if (dailyTotal < 50) tier = "Budget";
    else if (dailyTotal > 200) tier = "Luxury";

    return {
        tier,
        breakdown: {
            accommodationTotal: Math.round(accommodationPool),
            avgNightlyRate: Math.round(accommodationPool / days),
            dailyFood: Math.round(dailyFoodLimit),
            dailyActivities: Math.round(dailyActivityLimit),
            transportTotal: Math.round(transportPool)
        }
    };
};