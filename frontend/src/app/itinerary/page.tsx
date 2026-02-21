"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Timeline, Tag, Button, Empty, Row, Col } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
// 1. Import Dynamic to load the map only on the client side
import dynamic from 'next/dynamic';

const { Title, Text } = Typography;

// 2. Load the Map component (Disable SSR - Server Side Rendering)
// We do this because the Map needs the browser 'window' to work
const TripMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function ItineraryPage() {
    const [trip, setTrip] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (!trip) return;
        setDownloading(true);
        try {
            const response = await fetch('http://localhost:5000/api/pdf/generate', {
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
            a.download = `Itinerary_${trip.destination || 'Trip'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Ensure Backend (port 5000) and AI Service (port 8000) are running.');
        } finally {
            setDownloading(false);
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
                        <div style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
                            <TripMap
                                origin={trip.origin}
                                destination={trip.destination}
                                originCoordinates={trip.originCoordinates}
                                destinationCoordinates={trip.destinationCoordinates}
                            />
                        </div>

                        <Button
                            icon={<PrinterOutlined />}
                            style={{ marginTop: '20px' }}
                            block
                            onClick={() => window.print()}
                        >
                            Print Itinerary
                        </Button>

                        <Button
                            icon={<DownloadOutlined />}
                            style={{ marginTop: '10px' }}
                            block
                            onClick={handleDownloadPDF}
                            loading={downloading}
                        >
                            Download PDF
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