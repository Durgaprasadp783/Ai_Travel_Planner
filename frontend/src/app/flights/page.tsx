"use client";

import { useState } from "react";
import FlightSearch from "@/components/flights/FlightSearch";
import FlightList from "@/components/flights/FlightList";
import MapComponent from "@/components/flights/MapComponent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Typography } from "antd";

const { Title, Text } = Typography;

export default function App() {
  const [flights, setFlights] = useState<any[]>([]);

  return (
    <ProtectedRoute>
        <div className="max-w-[1200px] mx-auto p-4 lg:p-10 min-h-screen">
          <div className="glass-effect rounded-[40px] p-6 lg:p-12 mb-10 border border-white/5">
              <Title level={1} className="!text-white !mb-2 md:!text-5xl text-3xl font-black">
                ✈️ Flight Planner
              </Title>
              <Text className="!text-white/60 text-lg block mb-8">
                  Search active flights worldwide and trace routes instantly.
              </Text>
              
              <FlightSearch setFlights={setFlights} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <MapComponent flights={flights} />
                  <FlightList flights={flights} />
              </div>
          </div>
        </div>
    </ProtectedRoute>
  );
}
