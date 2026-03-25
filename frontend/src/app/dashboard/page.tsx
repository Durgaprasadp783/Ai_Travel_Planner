"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Button, Popconfirm, message, Empty, Spin } from 'antd';
import { DeleteOutlined, EyeOutlined, PlusOutlined, CalendarOutlined, WalletOutlined, CompassOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/EmptyState';

const { Title, Text } = Typography;

// Curated Luxury Travel Images (High Quality Unsplash IDs)
const LUXURY_IMAGES = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // Swiss Alps
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", // Paris
    "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?w=800&q=80", // Taj Mahal
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80", // Venice
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80", // Cinque Terre
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", // Tokyo
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80", // London
    "https://images.unsplash.com/photo-1512453979798-5ea904ac2294?w=800&q=80", // Dubai
];

const getImageForTrip = (id: string) => {
    // Deterministic random image based on trip ID char code sum
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return LUXURY_IMAGES[sum % LUXURY_IMAGES.length];
};

export default function DashboardPage() {
    const [messageApi, contextHolder] = message.useMessage();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const data = await apiRequest('/trips', { method: "GET" });

            // Handle both array and wrapped response
            const tripsArray = Array.isArray(data) ? data : (data.trips || []);
            setTrips(tripsArray);
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            // Fallback to localStorage if API fails (e.g. during dev/demo)
            const localTrip = localStorage.getItem('lastPlannedTrip');
            if (localTrip) {
                setTrips([JSON.parse(localTrip)]);
            } else {
                messageApi.error("Could not load trips. Please check connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleDelete = async (tripId: string) => {
        try {
            await apiRequest(`/trips/${tripId}`, { method: "DELETE" });
            setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
            messageApi.success('Trip deleted successfully');
        } catch (error: any) {
            console.error(error);
            messageApi.error(error.message || 'Failed to delete trip');
        }
    };


    return (
        <ProtectedRoute>
            {contextHolder}
            <div className="max-w-[1200px] mx-auto px-4 pb-4 pt-0 lg:px-10 lg:pb-10 lg:pt-0 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <Title level={2} style={{ color: 'white', margin: 0 }}>My Adventures</Title>
                    <Link href="/plan">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875]"
                            style={{ borderRadius: '12px', height: '48px', fontWeight: 'bold' }}
                        >
                            New Trip
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : trips.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {trips.map((trip: any) => (
                            <Col xs={24} md={12} lg={8} key={trip._id || Math.random()}>
                                <motion.div
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    className="glass-effect rounded-3xl overflow-hidden flex flex-col h-full group"
                                >
                                    {/* Image Section */}
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={getImageForTrip(trip._id || 'default')}
                                            alt={typeof trip.destination === 'object' ? trip.destination.name : trip.destination}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <Title level={3} style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                {typeof trip.destination === 'object' ? trip.destination.name : trip.destination}
                                            </Title>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="space-y-3 mb-6 flex-grow">
                                            <div className="flex items-center text-gray-300">
                                                <CalendarOutlined className="mr-2 text-[#ff4d4f]" />
                                                <span>{trip.days} Days • {typeof trip.destination === 'object' && trip.destination.startDate ? trip.destination.startDate : trip.startDate || 'Any time'}</span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                                <WalletOutlined className="mr-2 text-green-400" />
                                                <span>Budget: ${trip.budget}</span>
                                            </div>
                                            <div className="flex items-center text-gray-400 text-xs gap-3 flex-wrap">
                                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">{trip.mode || 'solo'}</span>
                                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{trip.peopleCount || 1} Travelers</span>
                                            </div>
                                        </div>

                                        {/* Choose Interests Section */}
                                        {trip.interests && trip.interests.length > 0 && (
                                            <div className="choose-interests-section mt-4 mb-6" style={{ fontFamily: 'sans-serif', color: '#ffffff', backgroundColor: '#121212', padding: '15px', borderRadius: '12px' }}>
                                                <h4 className="interests-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', color: '#e0e0e0', marginTop: 0 }}>Choose Interests</h4>
                                                <div className="interests-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {trip.interests.map((interest: string, index: number) => (
                                                        <span key={index} className="interest-pill" style={{ padding: '6px 16px', fontSize: '12px', color: '#b3b3b3', backgroundColor: 'transparent', border: '1px solid #404040', borderRadius: '20px', display: 'inline-block' }}>
                                                            {interest}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3 mt-auto">
                                            <Link href="/itinerary" onClick={() => localStorage.setItem('lastPlannedTrip', JSON.stringify(trip))} className="flex-1">
                                                <Button
                                                    block
                                                    icon={<EyeOutlined />}
                                                    className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/40 !h-12 !rounded-xl"
                                                >
                                                    View Itinerary
                                                </Button>
                                            </Link>

                                            <Popconfirm
                                                title="Delete this adventure?"
                                                description="This will permanently remove the trip and itinerary."
                                                onConfirm={() => handleDelete(trip._id)}
                                                okText="Yes, Delete"
                                                cancelText="Cancel"
                                                okButtonProps={{ danger: true, className: '!bg-red-500 hover:!bg-red-600' }}
                                            >
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    className="!bg-red-500/10 !border-red-500/30 hover:!bg-red-500/30 !h-12 !w-12 !rounded-xl flex justify-center items-center"
                                                />
                                            </Popconfirm>

                                        </div>
                                    </div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <EmptyState />
                )}
            </div>
        </ProtectedRoute>
    );
}