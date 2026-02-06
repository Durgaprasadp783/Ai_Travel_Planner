"use client";

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Typography, Empty, Button, message, Popconfirm } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function DashboardPage() {
    const [savedTrip, setSavedTrip] = useState<any>(null);

    // 1. Load data when page opens
    useEffect(() => {
        const data = localStorage.getItem('lastPlannedTrip');
        if (data) {
            setSavedTrip(JSON.parse(data));
        }
    }, []);

    // 2. DELETE FUNCTION
    const handleDelete = () => {
        // Remove from browser memory
        localStorage.removeItem('lastPlannedTrip');
        // Update state to remove the card immediately
        setSavedTrip(null);
        message.success('Trip deleted successfully');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <Typography.Title level={2}>My Saved Trips</Typography.Title>

            {savedTrip ? (
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={10}>
                        <Card
                            hoverable
                            title={savedTrip.destination}
                            extra={<Tag color="blue">Upcoming</Tag>}
                            style={{ width: '100%', borderRadius: 12 }}
                            actions={[
                                // VIEW BUTTON
                                <Link href="/itinerary" key="view">
                                    <Button type="link" icon={<EyeOutlined />}>View</Button>
                                </Link>,

                                // DELETE BUTTON (With confirmation popup)
                                <Popconfirm
                                    key="delete"
                                    title="Delete this trip?"
                                    description="This action cannot be undone."
                                    onConfirm={handleDelete}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="text" danger icon={<DeleteOutlined />}>Delete</Button>
                                </Popconfirm>
                            ]}
                        >
                            <div style={{ marginBottom: 10 }}>
                                <p style={{ margin: 0 }}><strong>Dates:</strong> {savedTrip.startDate} to {savedTrip.endDate}</p>
                                <p style={{ margin: 0 }}><strong>Budget:</strong> ${savedTrip.budget}</p>
                            </div>
                        </Card>
                    </Col>
                </Row>
            ) : (
                // EMPTY STATE
                <div style={{ marginTop: 50 }}>
                    <Empty description="No trips planned yet.">
                        <Link href="/plan">
                            <Button type="primary" size="large">Plan a New Trip</Button>
                        </Link>
                    </Empty>
                </div>
            )}
        </div>
    );
}