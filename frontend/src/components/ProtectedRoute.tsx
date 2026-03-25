"use client";

import { useEffect, useState } from 'react'; // Added useState here
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // 1. ADDED: The Hydration Safety State
    const [isMounted, setIsMounted] = useState(false);

    const { user, loading } = useAuth();
    const router = useRouter();

    // 2. ADDED: Tell React the browser has successfully taken over
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- YOUR EXACT ORIGINAL CODE BELOW ---

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // 3. ADDED: If we are still on the server, return nothing to prevent the mismatch
    if (!isMounted) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-darkBg">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return <>{children}</>;
}