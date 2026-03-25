"use client";

import React from 'react';
import FlightPlanner from './flights/FlightPlanner';
import HotelPlanner from './hotel/HotelPlanner';
import { motion } from 'framer-motion';
import { CompassOutlined, GlobalOutlined } from '@ant-design/icons';

const TravelDashboard: React.FC = () => {
    return (
        <div className="w-full min-h-screen bg-[#0A0A0A] text-white px-4 py-8 lg:p-12 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF4A5A]/5 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto relative z-10">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#FF4A5A]/20 p-3 rounded-2xl border border-[#FF4A5A]/30">
                            <CompassOutlined className="text-[#FF4A5A] text-3xl" />
                        </div>
                        <h1 className="text-4xl md:text-5l lg:text-6xl font-black tracking-tight mb-0">
                            Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4A5A] to-[#fb6a77]">Planner</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                        Design your perfect journey by coordinating flights and stays in one intuitive workspace.
                    </p>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex h-full"
                    >
                        <FlightPlanner />
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex h-full"
                    >
                        <HotelPlanner />
                    </motion.div>
                </div>

                {/* Footer Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4"
                >
                    <div className="flex items-center gap-2">
                         <GlobalOutlined />
                         <span>Global Network • Search active across 10,000+ routes</span>
                    </div>
                    <div className="flex gap-6">
                        <span className="hover:text-white transition-colors cursor-pointer">Security Protocol 2.4 v</span>
                        <span className="hover:text-white transition-colors cursor-pointer">Live Data Feed ✓</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TravelDashboard;
