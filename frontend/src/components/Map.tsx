"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
    "Rome": [12.4964, 41.9028],
    "Rome, Italy": [12.4964, 41.9028],
};

const DEFAULT_COORDS: [number, number] = [12.4964, 41.9028]; // Rome

// Helper to generate a curved line (Bezier)
function getCurvedRoute(start: [number, number], end: [number, number]) {
    const startLng = start[0];
    const startLat = start[1];
    const endLng = end[0];
    const endLat = end[1];

    const midLng = (startLng + endLng) / 2;
    const midLat = (startLat + endLat) / 2;

    const dist = Math.sqrt(Math.pow(endLng - startLng, 2) + Math.pow(endLat - startLat, 2));
    const arcHeight = dist * 0.25;
    const controlLat = midLat + arcHeight;

    const curvePoints: [number, number][] = [];
    for (let t = 0; t <= 1; t += 0.01) {
        const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * controlLat + t * t * endLat;
        const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * midLng + t * t * endLng;
        curvePoints.push([lat, lng]); // Leaflet uses [lat, lng]
    }
    return curvePoints;
}

interface TripMapProps {
    origin?: string;
    destination?: string;
    originCoordinates?: [number, number];
    destinationCoordinates?: [number, number];
    itinerary?: any;
}

export default function TripMap({ origin, destination, originCoordinates, destinationCoordinates, itinerary }: TripMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);

    // Get Coords: Use Props -> Dictionary -> Default
    const startLngLat: [number, number] = originCoordinates || CITY_COORDINATES[origin || ""] || CITY_COORDINATES["New York"] || DEFAULT_COORDS;
    const endLngLat: [number, number] = destinationCoordinates || CITY_COORDINATES[destination || ""] || CITY_COORDINATES["Rome"] || DEFAULT_COORDS;

    const startCoords: [number, number] = [startLngLat[1], startLngLat[0]];
    const endCoords: [number, number] = [endLngLat[1], endLngLat[0]];

    useEffect(() => {
        if (!mapContainer.current) return;

        // Initialize Map
        if (!map.current) {
            map.current = L.map(mapContainer.current, {
                center: [(startCoords[0] + endCoords[0]) / 2, (startCoords[1] + endCoords[1]) / 2],
                zoom: 3,
                zoomControl: false,
                attributionControl: false
            });

            // Add Dark Mode Tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map.current);
        }

        // Clear existing layers (except tiles)
        map.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.current?.removeLayer(layer);
            }
        });

        // 1. ADD FLIGHT ROUTE LINE
        const curvedPoints = getCurvedRoute([startLngLat[0], startLngLat[1]], [endLngLat[0], endLngLat[1]]);
        L.polyline(curvedPoints, {
            color: '#ff4d4f',
            weight: 3,
            opacity: 0.6,
            dashArray: '10, 10',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(map.current);

        // Collect all coordinates to fit bounds
        const allPoints: [number, number][] = [startCoords, endCoords];

        // 2. ADD ACTIVITY MARKERS (DYNAMIC)
        const activityIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="bg-indigo-500 p-1.5 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        if (itinerary?.dailyPlan) {
            itinerary.dailyPlan.forEach((day: any) => {
                day.activities?.forEach((act: any) => {
                    if (act.lat && act.lng) {
                        const actCoords: [number, number] = [act.lat, act.lng];
                        allPoints.push(actCoords);

                        L.marker(actCoords, { icon: activityIcon })
                            .addTo(map.current!)
                            .bindPopup(`<b>Day ${day.day}: ${act.name}</b><br/><small>${act.address || ''}</small>`);
                    }
                });
            });
        }

        // 3. FIT BOUNDS (Including all activities)
        if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            map.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // 4. ADD START/DEST MARKERS
        const originIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="bg-blue-500 p-2 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-1.1-.3-2.2.3-2.6 1.3-.3.9.1 2 .8 2.5l7.7 5.7-2.1 2.1-1.2-1.2-1.4 1.4 2.8 2.8 1.4-1.4-1.2-1.2 2.1-2.1 5.7 7.7c.5.7 1.6 1.1 2.5.8.9-.4 1.5-1.5 1.3-2.6Z"/></svg></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        L.marker(startCoords, { icon: originIcon }).addTo(map.current)
            .bindPopup(`<b>Start: ${origin || 'Origin'}</b>`);

        const destIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="bg-red-500 p-2 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        L.marker(endCoords, { icon: destIcon }).addTo(map.current)
            .bindPopup(`<b>Dest: ${destination || 'Destination'}</b>`);

    }, [origin, destination, originCoordinates, destinationCoordinates, itinerary, startCoords, endCoords, startLngLat, endLngLat]);

    return (
        <div className="glass-effect rounded-3xl overflow-hidden shadow-2xl h-[400px] w-full relative">
            <div ref={mapContainer} className="h-full w-full bg-[#111]" />
            {/* Overlay Title */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-[1000]">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Flight Route</span>
            </div>
            <style jsx global>{`
                .leaflet-container {
                    background: #111 !important;
                }
                .leaflet-popup-content-wrapper {
                    background: #141414 !important;
                    color: white !important;
                    border-radius: 12px !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                }
                .leaflet-popup-tip {
                    background: #141414 !important;
                }
            `}</style>
        </div>
    );
}
