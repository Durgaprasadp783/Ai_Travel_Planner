"use client";

import React, { useEffect } from 'react';
import { notification } from 'antd';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const ConnectionNotifier = () => {
    const { isBackendConnected, loading } = useAuth();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (!loading && isBackendConnected === false) {
            api.error({
                message: 'Backend Disconnected',
                description: 'Cannot connect to the AI Travel Planner server. Please ensure the backend is running.',
                placement: 'bottomRight',
                duration: 0, // Don't close automatically
                icon: <DisconnectOutlined style={{ color: '#ff4d4f' }} />,
                key: 'backend-error', // Prevent duplicates
            });
        } else if (isBackendConnected === true) {
            // Clear the notification if connection is restored
            notification.destroy('backend-error');
        }
    }, [isBackendConnected, loading, api]);

    return <>{contextHolder}</>;
};

export default ConnectionNotifier;
