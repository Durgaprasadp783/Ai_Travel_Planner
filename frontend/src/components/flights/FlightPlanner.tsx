"use client";

import React, { useState } from 'react';
import FlightSearch from "./FlightSearch";
import FlightList from "./FlightList";
import MapComponent from "./MapComponent";
import { Typography } from "antd";
import { SendOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

const FlightPlanner: React.FC = () => {
    const [flights, setFlights] = useState<any[]>([]);

    return (
        <div className="bg-[#161616] border border-white/10 rounded-[2.5rem] p-8 w-full shadow-2xl flex flex-col min-h-[500px] glass-effect relative overflow-hidden">
             {/* Background design accents */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full -mr-10 -mt-10" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <SendOutlined className="text-blue-500 text-2xl" />
                    <h2 className="text-3xl font-black mb-0 tracking-tight text-white">Flight Planner</h2>
                </div>
                <p className="text-gray-400 text-sm mb-10">
                    Search active flights worldwide and trace routes instantly.
                </p>
            </div>

            <div className="relative z-10 mb-10">
                <FlightSearch setFlights={setFlights} />
            </div>

            <div className="flex-1 relative z-10 bg-white/5 rounded-3xl p-4 border border-white/5 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                    <div className="h-[300px] lg:h-full min-h-[250px] relative overflow-hidden rounded-2xl border border-white/10 shadow-inner">
                         <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-white/70 font-bold border border-white/10 tracking-widest uppercase">Global Radar</div>
                         <MapComponent flights={flights} />
                    </div>
                    <div className="h-[300px] lg:h-full overflow-y-auto pr-2 custom-scrollbar">
                         <AnimatePresence mode="wait">
                            {flights.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    className="h-full flex items-center justify-center italic text-gray-500"
                                >
                                    Select origin & destination to view live availability.
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                     <FlightList flights={flights} />
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightPlanner;
