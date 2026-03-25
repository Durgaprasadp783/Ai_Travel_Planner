"use client";

import React, { useState } from 'react';
import { Button, message, Spin, Empty, Select, InputNumber } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeOutlined, SearchOutlined, UserOutlined, FilterOutlined, StarFilled } from '@ant-design/icons';
import { apiRequest } from '@/lib/api';

const HotelPlanner: React.FC = () => {
    const [city, setCity] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState<number>(2);
    const [sortBy, setSortBy] = useState('recommended');
    
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const searchHotels = async () => {
        if (!city || !checkIn || !checkOut) {
            message.warning("Please fill in destination and dates.");
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            // Passing all new parameters to the backend
            const endpoint = `/hotels?city=${city.toUpperCase()}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&sortBy=${sortBy}`;
            const data = await apiRequest(endpoint, { method: "GET" });
            
            // Assuming the API returns an array directly or inside a results field
            setHotels(Array.isArray(data) ? data : (data.results || []));
            
            if (Array.isArray(data) && data.length === 0) {
                message.info("No stays found for these dates. Try adjusting your search.");
            }
        } catch (err: any) {
            console.error("API Error:", err);
            message.error(err.message || 'Failed to fetch real-time data. Check your API connection.');
            setHotels([]); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#161616] border border-white/10 rounded-[2.5rem] p-8 w-full shadow-2xl flex flex-col min-h-[600px] glass-effect relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4A5A]/10 blur-[80px] rounded-full -mr-10 -mt-10 pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <HomeOutlined className="text-[#FF4A5A] text-2xl" />
                    <h2 className="text-3xl font-black mb-0 tracking-tight text-white">Hotel Planner</h2>
                </div>
                <p className="text-gray-400 text-sm mb-10">
                    Search active hotels worldwide and book stays instantly.
                </p>
            </div>

            {/* Input Group - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 relative z-10">
                
                {/* City Input */}
                <div className="md:col-span-2 bg-[#202020] border border-white/5 rounded-2xl flex items-center px-4 py-3 hover:border-[#FF4A5A]/30 transition-colors group">
                    <HomeOutlined className="text-gray-500 mr-3 group-hover:text-[#FF4A5A] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="City (e.g., GOA)" 
                        value={city}
                        onChange={(e) => setCity(e.target.value.toUpperCase())}
                        className="bg-transparent text-white w-full focus:outline-none placeholder-gray-600 font-bold tracking-wider"
                    />
                </div>
                
                {/* Native Date Pickers */}
                <div className="bg-[#202020] border border-white/5 rounded-2xl flex items-center px-4 py-3 hover:border-[#FF4A5A]/30 transition-colors">
                    <input 
                        type="date" 
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="bg-transparent text-gray-300 w-full focus:outline-none [color-scheme:dark] cursor-pointer"
                        title="Check-in Date"
                    />
                </div>

                <div className="bg-[#202020] border border-white/5 rounded-2xl flex items-center px-4 py-3 hover:border-[#FF4A5A]/30 transition-colors">
                    <input 
                        type="date" 
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="bg-transparent text-gray-300 w-full focus:outline-none [color-scheme:dark] cursor-pointer"
                        title="Check-out Date"
                    />
                </div>

                <Button 
                    type="primary"
                    size="large"
                    icon={<SearchOutlined />}
                    onClick={searchHotels}
                    loading={loading}
                    className="!bg-[#FF4A5A] !border-[#FF4A5A] hover:!bg-[#fb6a77] !h-[60px] md:!h-auto !rounded-2xl !font-black !text-lg !transition-all duration-300 shadow-lg shadow-[#FF4A5A]/20"
                >
                    {loading ? '...' : 'Search'}
                </Button>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-6 mb-10 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Guests</span>
                    <InputNumber 
                        min={1} 
                        max={10} 
                        value={guests}
                        onChange={(val) => setGuests(val || 1)}
                        className="!bg-[#202020] !border-white/5 !text-white !rounded-xl !w-20 hover:!border-[#FF4A5A]/30"
                        controls={true}
                        prefix={<UserOutlined className="text-gray-500" />}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sort By</span>
                    <Select 
                        value={sortBy}
                        onChange={(val) => setSortBy(val)}
                        className="!bg-[#202020] !border-white/5 !text-white !rounded-xl !w-44 custom-antd-select"
                        suffixIcon={<FilterOutlined className="text-gray-500" />}
                        dropdownClassName="!bg-[#1a1a1a] !border-white/10"
                        options={[
                            { value: 'recommended', label: 'Recommended' },
                            { value: 'price_low', label: 'Price (Lowest)' },
                            { value: 'rating_high', label: 'Top Rated' },
                        ]}
                    />
                </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 relative z-10 rounded-3xl overflow-hidden">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4 bg-white/5 rounded-3xl"
                        >
                            <Spin size="large" />
                            <p className="text-gray-400 italic font-medium">Fetching live inventory...</p>
                        </motion.div>
                    ) : !hasSearched ? (
                        <div className="h-full min-h-[300px] flex items-center justify-center bg-white/5 rounded-3xl opacity-30">
                             <Empty description={<span className="text-gray-400 italic">Enter location & dates to browse available stays.</span>} />
                        </div>
                    ) : hotels.length === 0 ? (
                        <div className="h-full min-h-[300px] flex items-center justify-center bg-white/5 rounded-3xl">
                            <p className="text-gray-400 italic">No stays found for these criteria. Try adjusting your search.</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-white font-black text-xl flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                                    Available Stays in {city}
                                </h4>
                                <span className="text-gray-500 text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5">{hotels.length} Properties Found</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {hotels.map((hotel, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl flex justify-between items-center transition-all cursor-pointer group hover:scale-[1.01]"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-xl font-bold text-white group-hover:text-[#FF4A5A] transition-colors">
                                                {hotel.name || hotel.hotel_name || 'Unnamed Hotel'}
                                            </h4>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-yellow-500 flex items-center gap-1 font-bold">
                                                    <StarFilled /> {hotel.rating || hotel.review_score || 'N/A'}
                                                </span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">
                                                    {hotel.amenities?.includes('cancellation') ? 'Free Cancellation' : 'Instant Confirmation'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-[#FF4A5A] font-black text-2xl tracking-tighter">
                                                ${hotel.price || hotel.min_total_price || '0'}
                                            </div>
                                            <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">
                                                per night
                                            </div>
                                            <Button size="small" className="mt-3 !bg-white/10 !border-white/10 !text-white !rounded-lg !text-[10px] !font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Rates
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .custom-antd-select .ant-select-selector {
                    background-color: transparent !important;
                    border: none !important;
                    color: white !important;
                    box-shadow: none !important;
                }
                .custom-antd-select .ant-select-selection-item {
                    color: white !important;
                    font-weight: 600 !important;
                }
                .ant-input-number-input {
                    color: white !important;
                    font-weight: 600 !important;
                }
                [color-scheme:dark]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                }
            `}</style>
        </div>
    );
};

export default HotelPlanner;
