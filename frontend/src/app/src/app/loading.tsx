"use client";

import React from 'react';
import { Spin } from 'antd';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            {/* This is the Ant Design Spinner */}
            <Spin size="large" tip="Loading AI Planner..." />
        </div>
    );
}