"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Timeline, Tag, Button, Empty, Row, Col, Divider } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import Link from 'next/link';

// Destructure Title and Text from Typography so we can use them easily
const { Title, Text } = Typography;

export default function ItineraryPage() {
    // 1. STATE: Start with null because we haven't loaded data yet
    const [trip, setTrip] = useState<any>(null);

    // 2. LOGIC: Fetch data from LocalStorage when the page loads
    useEffect(() => {
        const savedTrip = localStorage.getItem('lastPlannedTrip');
        if (savedTrip) {
            setTrip(JSON.parse(savedTrip));
        }
    }, []);

    // --- THE FIX: LOADING/EMPTY STATE CHECK ---
    // This block prevents the "Object is possibly null" error.
    // If 'trip' is null, we stop here and render this empty state instead.
    if (!trip) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
                <Empty description="No trip found. Please plan a trip first!" />
                <Link href="/plan" style={{ marginTop: 20 }}>
                    <Button type="primary">Go to Planner</Button>
                </Link>
            </div>
        );
    }

    // 3. MAIN DISPLAY: Now TypeScript knows 'trip' is guaranteed to exist
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

            {/* Back Button */}
            <Link href="/plan">
                <Button icon={<ArrowLeftOutlined />} type="text" style={{ marginBottom: 20 }}>
                    Back to Planner
                </Button>
            </Link>

            {/* Header Card with Destination and Details */}
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>Trip to {trip.destination}</Title>
                        <div style={{ marginTop: 10 }}>
                            <Tag icon={<CalendarOutlined />} color="blue">
                                {trip.startDate} to {trip.endDate}
                            </Tag>
                            <Tag icon={<DollarOutlined />} color="green">
                                Budget: ${trip.budget}/day
                            </Tag>
                        </div>
                    </Col>
                    <Col>
                        <Button icon={<PrinterOutlined />}>Print</Button>
                    </Col>
                </Row>
            </Card>

            <Divider orientation={"left" as any}>Your AI Itinerary</Divider>

            {/* Day-by-Day Timeline */}
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Timeline
                    mode="left"
                    items={[
                        {
                            color: 'blue',
                            label: 'Day 1',
                            children: (
                                <>
                                    <Text strong>Arrival & Exploration</Text>
                                    <p>Check into your hotel. Visit the city center and enjoy a welcome dinner.</p>
                                </>
                            ),
                        },
                        {
                            color: 'green',
                            label: 'Day 2',
                            children: (
                                <>
                                    <Text strong>Cultural Deep Dive</Text>
                                    <p>Visit the most famous museums and historical landmarks.</p>
                                </>
                            ),
                        },
                        {
                            color: 'red',
                            label: 'Day 3',
                            children: (
                                <>
                                    <Text strong>Adventure & Nature</Text>
                                    <p>Take a day trip to the nearest national park or scenic viewpoint.</p>
                                </>
                            ),
                        },
                        {
                            color: 'gray',
                            label: 'Day 4',
                            children: (
                                <>
                                    <Text strong>Departure</Text>
                                    <p>Buy souvenirs and head to the airport.</p>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
}