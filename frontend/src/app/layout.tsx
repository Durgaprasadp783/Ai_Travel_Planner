"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App, theme } from 'antd';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: '#ff4d4f',
                colorBgBase: '#0a0a0a',
                colorBgContainer: '#141414',
                colorBorder: '#333333',
                colorText: '#ffffff',
                colorTextDescription: '#a1a1aa',
                borderRadius: 8,
              },
            }}
          >
            <App>
              <AuthProvider>
                <Navbar />
                <main>
                  {children}
                </main>
              </AuthProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
