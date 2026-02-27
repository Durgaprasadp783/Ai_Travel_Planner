const travelModes = {
    'solo': {
        prompt: "Focus on social hostels, solo-friendly bars, and safety. Prioritize walking and public transport.",
        budgetWeight: { accommodation: 0.3, food: 0.3, activities: 0.2, transport: 0.2 }
    },
    'couples': {
        prompt: "Focus on romantic spots, private dining, and scenic views. Prioritize comfort and privacy.",
        budgetWeight: { accommodation: 0.45, food: 0.3, activities: 0.15, transport: 0.1 }
    },
    'friends': {
        prompt: "Focus on nightlife, group activities, and high-energy spots. Prioritize group-friendly venues.",
        budgetWeight: { accommodation: 0.35, food: 0.25, activities: 0.3, transport: 0.1 }
    },
    'family': {
        prompt: "Focus on kid-friendly attractions, parks, and easy accessibility. Avoid late-night venues.",
        budgetWeight: { accommodation: 0.4, food: 0.3, activities: 0.2, transport: 0.1 }
    },
    'business': {
        prompt: "Focus on quiet workspaces, proximity to city centers, and high-speed transit. Prioritize efficiency.",
        budgetWeight: { accommodation: 0.5, food: 0.2, activities: 0.1, transport: 0.2 }
    }
};

module.exports = travelModes;