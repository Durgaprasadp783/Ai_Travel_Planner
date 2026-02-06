"use client";

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Empty, Button } from 'antd';
import Link from 'next/link';

const { Text } = Typography;

export default function DashboardPage() {
    // We added this state to read the data you saved on Day 9
    const [savedTrip, setSavedTrip] = useState<any>(null);

    useEffect(() => {
        // Check if there is a trip saved in local storage
        const data = localStorage.getItem('lastPlannedTrip');
        if (data) {
            setSavedTrip(JSON.parse(data));
        }
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <Typography.Title level={2}>My Saved Trips</Typography.Title>

            {savedTrip ? (
                // IF A TRIP EXISTS: Show the card with real data
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card
                            hoverable
                            title={savedTrip.destination}
                            extra={<Tag color="blue">Upcoming</Tag>}
                            style={{ width: '100%' }}
                        >
                            <p><strong>Budget:</strong> ${savedTrip.budget}</p>
                            <p><strong>Dates:</strong> {savedTrip.startDate} to {savedTrip.endDate}</p>
                            <Link href="/itinerary">
                                <Button type="primary" block style={{ marginTop: '10px' }}>
                                    View Itinerary
                                </Button>
                            </Link>
                        </Card>
                    </Col>
                </Row>
            ) : (
                // IF NO TRIP EXISTS: Show the empty state
                <Empty
                    description="You haven't planned any trips yet."
                >
                    <Link href="/plan">
                        <Button type="primary">Create Your First Trip</Button>
                    </Link>
                </Empty>
            )}
        </div>
    );
}