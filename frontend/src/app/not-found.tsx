"use client";

import React from 'react';
import { Typography, Button } from 'antd';
import { Compass } from 'lucide-react';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ff4d4f]/20 rounded-full blur-[100px] opacity-40 animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-800/20 rounded-full blur-[100px] opacity-40 animate-pulse delay-700" />

                <div className="glass-effect rounded-[40px] p-12 text-center relative z-10 border border-white/5 shadow-3xl bg-black/40 backdrop-blur-3xl">
                    <div className="mb-10 inline-block">
                        <div className="bg-gradient-to-br from-[#ff4d4f] to-red-800 p-8 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                            <Compass size={80} className="text-white animate-[spin_10s_linear_infinite]" />
                        </div>
                    </div>

                    <Title level={1} className="!text-7xl !font-black !text-white !mb-6 !tracking-tighter !bg-clip-text">
                        404
                    </Title>

                    <Title level={2} className="!text-white !mb-6 !font-bold tracking-tight">
                        Lost in Translation?
                    </Title>

                    <Text className="!text-white/50 !text-xl !block mb-12 max-w-md mx-auto leading-relaxed italic">
                        "This itinerary doesn't exist."
                    </Text>

                    <Link href="/">
                        <Button
                            type="primary"
                            size="large"
                            className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-16 !px-12 !text-xl !rounded-2xl !font-bold shadow-2xl shadow-[#ff4d4f]/30 hover:shadow-[#ff4d4f]/50 transition-all duration-300"
                        >
                            Go Back Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
