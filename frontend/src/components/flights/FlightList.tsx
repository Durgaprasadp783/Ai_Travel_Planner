"use client";

export default function FlightList({ flights }: { flights: any[] }) {
  if (!flights || flights.length === 0) {
      return <div className="mt-6 text-gray-400 text-center italic">No active flights found for this route.</div>;
  }

  const formatTime = (timeString: string) => {
      if (!timeString || timeString === "TBD") return "TBD";
      try {
          const d = new Date(timeString);
          if (isNaN(d.getTime())) return "TBD";
          return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } catch (e) {
          return "TBD";
      }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <h3 className="text-white text-xl font-bold mb-2">Available Flights</h3>
      {flights.map((f, i) => (
        <div key={i} className="border border-white/10 rounded-2xl p-6 bg-white/5 text-white hover:bg-white/10 transition-colors">
          <div className="font-bold text-xl text-[#e8b538] mb-2">✈️ {f.airline} <span className="text-sm font-normal text-gray-400">({f.flight})</span></div>
          <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl">
              <div className="text-center">
                  <div className="text-2xl font-bold">{f.from}</div>
                  <div className="text-sm text-gray-400">🕒 {formatTime(f.departure)}</div>
              </div>
              <div className="flex-1 px-4 flex items-center justify-center text-gray-500">
                  <div className="h-[2px] w-full bg-gray-600 relative">
                     <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/30 px-2 rounded-full text-xs">Direct</span>
                  </div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold">{f.to}</div>
                  <div className="text-sm text-gray-400">🕒 {formatTime(f.arrival)}</div>
              </div>
          </div>
          <div className="mt-4 flex gap-2">
              <div className={`px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider ${f.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-300'}`}>
                Status: {f.status}
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}
