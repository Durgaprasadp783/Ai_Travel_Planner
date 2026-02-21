const optimizeBudget = (totalBudget, days, travelStyle = "medium") => {
    let allocation;

    if (travelStyle === "low") {
        allocation = { accommodation: 0.3, food: 0.25, transport: 0.2, activities: 0.15, misc: 0.1 };
    } else if (travelStyle === "luxury") {
        allocation = { accommodation: 0.5, food: 0.2, transport: 0.1, activities: 0.15, misc: 0.05 };
    } else {
        allocation = { accommodation: 0.4, food: 0.2, transport: 0.15, activities: 0.15, misc: 0.1 };
    }

    return {
        totalBudget,
        perDayBudget: totalBudget / days,
        breakdown: {
            accommodation: totalBudget * allocation.accommodation,
            food: totalBudget * allocation.food,
            transport: totalBudget * allocation.transport,
            activities: totalBudget * allocation.activities,
            misc: totalBudget * allocation.misc
        }
    };
};

module.exports = { optimizeBudget };
