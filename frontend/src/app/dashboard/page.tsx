"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Button, Popconfirm, message, Empty, Spin } from 'antd';
import { DeleteOutlined, EyeOutlined, PlusOutlined, CalendarOutlined, WalletOutlined, CompassOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

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
                message.error("Could not load trips. Please check connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await apiRequest(`/trips/${id}`, { method: "DELETE" });
            message.success('Trip deleted successfully');
            fetchTrips(); // Refresh list
        } catch (error) {
            console.error(error);
            message.error('Failed to delete trip');
            // Local fallback deletion
            if (trips.length === 1 && trips[0]._id === id) {
                localStorage.removeItem('lastPlannedTrip');
                setTrips([]);
            }
        }
    };

    return (
        <ProtectedRoute>
            <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
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
                            <Col xs={24} sm={12} lg={8} key={trip._id || Math.random()}>
                                <div className="glass-effect rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full group">
                                    {/* Image Section */}
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={getImageForTrip(trip._id || 'default')}
                                            alt={trip.destination}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <Title level={3} style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                {trip.destination}
                                            </Title>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="space-y-3 mb-6 flex-grow">
                                            <div className="flex items-center text-gray-300">
                                                <CalendarOutlined className="mr-2 text-[#ff4d4f]" />
                                                <span>{trip.days} Days • {trip.startDate}</span>
                                            </div>
                                            <div className="flex items-center text-gray-300">
                                                <WalletOutlined className="mr-2 text-green-400" />
                                                <span>Budget: ${trip.budget}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <Link href="/itinerary" onClick={() => localStorage.setItem('lastPlannedTrip', JSON.stringify(trip))} className="flex-1">
                                                <Button
                                                    block
                                                    icon={<EyeOutlined />}
                                                    className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/40"
                                                    style={{ height: '40px', borderRadius: '10px' }}
                                                >
                                                    View Itinerary
                                                </Button>
                                            </Link>

                                            <Popconfirm
                                                title="Delete this trip?"
                                                description="This action cannot be undone."
                                                onConfirm={() => handleDelete(trip._id)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    className="!bg-red-500/10 !border-red-500/30 hover:!bg-red-500/30"
                                                    style={{ height: '40px', width: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="glass-effect rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="bg-white/5 p-6 rounded-full mb-6">
                            <CompassOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
                        </div>
                        <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>Ready for your next journey?</Title>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '400px', marginBottom: '32px' }}>
                            You haven't planned any trips yet. Let AI design your perfect luxury escape.
                        </Text>
                        <Link href="/plan">
                            <Button
                                type="primary"
                                size="large"
                                className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-12 !px-8 !text-lg !rounded-xl"
                            >
                                Plan Your First Adventure
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
