"use client";

import React from 'react';
import { Row, Col, Card, Skeleton, Space } from 'antd';

export default function ItinerarySkeleton() {
    return (
        <div className="max-w-[1200px] mx-auto p-4 lg:p-10">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <Skeleton.Button active size="large" style={{ width: 120, height: 44, borderRadius: 12 }} />
                <Skeleton.Button active size="large" style={{ width: 140, height: 44, borderRadius: 12 }} />
            </div>

            <Row gutter={[24, 24]}>
                {/* LEFT COLUMN: Trip Details & Map Skeleton */}
                <Col xs={24} lg={14}>
                    <Card className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl !h-full p-6 border border-white/5">
                        <Skeleton active title={{ width: '60%' }} paragraph={{ rows: 1, width: '40%' }} className="mb-6" />

                        <div className="flex gap-2 mb-8">
                            <Skeleton.Button active size="small" style={{ width: 150, height: 32, borderRadius: 8 }} />
                            <Skeleton.Button active size="small" style={{ width: 100, height: 32, borderRadius: 8 }} />
                        </div>

                        {/* Map Area Skeleton - Top on mobile mimics page.tsx */}
                        <div className="bg-white/5 rounded-2xl w-full h-[350px] lg:h-[450px] mb-8 overflow-hidden">
                            <div className="w-full h-full animate-pulse bg-white/5 shadow-inner" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Skeleton.Button active block style={{ height: 48, borderRadius: 12 }} />
                            <Skeleton.Button active block style={{ height: 48, borderRadius: 12 }} />
                            <Skeleton.Button active block style={{ height: 48, borderRadius: 12 }} />
                        </div>
                    </Card>
                </Col>

                {/* RIGHT COLUMN: Daily Schedule Skeleton */}
                <Col xs={24} lg={10}>
                    <Card
                        title={<Skeleton.Button active size="small" style={{ width: 140, height: 28, borderRadius: 8 }} />}
                        className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl h-full p-6 border border-white/5"
                    >
                        <div className="space-y-10">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                        <div className="w-[1px] flex-1 bg-white/5 mt-2" />
                                    </div>
                                    <div className="flex-1">
                                        <Skeleton active paragraph={{ rows: 2, width: ['100%', '70%'] }} title={false} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
