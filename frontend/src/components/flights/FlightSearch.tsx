"use client";

import { Input, Button, DatePicker } from "antd";
import { useState } from "react";
import axios from "axios";
import { apiRequest } from "@/lib/api";

export default function FlightSearch({ setFlights }: { setFlights: (flights: any[]) => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const searchFlights = async () => {
    try {
      const data = await apiRequest(`/flights?from=${from}&to=${to}`);
      setFlights(data);
    } catch (e) {
      console.error(e);
      alert("Failed to connect to the Flight API. Check backend terminal logs for limits.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Input 
        placeholder="From (DEL)" 
        onChange={e => setFrom(e.target.value.toUpperCase())} 
        size="large"
        className="!bg-white/5 !border-white/10 !text-white !h-12 !rounded-xl placeholder:text-white/30"
      />
      <Input 
        placeholder="To (BOM)" 
        onChange={e => setTo(e.target.value.toUpperCase())} 
        size="large"
        className="!bg-white/5 !border-white/10 !text-white !h-12 !rounded-xl placeholder:text-white/30"
      />
      <DatePicker 
        size="large" 
        className="!w-full md:!w-auto !bg-white/5 !border-white/10 !text-white !h-12 !rounded-xl"
      />
      <Button 
        type="primary" 
        size="large" 
        onClick={searchFlights}
        className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-12 !rounded-xl !text-lg font-bold"
      >
        Search Flights
      </Button>
    </div>
  );
}
