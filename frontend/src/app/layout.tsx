"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Layout, ConfigProvider, Menu } from 'antd';
import Link from 'next/link';
import './globals.css';

const { Header, Content, Footer } = Layout;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Add suppressHydrationWarning here to stop the console error
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
            <Layout style={{ minHeight: '100vh' }}>
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
                  items={[
                    { key: '1', label: <Link href="/">Home</Link> },
                    { key: '2', label: <Link href="/dashboard">My Trips</Link> },
                    { key: '3', label: <Link href="/plan">Plan Trip</Link> },
                  ]}
                />
              </Header>

              <Content style={{ padding: '24px', background: '#f5f5f5' }}>
                {/* Added a main tag for cleaner HTML structure */}
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
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}