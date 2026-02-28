

async function test() {
    try {
        // get token
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "test@test.com", password: "password" })
        });

        let token = "";
        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
        } else {
            console.log("LOGIN ERR", await loginRes.text());
            return;
        }

        const tripRes = await fetch("http://localhost:5000/api/trips/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                origin: "New York, USA",
                destination: "Goa, India",
                startDate: "2026-02-28",
                endDate: "2026-03-03",
                budget: 10000,
                interests: ["Friends Group", "Beach", "Food"],
                travelMode: "friends"
            })
        });

        console.log("STATUS:", tripRes.status);
        console.log("RESPONSE:", await tripRes.text());
    } catch (err) {
        console.error("SCRIPT ERROR", err);
    }
}

test();
