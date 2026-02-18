"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";

interface User {
    id: string;
    name: string;
    email: string;
}


interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
    isBackendConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBackendConnected, setIsBackendConnected] = useState(true); // Default to true
    const router = useRouter();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setIsBackendConnected(true);
            } else {
                localStorage.removeItem("token");
                // If 401, it's connected but not auth. 
                // But if fetch failed completely, it would go to catch.
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setIsBackendConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const login = (token: string) => {
        localStorage.setItem("token", token);
        checkUserLoggedIn();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        message.success("Logged out successfully");
        router.push("/login"); // Fixed redirection
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isBackendConnected }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
