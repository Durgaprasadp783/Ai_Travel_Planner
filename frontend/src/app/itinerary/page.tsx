"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Timeline, Tag, Button, Empty, Row, Col } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import Link from 'next/link';
// 1. Import Dynamic to load the map only on the client side
import dynamic from 'next/dynamic';

const { Title, Text } = Typography;

// 2. Load the Map component (Disable SSR - Server Side Rendering)
// We do this because the Map needs the browser 'window' to work
const TripMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function ItineraryPage() {
    const [trip, setTrip] = useState<any>(null);

    // LOGIC: Read the data we saved on Day 9
    useEffect(() => {
        const savedTrip = localStorage.getItem('lastPlannedTrip');
        if (savedTrip) {
            setTrip(JSON.parse(savedTrip));
        }
    }, []);

    if (!trip) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <Empty description="No trip found. Go back and plan one!" />
                <Link href="/plan">
                    <Button type="primary" style={{ marginTop: 20 }}>Plan a Trip</Button>
                </Link>
            </div>
        );
    }

    // Extract just the city name for the map (e.g., "Paris, France" -> "Paris")
    const cityForMap = trip.destination ? trip.destination.split(',')[0] : 'Paris';

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <Link href="/plan">
                <Button icon={<ArrowLeftOutlined />} type="link" style={{ marginBottom: 20 }}>
                    Back to Planner
                </Button>
            </Link>

            <Row gutter={[24, 24]}>
                {/* LEFT COLUMN: Trip Details & Map */}
                <Col xs={24} md={14}>
                    <Card style={{ borderRadius: '12px', height: '100%' }}>
                        <Title level={2} style={{ marginTop: 0 }}>Trip to {cityForMap}</Title>

                        <div style={{ marginBottom: 20 }}>
                            <Tag color="blue" style={{ fontSize: '14px', padding: '5px 10px' }}>
                                {trip.startDate} to {trip.endDate}
                            </Tag>
                            <Tag color="green" style={{ fontSize: '14px', padding: '5px 10px' }}>
                                Budget: ${trip.budget}
                            </Tag>
                        </div>

                        {/* 3. RENDER THE MAP HERE */}
                        <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                            <TripMap city={cityForMap} />
                        </div>

                        <Button
                            icon={<PrinterOutlined />}
                            style={{ marginTop: '20px' }}
                            block
                            onClick={() => window.print()}
                        >
                            Print Itinerary
                        </Button>
                    </Card>
                </Col>

                {/* RIGHT COLUMN: Daily Schedule */}
                <Col xs={24} md={10}>
                    <Card title="Daily Schedule" style={{ borderRadius: '12px', height: '100%' }}>
                        <Timeline
                            mode="left"
                            items={[
                                { label: 'Day 1', children: 'Arrival, Hotel Check-in, and Evening City Walk', color: 'green' },
                                { label: 'Day 2', children: 'Major Landmark Visit and Local Cuisine Tour' },
                                { label: 'Day 3', children: 'Museum Exploration and Shopping' },
                                { label: 'Day 4', children: 'Day Trip to Nearby Attractions' },
                                { label: 'Day 5', children: 'Souvenir Shopping and Departure', color: 'red' },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}