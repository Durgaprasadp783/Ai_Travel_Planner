"use client";

import React from 'react';
import { Button, Typography, Space } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <Title>Welcome to AI Travel Planner</Title>
      <Paragraph style={{ fontSize: '18px' }}>
        Plan your dream vacation in seconds using Artificial Intelligence.
      </Paragraph>
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