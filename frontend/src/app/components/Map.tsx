"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing marker icons in React Leaflet
// (Leaflet's default icons sometimes break in React, this fixes it)
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function TripMap({ city }: { city: string }) {
    // Simple logic to choose coordinates based on the city name
    // In a real app, the AI would give us exact numbers.
    const coordinates: { [key: string]: [number, number] } = {
        "Paris": [48.8566, 2.3522],
        "Tokyo": [35.6762, 139.6503],
        "New York": [40.7128, -74.0060],
        "London": [51.5074, -0.1278],
    };

    const position = coordinates[city] || [48.8566, 2.3522]; // Default to Paris

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: '20px' }}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position} icon={icon}>
                    <Popup>
                        Welcome to {city}!
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}