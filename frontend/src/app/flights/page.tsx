import FlightPlanner from "@/components/flights/FlightPlanner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PlannerPage() {
  return (
    <ProtectedRoute>
       <div className="max-w-[1200px] mx-auto px-4 pb-4 pt-0 lg:px-10 lg:pb-10 lg:pt-0 min-h-screen">
          <div className="mt-8 mb-12">
             {/* Spacing for a cleaner look */}
          </div>
          <FlightPlanner />
       </div>
    </ProtectedRoute>
  );
}


