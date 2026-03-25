import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePdfFromData = async (trip: any, cityForMap: string, daysList: any[]) => {
    try {
        const doc = new jsPDF("p", "mm", "a4");
        
        // Header
        doc.setFillColor(41, 128, 185); // Blue header
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("Travel Itinerary", 105, 20, { align: "center" });
        
        doc.setFontSize(14);
        const destination = (typeof trip.destination === 'object' ? trip.destination.name : trip.destination) || cityForMap;
        doc.text(`Trip to ${destination}`, 105, 30, { align: "center" });

        // Trip Summary Section
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        let startY = 50;
        
        // Format dates if they exist
        const formatDate = (dateString: string) => {
            if (!dateString) return '';
            try {
                const d = new Date(dateString);
                if (isNaN(d.getTime())) return dateString;
                return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            } catch {
                return dateString;
            }
        };

        const formattedStart = formatDate(trip.startDate);
        const formattedEnd = formatDate(trip.endDate);
        const downloadedDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        
        doc.text(`Downloaded On: ${downloadedDate}`, 14, startY);
        doc.text(`Travel Dates: ${formattedStart || 'N/A'} - ${formattedEnd || 'N/A'}`, 14, startY + 8);
        doc.text(`Travelers: ${trip.peopleCount || 1}`, 14, startY + 16);
        doc.text(`Budget: $${trip.budget || 'N/A'}`, 14, startY + 24);
        doc.text(`Style: ${trip.mode || 'Standard'}`, 14, startY + 32);
        if (trip.origin) {
            doc.text(`Origin: ${trip.origin}`, 14, startY + 40);
        }

        startY += 50;

        // Flights Section
        const flights = daysList.filter((day: any) => day.flight).map((day: any) => day.flight);
        if (flights.length > 0) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(41, 128, 185);
            doc.text("Flight Details", 14, startY);
            startY += 8;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);

            const flightBody = flights.map((f: any) => [
                f.airline || "N/A",
                f.flight || "N/A",
                `${f.from || trip.origin} to ${f.to || cityForMap}`,
                f.departure || "N/A",
                f.arrival || "N/A"
            ]);

            autoTable(doc, {
                startY: startY,
                head: [["Airline", "Flight No.", "Route", "Departure", "Arrival"]],
                body: flightBody,
                theme: "grid",
                headStyles: { fillColor: [52, 73, 94] },
                styles: { fontSize: 9 }
            });

            startY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Add Google Static Map for route
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
        if (apiKey && trip.origin && destination) {
            try {
                // Using precise location strings to avoid bad AI coordinates pulling incorrect locations
                const originStr = trip.origin;
                const destStr = cityForMap;
                
                // Add pins and flight path 
                const markers = `markers=color:red|label:A|${encodeURIComponent(originStr)}&markers=color:blue|label:B|${encodeURIComponent(destStr)}`;
                const path = `path=color:0x0000ff80|weight:4|geodesic:true|${encodeURIComponent(originStr)}|${encodeURIComponent(destStr)}`;
                const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x320&${markers}&${path}&key=${apiKey}`;
                
                // Proxy the image to avoid CORS constraints from Google Maps
                const proxyUrl = `/api/map?url=${encodeURIComponent(mapUrl)}`;
                const res = await fetch(proxyUrl);
                const json = await res.json();
                
                if (json.data) {
                    // Check if map fits on current page
                    if (startY + 90 > 280) {
                        doc.addPage();
                        startY = 20;
                    }
                    
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(41, 128, 185);
                    doc.text("Route Map", 14, startY);
                    
                    doc.addImage(json.data, "PNG", 14, startY + 5, 180, 90);
                    startY += 105;
                }
            } catch (e) {
                console.warn("Failed to attach static map to PDF", e);
            }
        }

        // Daily Schedule Section
        if (startY > 260) {
            doc.addPage();
            startY = 20;
        } else {
            startY += 10;
        }

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Daily Schedule", 14, startY);
        startY += 10;

        daysList.forEach((day: any, i: number) => {
            if (startY > 270) {
                doc.addPage();
                startY = 20;
            }

            let dayTitle = day.title || `Day ${day.day || (i + 1)}`;
            let weatherStr = "";
            if (day.weather && day.weather !== "No forecast available") {
                if (typeof day.weather === 'string') {
                    weatherStr = day.weather;
                } else {
                    const dateStr = day.weather.date ? formatDate(day.weather.date) : "";
                    if (dateStr) {
                        dayTitle += ` - ${dateStr}`;
                    }
                    weatherStr = `${day.weather.condition || 'Unknown'}, ${day.weather.avgTemp || '--'}°C`;
                }
            }

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(52, 73, 94);
            doc.rect(14, startY, 182, 8, 'F');
            doc.text(dayTitle, 16, startY + 6);
            startY += 12;

            if (weatherStr) {
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.setFont("helvetica", "italic");
                doc.text(`Weather Forecast: ${weatherStr}`, 14, startY);
                startY += 8;
            }

            const places = day.places || day.activities || day.plan || [];
            
            if (places.length > 0) {
                const placeBody = places.map((place: any) => {
                    const time = place.time || "N/A";
                    const name = place.name || (typeof place === 'string' ? place : 'Unknown Place');
                    
                    const loc = place.location || place.address || "";
                    const detail = place.description || "";
                    
                    let desc = loc;
                    if (detail && loc) desc += `\n${detail}`;
                    else if (detail) desc = detail;

                    const cost = place.estimatedCost !== undefined ? `$${place.estimatedCost}` : "-";
                    return [time, name, desc || 'N/A', cost];
                });

                autoTable(doc, {
                    startY: startY,
                    head: [["Time", "Activity", "Description/Location", "Cost"]],
                    body: placeBody,
                    theme: "striped",
                    styles: { fontSize: 9, cellPadding: 3 },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 40 },
                        2: { cellWidth: 'auto' },
                        3: { cellWidth: 20, halign: 'right' }
                    },
                    margin: { left: 14 }
                });

                startY = (doc as any).lastAutoTable.finalY + 10;
            } else {
                startY += 5;
            }
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`Generated by AI Travel Planner | Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        }

        doc.save(`Itinerary_${destination.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
        console.error("PDF Generation Error: ", error);
        throw error;
    }
};
