"use client";

import { useState } from "react";

export default function TripPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const generateTrip = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch("/api/ai/generate", {
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

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to generate trip");
            }

            const data = await res.json();
            setResult(data.itinerary);
        } catch (error: any) {
            console.error("Error generating trip:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
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
