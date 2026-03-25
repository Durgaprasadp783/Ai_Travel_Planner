const express = require('express');
const router = express.Router();

/**
 * GET /api/hotels
 * Search for hotels by city
 */
router.get('/', (req, res) => {
    const { city, checkIn, checkOut, guests, sortBy } = req.query;

    console.log(`[Hotel API] Searching for hotels in: ${city}`);
    console.log(`[Hotel API] Stay: ${checkIn} to ${checkOut} for ${guests} guests. Sort: ${sortBy}`);

    // Mock response with diverse data to demonstrate sorting/mapping
    let mockHotels = [
        {
            name: `${city} Grand Hyatt`,
            price: 340 + (parseInt(guests) * 50),
            rating: "4.9",
            amenities: "wifi,cancellation,pool"
        },
        {
            name: `${city} City Center Lodge`,
            price: 120 + (parseInt(guests) * 20),
            rating: "4.2",
            amenities: "wifi"
        },
        {
            name: `${city} Luxury Spa & Resort`,
            price: 550 + (parseInt(guests) * 100),
            rating: "4.8",
            amenities: "wifi,pool,cancellation"
        },
        {
            name: `${city} Boutique Boutique`,
            price: 210 + (parseInt(guests) * 30),
            rating: "4.5",
            amenities: "wifi,breakfast"
        }
    ];

    // Simple Sorting logic
    if (sortBy === 'price_low') {
        mockHotels.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'rating_high') {
        mockHotels.sort((a, b) => b.rating - a.rating);
    }

    // Simulating slight network delay
    setTimeout(() => {
        res.json(mockHotels);
    }, 1200);
});


module.exports = router;
