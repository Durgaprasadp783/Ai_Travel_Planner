"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Plane, MapPin } from 'lucide-react';
import { createRoot } from 'react-dom/client';

// Dictionary for demo coordinates (Mock Geocoding)
const CITY_COORDINATES: { [key: string]: [number, number] } = {
    "New York, USA": [-74.0060, 40.7128],
    "New York": [-74.0060, 40.7128],
    "Paris, France": [2.3522, 48.8566],
    "Paris": [2.3522, 48.8566],
    "Tokyo, Japan": [139.6503, 35.6762],
    "Tokyo": [139.6503, 35.6762],
    "London, UK": [-0.1278, 51.5074],
    "London": [-0.1278, 51.5074],
    "San Francisco": [-122.4194, 37.7749],
    "Dubai": [55.2708, 25.2048],
};

// Fallback if not found
const DEFAULT_COORDS: [number, number] = [2.3522, 48.8566]; // Paris

// Helper to generate a curved line (Bezier)
// Simple quadratic bezier for visual effect
function getCurvedRoute(start: [number, number], end: [number, number]) {
    const startLng = start[0];
    const startLat = start[1];
    const endLng = end[0];
    const endLat = end[1];

    const midLng = (startLng + endLng) / 2;
    const midLat = (startLat + endLat) / 2;

    // Add arc height based on distance
    const dist = Math.sqrt(Math.pow(endLng - startLng, 2) + Math.pow(endLat - startLat, 2));
    const arcHeight = dist * 0.25; // Adjust curve intensity

    // Check direction to curve appropriately (e.g., typically upwards/north for long flights)
    const controlLat = midLat + arcHeight;

    // Generate points along the quadratic bezier curve
    const curvePoints = [];
    for (let t = 0; t <= 1; t += 0.01) {
        const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * controlLat + t * t * endLat;
        const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * midLng + t * t * endLng;
        curvePoints.push([lng, lat]);
    }
    return curvePoints;
}

interface TripMapProps {
    origin?: string;
    destination?: string;
    originCoordinates?: [number, number];
    destinationCoordinates?: [number, number];
}

export default function TripMap({ origin, destination, originCoordinates, destinationCoordinates }: TripMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [tokenError, setTokenError] = useState(false);

    // Get Coords: Use Props -> Dictionary -> Default
    const startCoords: [number, number] = originCoordinates || CITY_COORDINATES[origin || ""] || CITY_COORDINATES["New York"] || DEFAULT_COORDS;
    const endCoords: [number, number] = destinationCoordinates || CITY_COORDINATES[destination || ""] || CITY_COORDINATES["Paris"] || DEFAULT_COORDS;

    useEffect(() => {
        // Token Handling
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        // Using a hardcoded public token for demo if env is missing, OR handle error.
        // NOTE: In production, strictly use ENV.

        if (!token) {
            setTokenError(true);
            return;
        }

        mapboxgl.accessToken = token;

        if (map.current) return; // Initialize only once

        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [(startCoords[0] + endCoords[0]) / 2, (startCoords[1] + endCoords[1]) / 2],
                zoom: 1,
                attributionControl: false
            });

            map.current.on('load', () => {
                if (!map.current) return;

                // 1. ADD ROUTE LINE
                const routeGeoJSON = {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: getCurvedRoute(startCoords, endCoords)
                    }
                };

                map.current.addSource('route', {
                    type: 'geojson',
                    data: routeGeoJSON as any
                });

                map.current.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#ff4d4f', // Accent Red
                        'line-width': 3,
                        'line-opacity': 0.8
                    }
                });

                // 2. FIT BOUNDS
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend(startCoords);
                bounds.extend(endCoords);
                map.current.fitBounds(bounds, {
                    padding: 80,
                    animate: true,
                    duration: 2000
                });

                // 3. ADD CUSTOM MARKERS

                // Origin Marker (Plane)
                const originEl = document.createElement('div');
                originEl.className = 'custom-marker';
                const originRoot = createRoot(originEl);
                originRoot.render(
                    <div className="bg-blue-500 p-2 rounded-full shadow-lg border-2 border-white">
                        <Plane color="white" size={20} />
                    </div>
                );

                new mapboxgl.Marker(originEl)
                    .setLngLat(startCoords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="color:black; font-weight:bold;">Start: ${origin || 'Origin'}</div>`)) // Mapbox popups default to white bg, ensuring text is readable
                    .addTo(map.current);

                // Destination Marker (MapPin)
                const destEl = document.createElement('div');
                destEl.className = 'custom-marker';
                const destRoot = createRoot(destEl);
                destRoot.render(
                    <div className="bg-red-500 p-2 rounded-full shadow-lg border-2 border-white">
                        <MapPin color="white" size={20} />
                    </div>
                );

                new mapboxgl.Marker(destEl)
                    .setLngLat(endCoords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div style="color:black; font-weight:bold;">Dest: ${destination || 'Destination'}</div>`))
                    .addTo(map.current);
            });
        }
    }, [origin, destination]); // Re-run if props change? Mapbox logic usually needs careful cleanup. For now, simple init.

    if (tokenError) {
        return <div className="h-full w-full flex items-center justify-center text-white bg-red-900/20 rounded-3xl">Missing Mapbox Token</div>;
    }

    return (
        <div className="glass-effect rounded-3xl overflow-hidden shadow-2xl h-[400px] w-full relative">
            <div ref={mapContainer} className="h-full w-full" />
            {/* Overlay Title */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Flight Route</span>
            </div>
        </div>
    );
}
