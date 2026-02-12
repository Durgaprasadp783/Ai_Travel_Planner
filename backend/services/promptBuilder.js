const buildTravelPrompt = (input) => {
    const {
        destination,
        days,
        budget,
        interests
    } = input;

    const interestText =
        Array.isArray(interests) && interests.length > 0
            ? interests.join(", ")
            : "general sightseeing";

    return `
Create a travel itinerary.

Destination: ${destination}
Duration: ${days} days
Budget: ${budget}
Interests: ${interestText}

Provide a friendly, structured itinerary with daily plans.
`;
};

module.exports = { buildTravelPrompt };
