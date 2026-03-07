"use client";

import React, { useState } from 'react';
import { Button } from 'antd';
import { Menu as MenuIcon, Home, Map as MapIcon, Briefcase, User, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { label: 'Home', href: '/', icon: <Home size={18} /> },
        { label: 'Plan Trip', href: '/plan', icon: <MapIcon size={18} /> },
        { label: 'My Trips', href: '/dashboard', icon: <Briefcase size={18} /> },
        { label: 'Profile', href: '/profile', icon: <User size={18} /> },
    ];

    const navLinkClasses = (href: string) => `
        relative text-lg font-medium transition-colors duration-300
        ${pathname === href ? 'text-[#ff4d4f]' : 'text-gray-200 hover:text-white'}
    `;

    return (
        <header className="sticky top-0 w-full flex justify-between items-center px-8 py-4 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
            {/* Left side: Logo */}
            <Link href="/" className="logo text-white font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity">
                AI TRAVEL PLANNER
            </Link>

            {/* Right side: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                {user ? (
                    <>
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href} className={navLinkClasses(item.href)}>
                                {item.label}
                                {pathname === item.href && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#ff4d4f]"
                                    />
                                )}
                            </Link>
                        ))}
                        <button
                            onClick={logout}
                            className="border border-white/20 hover:bg-white/10 text-white text-sm font-medium px-5 py-2 rounded-full transition-all flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-gray-200 hover:text-white text-lg font-medium transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="bg-[#ff4d4f] text-white px-5 py-2 rounded-full text-lg font-medium hover:opacity-90 transition-opacity">
                            Register
                        </Link>
                    </>
                )}
            </nav>

            {/* Mobile Hamburger Menu Toggle */}
            <button
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
            >
                {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMenu}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-[#0a0a0a] border-l border-white/10 z-50 md:hidden p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/10">
                                <span className="text-xl font-bold text-white">Menu</span>
                                <button onClick={toggleMenu} className="text-white hover:text-[#ff4d4f] transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6 flex-1">
                                {user ? (
                                    <>
                                        {menuItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={toggleMenu}
                                                className={`flex items-center gap-4 text-lg font-medium transition-colors ${pathname === item.href ? 'text-[#ff4d4f]' : 'text-gray-200 hover:text-white'}`}
                                            >
                                                {item.icon}
                                                {item.label}
                                            </Link>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={toggleMenu}
                                            className="flex items-center gap-4 text-lg font-medium text-gray-200 hover:text-white transition-colors"
                                        >
                                            <User size={20} />
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={toggleMenu}
                                            className="flex items-center gap-4 text-lg font-medium text-white bg-[#ff4d4f] px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                                        >
                                            <User size={20} />
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>

                            {user && (
                                <div className="mt-auto pt-6 border-t border-white/10">
                                    <button
                                        onClick={() => { logout(); toggleMenu(); }}
                                        className="flex items-center gap-4 text-lg font-medium text-[#ff4d4f] hover:opacity-80 transition-opacity w-full text-left"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
