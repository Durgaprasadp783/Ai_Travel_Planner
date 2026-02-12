"use client";

import { useState } from "react";

export default function TripPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const generateTrip = async () => {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/ai/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                destination: "Paris",
                days: 5,
                budget: "Medium",
                interests: ["Food", "Museums"],
            }),
        });

        const data = await res.json();
        setResult(data.itinerary);
        setLoading(false);
    };

    return (
        <div>
            <button onClick={generateTrip} disabled={loading}>
                Generate Trip
            </button>

            <pre>{result}</pre>
        </div>
    );
}
