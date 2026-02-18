"use client";

import React from 'react';
import { Skeleton } from 'antd';

export default function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full max-w-2xl mx-auto">
            {/* Glass Container */}
            <div className="glass-effect w-full p-8 rounded-2xl animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 bg-white/10 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-6 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-4">
                    <div className="h-32 bg-white/5 rounded-xl"></div>
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                </div>

                {/* Loading Text */}
                <div className="mt-8 text-center">
                    <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-2"></div>
                    <p className="text-white/50 text-sm">Curating your perfect trip...</p>
                </div>
            </div>
        </div>
    );
}
