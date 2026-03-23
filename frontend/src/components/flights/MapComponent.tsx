"use client";

import { GoogleMap, Polyline, useLoadScript } from "@react-google-maps/api";

export default function MapComponent({ flights }: { flights: any[] }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  if (flights.length === 0) return null;
  if (!isLoaded) return <div className="text-white p-4">Loading Map...</div>;

  const validFlights = flights.filter(
    (f) => !isNaN(Number(f.dep_lat)) && !isNaN(Number(f.dep_lng)) && !isNaN(Number(f.arr_lat)) && !isNaN(Number(f.arr_lng))
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-white/20 mt-4 shadow-xl">
      <GoogleMap 
         zoom={4} 
         center={{ lat: Number(validFlights[0]?.dep_lat || 20.5937), lng: Number(validFlights[0]?.dep_lng || 78.9629) }} 
         mapContainerStyle={{ height: "400px", width: "100%" }}
      >
        {validFlights.map((f, i) => (
          <Polyline
            key={i}
            path={[
              { lat: Number(f.dep_lat), lng: Number(f.dep_lng) },
              { lat: Number(f.arr_lat), lng: Number(f.arr_lng) },
            ]}
            options={{
              strokeColor: "#ff4d4f",
              strokeWeight: 4,
              strokeOpacity: 0.8,
              geodesic: true,
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
