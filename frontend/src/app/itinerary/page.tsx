"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Timeline, Tag, Button, Empty, Row, Col, message } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Share2, Wand2 } from 'lucide-react';
import Link from 'next/link';
// 1. Import Dynamic to load the map only on the client side
import dynamic from 'next/dynamic';
import { apiRequest } from '@/lib/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ItinerarySkeleton from '@/components/ItinerarySkeleton';
import { Modal, Input, App } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 2. Load the Map component (Disable SSR - Server Side Rendering)
// We do this because the Map needs the browser 'window' to work
const TripMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function ItineraryPage() {
    const { message, notification } = App.useApp();
    const [trip, setTrip] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [instruction, setInstruction] = useState('');

    const handleDownloadPDF = async () => {
        if (!trip) return;
        setDownloading(true);
        try {
            const response = await fetch('/api/pdf/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trip),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Itinerary_${(typeof trip.destination === 'object' ? trip.destination.name : trip.destination) || 'Trip'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            notification.error({
                message: 'Download Failed',
                description: 'Failed to download PDF. Ensure the backend is running.',
                placement: 'bottomRight'
            });
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!trip || !trip._id) {
            message.error('Trip ID not found. Ensure the trip is saved.');
            return;
        }
        const shareUrl = `${window.location.origin}/share/${trip._id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            message.success('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
            message.error('Failed to copy link to clipboard.');
        }
    };

    const handleRegenerate = async () => {
        if (!instruction.trim()) {
            message.warning('Please enter some feedback for the AI.');
            return;
        }

        setRegenerating(true);
        setShowAdjustModal(false);

        try {
            const response = await apiRequest(`/trips/${trip._id}/regenerate`, {
                method: 'POST',
                body: JSON.stringify({ userInstruction: instruction }),
            });

            if (response.trip) {
                setTrip(response.trip);
                localStorage.setItem('lastPlannedTrip', JSON.stringify(response.trip));
                message.success('Itinerary updated successfully!');

                // Smooth scroll to top of itinerary
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        } catch (err: any) {
            console.error('Regeneration failed:', err);
            notification.error({
                message: 'Regeneration Error',
                description: err.message || 'Failed to redesign journey. Please check your connection.',
                placement: 'bottomRight'
            });
        } finally {
            setRegenerating(false);
            setInstruction('');
        }
    };

    // LOGIC: Read the data we saved on Day 9
    useEffect(() => {
        const savedTrip = localStorage.getItem('lastPlannedTrip');
        if (savedTrip) {
            setTrip(JSON.parse(savedTrip));
        }
    }, []);

    if (regenerating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <LoadingSkeleton message="Redesigning your journey..." />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20">
                <ItinerarySkeleton />
            </div>
        );
    }

    // Extract just the city name for the map (e.g., "Paris, France" -> "Paris")
    const destName = typeof trip.destination === 'object' ? trip.destination.name : trip.destination;
    const cityForMap = destName ? destName.split(',')[0] : 'Paris';

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    } as const;

    return (
        <div className="max-w-[1200px] mx-auto p-4 lg:p-10">
            <div className="flex justify-between items-center mb-6">
                <Link href="/plan">
                    <Button icon={<ArrowLeftOutlined />} type="link" className="!h-11 flex items-center">
                        Back to Planner
                    </Button>
                </Link>
                <Button
                    type="primary"
                    icon={<Wand2 size={18} />}
                    className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] flex items-center gap-2 !h-11 px-6 !rounded-xl"
                    onClick={() => setShowAdjustModal(true)}
                >
                    Adjust Trip
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {/* LEFT COLUMN: Trip Details & Map */}
                <Col xs={24} lg={14}>
                    <Card className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl !h-full border border-white/5">
                        <Title level={2} className="!text-white !mt-0 !mb-4 md:!text-3xl text-2xl">Trip to {cityForMap}</Title>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <Tag color="red" className="!bg-[#ff4d4f]/20 !border-[#ff4d4f]/30 !text-[#ff4d4f] !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                {trip.startDate} to {trip.endDate}
                            </Tag>
                            <Tag color="green" className="!bg-green-500/10 !border-green-500/20 !text-green-400 !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                Budget: ${trip.budget}
                            </Tag>
                        </div>

                        {/* RENDER THE MAP HERE - Top on Mobile */}
                        <div className="w-full h-[350px] lg:h-[450px] mb-6 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                            <TripMap
                                origin={typeof trip.origin === 'object' ? trip.origin.name : trip.origin}
                                destination={typeof trip.destination === 'object' ? trip.destination.name : trip.destination}
                                originCoordinates={trip.originCoordinates}
                                destinationCoordinates={trip.destinationCoordinates}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Button
                                icon={<PrinterOutlined />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl"
                                onClick={() => window.print()}
                            >
                                Print
                            </Button>

                            <Button
                                icon={<Share2 size={18} />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl flex items-center justify-center"
                                onClick={handleShare}
                            >
                                Share
                            </Button>

                            <Button
                                icon={<DownloadOutlined />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl"
                                onClick={handleDownloadPDF}
                                loading={downloading}
                            >
                                PDF
                            </Button>
                        </div>
                    </Card>
                </Col>

                {/* RIGHT COLUMN: Daily Schedule */}
                <Col xs={24} lg={10}>
                    <Card
                        title={<span className="text-white text-lg">Daily Schedule</span>}
                        className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl h-full border border-white/5"
                    >
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Timeline
                                mode="left"
                                items={trip.itinerary?.dailyPlan?.map((day: any) => ({
                                    label: <span className="text-gray-400 font-medium whitespace-nowrap">Day {day.day}</span>,
                                    children: (
                                        <motion.div variants={itemVariants} className="text-white pb-6">
                                            <div className="font-bold mb-2 text-base text-[#ff4d4f]">{day.title}</div>
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                                                <ul className="pl-2 space-y-4 text-sm text-gray-300 list-none">
                                                    {day.activities.map((act: string, idx: number) => {
                                                        let label = "";
                                                        let icon = "";
                                                        if (idx === 0) { label = "Morning"; icon = "☀️"; }
                                                        else if (idx === 1) { label = "Afternoon"; icon = "🏙️"; }
                                                        else if (idx === 2) { label = "Evening"; icon = "🌙"; }
                                                        else { label = `Activity ${idx + 1}`; icon = "📍"; }

                                                        return (
                                                            <li key={idx} className="flex flex-col gap-1 leading-relaxed">
                                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                                                                    <span>{icon}</span>
                                                                    <span>{label}</span>
                                                                </div>
                                                                <div className="pl-6 text-white text-sm font-medium">
                                                                    {act}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )
                                })) || [
                                        {
                                            label: <span className="text-gray-400">Error</span>,
                                            children: (
                                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                                    <span className="text-red-400">Itinerary data is not available. Please try regenerating the trip.</span>
                                                </div>
                                            )
                                        }
                                    ]}
                            />
                        </motion.div>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Adjust Your Trip"
                open={showAdjustModal}
                onOk={handleRegenerate}
                onCancel={() => setShowAdjustModal(false)}
                okText="Confirm Changes"
                cancelText="Keep Current"
                okButtonProps={{
                    className: "!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875]",
                }}
                className="luxury-modal"
            >
                <div className="py-4">
                    <Text className="text-gray-400 mb-2 block">What would you like to change? (e.g., "Add more outdoor activities", "Focus on fine dining")</Text>
                    <TextArea
                        rows={4}
                        placeholder="Tell the AI what to adjust..."
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="!bg-black/20 !border-white/10 !text-white hover:!border-[#ff4d4f] focus:!border-[#ff4d4f]"
                    />
                </div>
            </Modal>
        </div>
    );
}
