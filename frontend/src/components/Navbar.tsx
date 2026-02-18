"use client";

import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { Menu as MenuIcon, Home, Map, Briefcase, User, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const { Header } = Layout;

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const menuItems = [
        { label: 'Home', href: '/', icon: <Home size={20} /> },
        { label: 'Plan Trip', href: '/plan', icon: <Map size={20} /> },
        { label: 'My Trips', href: '/dashboard', icon: <Briefcase size={20} /> },
    ];

    return (
        <>
            <Header style={{
                position: 'fixed',
                top: 0,
                zIndex: 1000,
                width: '100%',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                height: '64px',
                lineHeight: '64px',
            }}>
                <div className="logo" style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    AI TRAVEL PLANNER
                </div>
                <Button
                    type="text"
                    icon={<MenuIcon color="white" size={24} />}
                    onClick={showDrawer}
                    style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />
            </Header>

            {/* Framer Motion Sidebar */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 1001
                            }}
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }} // Existing Drawer is usually tween
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                width: '300px', // Standard drawer width
                                height: '100vh',
                                background: '#0a0a0a',
                                borderLeft: '1px solid #333',
                                zIndex: 1002,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '24px'
                            }}
                        >
                            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                                <span className="text-xl font-bold text-white">Menu</span>
                                <Button
                                    type="text"
                                    icon={<X color="white" />}
                                    onClick={onClose}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            color: pathname === item.href ? '#1890ff' : 'white',
                                            fontSize: '1.1rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}

                                {user && (
                                    <Link
                                        href="/profile"
                                        onClick={onClose}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            color: pathname === '/profile' ? '#1890ff' : 'white',
                                            fontSize: '1.1rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <User size={20} />
                                        Profile
                                    </Link>
                                )}

                                {!user && (
                                    <Link
                                        href="/login"
                                        onClick={onClose}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <User size={20} />
                                        Login
                                    </Link>
                                )}
                            </div>

                            {user && (
                                <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '24px' }}>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<LogOut size={20} />}
                                        onClick={() => {
                                            logout();
                                            onClose();
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            paddingLeft: 0,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
