"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Timeline, Tag, Button, Empty, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
// 1. Import Dynamic to load the map only on the client side
// 1. Import dynamic to load map only on client side (if needed later)
// import dynamic from 'next/dynamic';
import RouteMap from '@/components/RouteMap';
import { apiRequest } from '@/lib/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ItinerarySkeleton from '@/components/ItinerarySkeleton';
import { App } from 'antd';

const { Title, Text } = Typography;

export default function ItineraryPage() {
    const { message, notification } = App.useApp();
    const [trip, setTrip] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);
    const [expandedDays, setExpandedDays] = useState<number[]>([0]);

    const toggleDay = (idx: number) => {
        setExpandedDays(prev =>
            prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
        );
    };

    const handleDownloadPDF = async () => {
        if (!trip) return;
        setDownloading(true);
        try {
            const response = await fetch('/api/pdf/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trip),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Itinerary_${(typeof trip.destination === 'object' ? trip.destination.name : trip.destination) || 'Trip'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            notification.error({
                message: 'Download Failed',
                description: 'Failed to download PDF. Ensure the backend is running.',
                placement: 'bottomRight'
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!trip || !trip._id) {
            message.error('Trip ID not found. Ensure the trip is saved.');
            return;
        }
        const shareUrl = `${window.location.origin}/share/${trip._id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            message.success('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
            message.error('Failed to copy link to clipboard.');
        }
    };

    // LOGIC: Read the data we saved on Day 9
    useEffect(() => {
        const savedTrip = localStorage.getItem('lastPlannedTrip');
        if (savedTrip) {
            setTrip(JSON.parse(savedTrip));
        }
    }, []);

    if (!trip) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-0">
                <ItinerarySkeleton />
            </div>
        );
    }

    // Extract just the city name for the map (e.g., "Paris, France" -> "Paris")
    const destName = typeof trip.destination === 'object' ? trip.destination.name : trip.destination;
    const cityForMap = destName ? destName.split(',')[0] : 'Paris';

    // Helper to extract days robustly because Gemini JSON structure can vary
    const extractDays = (itineraryData: any) => {
        if (!itineraryData) return [];
        // If it's already an array, use it
        if (Array.isArray(itineraryData)) return itineraryData;
        if (Array.isArray(itineraryData.days)) return itineraryData.days;
        if (Array.isArray(itineraryData.itinerary)) return itineraryData.itinerary;
        if (Array.isArray(itineraryData.dailyPlan)) return itineraryData.dailyPlan;

        // Handle object with keys like "day1", "day2", etc.
        const dayKeys = Object.keys(itineraryData).filter(key => key.toLowerCase().includes('day'));
        if (dayKeys.length > 0 && !Array.isArray(itineraryData.days)) {
            // Check if these keys map to arrays
            const hasArrayValues = dayKeys.some(key => Array.isArray(itineraryData[key]));
            if (hasArrayValues) {
                return dayKeys.map((key, index) => {
                    const placesData = itineraryData[key];
                    return {
                        day: index + 1,
                        title: key,
                        places: Array.isArray(placesData) ? placesData.map((p: any) => typeof p === 'string' ? { name: p } : p) : []
                    };
                });
            }
        }

        // Deep search for any array that looks like days
        const values = Object.values(itineraryData);
        for (const val of values) {
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && (val[0].day || val[0].places || val[0].activities || val[0].plan)) {
                return val;
            }
            if (typeof val === 'object' && val !== null) {
                const subValues = Object.values(val);
                for (const subVal of subValues) {
                    if (Array.isArray(subVal) && subVal.length > 0 && typeof subVal[0] === 'object' && (subVal[0].day || subVal[0].places || subVal[0].activities || subVal[0].plan)) {
                        return subVal;
                    }
                }
            }
        }

        // Final fallback: if there's any array at all in the object values, wrap it 
        const anyArray = values.find(val => Array.isArray(val));
        if (anyArray) {
            return [{
                day: 1,
                title: "Day 1",
                places: (anyArray as any[]).map(p => typeof p === 'string' ? { name: p } : p)
            }];
        }

        return [];
    };

    const daysList = extractDays(trip.itinerary);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    } as const;

    return (
        <div className="max-w-[1200px] mx-auto px-4 pb-4 pt-0 lg:px-10 lg:pb-10 lg:pt-0">
            <div className="flex justify-between items-center mb-6">
                <Link href="/plan">
                    <Button icon={<ArrowLeftOutlined />} type="link" className="!h-11 flex items-center">
                        Back to Planner
                    </Button>
                </Link>
            </div>

            <Row gutter={[24, 24]}>
                {/* LEFT COLUMN: Trip Details & Map */}
                <Col xs={24} lg={14}>
                    <Card className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl !h-full border border-white/5">
                        <div className="mb-4">
                            <Title level={2} className="!text-white !mt-0 !mb-1 md:!text-3xl text-2xl">Trip to {cityForMap}</Title>
                            {trip.origin && (
                                <Text className="text-gray-400 block text-sm">
                                    Journey from <span className="text-blue-400 font-semibold">{trip.origin}</span>
                                </Text>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <Tag color="red" className="!bg-[#ff4d4f]/20 !border-[#ff4d4f]/30 !text-[#ff4d4f] !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                {trip.startDate} to {trip.endDate}
                            </Tag>
                            <Tag color="blue" className="!bg-blue-500/10 !border-blue-500/20 !text-blue-400 !px-3 !py-1.5 !text-sm !rounded-lg m-0 uppercase font-bold">
                                {trip.mode || 'Solo'} Mode
                            </Tag>
                            <Tag color="purple" className="!bg-purple-500/10 !border-purple-500/20 !text-purple-400 !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                {trip.peopleCount || 1} Traveler(s)
                            </Tag>
                            <Tag color="green" className="!bg-green-500/10 !border-green-500/20 !text-green-400 !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                Budget: ${trip.budget}
                            </Tag>
                        </div>

                        {/* RENDER THE MAP HERE - Top on Mobile */}
                        <div className="w-full h-[350px] lg:h-[450px] mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                            <RouteMap
                                places={daysList.flatMap((day: any) => day.places || day.activities || day.plan || [])}
                                origin={trip.origin}
                                destination={cityForMap}
                                originCoords={trip.originCoordinates}
                                destinationCoords={trip.destinationCoordinates}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Button
                                icon={<PrinterOutlined />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl"
                                onClick={() => window.print()}
                            >
                                Print
                            </Button>

                            <Button
                                icon={<Share2 size={18} />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl flex items-center justify-center"
                                onClick={handleShare}
                            >
                                Share
                            </Button>

                            <Button
                                icon={<DownloadOutlined />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl"
                                onClick={handleDownloadPDF}
                                loading={downloading}
                            >
                                PDF
                            </Button>
                        </div>
                    </Card>
                </Col>

                {/* RIGHT COLUMN: Daily Schedule */}
                <Col xs={24} lg={10}>
                    <Card
                        title={<span className="text-white text-lg">Daily Schedule</span>}
                        className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl h-full border border-white/5"
                    >
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-full flex flex-col items-start px-2"
                        >
                            <Timeline
                                style={{ width: '100%' }}
                                items={daysList.map((day: any, i: number) => {
                                    const hasOwnWeather = day.weather && day.weather !== "No forecast available";
                                    const rootWeather = daysList[0]?.weather && daysList[0].weather !== "No forecast available" ? daysList[0].weather : null;

                                    let displayWeather: any = null;
                                    if (hasOwnWeather) {
                                        displayWeather = day.weather;
                                    } else if (rootWeather && typeof rootWeather !== 'string') {
                                        const originalDate = new Date(rootWeather.date || trip.startDate || Date.now());
                                        const derivedDate = new Date(originalDate.getTime() + i * 86400000);
                                        displayWeather = { ...rootWeather, date: derivedDate.toISOString() };
                                    }

                                    return {
                                        children: (
                                            <motion.div variants={itemVariants} className="text-white pb-6 w-full text-left">
                                                <div
                                                    className="flex flex-col items-start w-full gap-2 mb-3 text-left cursor-pointer group rounded-xl p-2 -ml-2 hover:bg-white/5 transition-colors"
                                                    onClick={() => toggleDay(i)}
                                                >
                                                    <div className="w-full flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                                                        <div className="font-bold text-base text-[#ff4d4f] leading-snug text-left mb-2 sm:mb-0 flex items-center gap-2 group-hover:text-[#ff7875] transition-colors">
                                                            {expandedDays.includes(i) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                            Day {day.day || (i + 1)}: {day.title}
                                                        </div>
                                                        {day.dailyBudgetAllocated && (
                                                            <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 font-bold uppercase tracking-wider ml-0 sm:ml-4">
                                                                Daily Budget: ${day.dailyBudgetAllocated}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {displayWeather && (
                                                        <div className="text-sm font-medium text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-blue-500/20 w-fit mt-1 ml-6">
                                                            {typeof displayWeather === 'string' ? displayWeather : (
                                                                <>
                                                                    <span className="text-lg">{displayWeather.icon?.includes('rain') ? '🌧️' : displayWeather.icon?.includes('cloud') ? '☁️' : '☀️'}</span>
                                                                    <span>
                                                                        {displayWeather.date && <span className="font-semibold">{new Date(displayWeather.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: </span>}
                                                                        {displayWeather.avgTemp}°C, {displayWeather.condition}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <AnimatePresence>
                                                    {expandedDays.includes(i) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm w-full ml-6">
                                                                <ul className="pl-2 space-y-4 text-sm text-gray-300 list-none">
                                                                    {(day.places || day.activities || day.plan || [])?.map((place: any, idx: number) => {
                                                                        let icon = "📍";
                                                                        if (idx === 0) icon = "☀️";
                                                                        else if (idx === 1) icon = "🏙️";
                                                                        else if (idx === 2) icon = "🌙";

                                                                        return (
                                                                            <li key={idx} className="flex flex-col gap-1 leading-relaxed items-start text-left w-full">
                                                                                <div className="flex gap-2 text-[10px] uppercase tracking-wider font-bold text-gray-500 items-start w-full">
                                                                                    <span>{icon}</span>
                                                                                    <span>{place.time || `Stop ${idx + 1}`}</span>
                                                                                </div>
                                                                                <div className="pl-6 flex flex-col items-start text-left w-full">
                                                                                    <div className="flex justify-between items-start w-full">
                                                                                        <div className="text-white text-[15px] font-semibold">
                                                                                            {place.name || (typeof place === 'string' ? place : 'Unknown Place')}
                                                                                        </div>
                                                                                        {place.estimatedCost !== undefined && (
                                                                                            <div className="text-green-400 font-mono text-xs">
                                                                                                ${place.estimatedCost}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-left text-sm text-gray-400 mt-0.5 w-full">
                                                                                        {place.location || place.address || place.description || 'No description available.'}
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )
                                    };
                                }) || [
                                        {
                                            label: <span className="text-gray-400">Error</span>,
                                            children: (
                                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                    <span className="text-red-400">Itinerary data is not available. Please try regenerating the trip.</span>
                                                </div>
                                            )
                                        }
                                    ]}
                            />
                        </motion.div>
                    </Card>
                </Col>
            </Row>


        </div>
    );
}
