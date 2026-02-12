"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Layout, ConfigProvider, Menu, Button } from 'antd';
import Link from 'next/link';
import './globals.css';
import { AuthProvider, useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;

const Navbar = () => {
  const { user, logout } = useAuth();

  const items = [
    { key: '1', label: <Link href="/">Home</Link> },
    { key: '2', label: <Link href="/dashboard">My Trips</Link> },
    { key: '3', label: <Link href="/plan">Plan Trip</Link> },
    ...(user ? [
      { key: '4', label: <Link href="/profile">Profile</Link> },
      { key: '5', label: <span onClick={logout}>Logout</span> }
    ] : [
      { key: '6', label: <Link href="/login">Login</Link> }
    ])
  ];

  return (
    <Header style={{
      display: 'flex',
      alignItems: 'center',
      background: '#001529',
      padding: '0 24px'
    }}>
      <div style={{ color: 'white', fontWeight: 'bold', marginRight: '40px' }}>
        AI TRAVEL PLANNER
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        style={{ flex: 1, minWidth: 0 }}
        items={items}
      />
    </Header>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#007bff',
                borderRadius: 8,
              },
            }}
          >
            <AuthProvider>
              <Layout style={{ minHeight: '100vh' }}>
                <Navbar />
                <Content style={{ padding: '24px', background: '#f5f5f5' }}>
                  <main style={{
                    background: '#fff',
                    padding: '24px',
                    minHeight: '80vh',
                    borderRadius: '8px'
                  }}>
                    {children}
                  </main>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                  AI Travel Planner ©2026
                </Footer>
              </Layout>
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}