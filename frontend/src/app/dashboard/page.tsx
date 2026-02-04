"use client";

import React from 'react';
import { Card, Typography, Empty, Button } from 'antd';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div style={{ padding: '20px' }}>
            <Typography.Title level={2}>My Saved Trips</Typography.Title>
            <Card>
                <Empty
                    description="You haven't planned any trips yet."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Link href="/plan">
                        <Button type="primary">Create Your First Trip</Button>
                    </Link>
                </Empty>
            </Card>
        </div>
    );
}