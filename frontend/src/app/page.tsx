"use client";

import React, { useEffect, useState } from 'react';
import { Button, Typography, Space, Alert } from 'antd';
import { RocketOutlined, ApiOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function Home() {
  const [backendStatus, KvackendStatus] = useState<string>("Checking connection...");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    fetch(`${apiUrl}/trips`) // Using existing route to test connection
      .then(() => KvackendStatus("Connected to Backend ✅"))
      .catch(() => KvackendStatus("Backend Disconnected ❌"));
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Title>Welcome to AI Travel Planner</Title>
      <Paragraph style={{ fontSize: '18px' }}>
        Plan your dream vacation in seconds using Artificial Intelligence.
      </Paragraph>

      <div style={{ margin: '20px auto', maxWidth: '300px' }}>
        <Alert
          message={backendStatus}
          type={backendStatus.includes("Connected") ? "success" : "error"}
          showIcon
          icon={<ApiOutlined />}
        />
      </div>

      <Space size="large" style={{ marginTop: '20px' }}>
        <Link href="/plan">
          <Button type="primary" size="large" icon={<RocketOutlined />}>
            Start Planning
          </Button>
        </Link>
        <Link href="/login">
          <Button size="large">Login / Sign Up</Button>
        </Link>
      </Space>
    </div>
  );
}