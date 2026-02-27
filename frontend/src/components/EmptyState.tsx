"use client";

import React from 'react';
import { Typography, Button } from 'antd';
import { Map } from 'lucide-react';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function EmptyState() {
    return (
        <div className="glass-effect rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[450px] border border-white/10 shadow-2xl">
            <div className="bg-[#ff4d4f]/10 p-8 rounded-full mb-8 relative group">
                <div className="absolute inset-0 bg-[#ff4d4f]/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50" />
                <Map size={64} className="text-[#ff4d4f] relative z-10" />
            </div>

            <Title level={2} className="!text-white !mb-4 tracking-tight">No Trips Found</Title>

            <Text className="!text-white/60 !text-lg !block mb-10 max-w-sm mx-auto leading-relaxed">
                Ready for your next journey? Let AI design your perfect luxury escape.
            </Text>

            <Link href="/">
                <Button
                    type="primary"
                    size="large"
                    className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-14 !px-10 !text-lg !rounded-2xl !font-bold flex items-center gap-3 shadow-lg shadow-[#ff4d4f]/20"
                >
                    Start Planning
                </Button>
            </Link>
        </div>
    );
}
