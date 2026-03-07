"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Card, Timeline, Tag, Button, Empty, Row, Col, Spin, Result } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Compass } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import ItinerarySkeleton from '@/components/ItinerarySkeleton';

const { Title, Text } = Typography;

const TripMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function SharedItineraryPage() {
    const params = useParams();
    const id = params?.id as string;
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchSharedTrip = async () => {
            try {
                setLoading(true);
                const data = await apiRequest(`/trips/share/${id}`);
                setTrip(data);
            } catch (err: any) {
                console.error('Error fetching shared trip:', err);
                setError(err.message || 'Failed to load shared trip.');
            } finally {
                setLoading(false);
            }
        };

        fetchSharedTrip();
    }, [id]);

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
            a.download = `Itinerary_${trip.destination || 'Trip'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Ensure Backend is running.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-20">
                <ItinerarySkeleton />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Result
                    status="404"
                    title="Shared Trip Not Found"
                    subTitle={error || "The link might be broken or the trip has been deleted."}
                    extra={
                        <Link href="/">
                            <Button type="primary">Back to Home</Button>
                        </Link>
                    }
                />
            </div>
        );
    }

    const cityForMap = trip.destination ? trip.destination.split(',')[0] : 'Destination';

    return (
        <div className="max-w-[1200px] mx-auto p-4 lg:p-10 pb-32">
            {/* Header CTA */}
            <div className="glass-effect rounded-2xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 gap-4">
                <div className="flex items-center gap-3">
                    <Compass className="text-[#ff4d4f]" size={24} />
                    <Text className="text-white font-medium">Shared via Luxury Travel Planner</Text>
                </div>
                <Link href="/" className="w-full sm:w-auto">
                    <Button type="primary" className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-11 w-full sm:w-auto !rounded-xl font-bold">
                        Plan My Own Trip
                    </Button>
                </Link>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Card className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl overflow-hidden border border-white/5 p-2 sm:p-4">
                        <Title level={2} className="!text-white !mt-0 !mb-4 text-2xl md:text-3xl">Trip to {cityForMap}</Title>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <Tag color="red" className="!bg-[#ff4d4f]/20 !border-[#ff4d4f]/30 !text-[#ff4d4f] !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                {trip.startDate} to {trip.endDate}
                            </Tag>
                            <Tag color="green" className="!bg-green-500/10 !border-green-500/20 !text-green-400 !px-3 !py-1.5 !text-sm !rounded-lg m-0">
                                Budget: ${trip.budget}
                            </Tag>
                        </div>

                        <div className="w-full h-[350px] lg:h-[450px] mb-6 rounded-2xl overflow-hidden border border-white/10">
                            <TripMap
                                origin={trip.origin}
                                destination={trip.destination}
                                originCoordinates={trip.originCoordinates}
                                destinationCoordinates={trip.destinationCoordinates}
                                itinerary={trip.itinerary}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                icon={<PrinterOutlined />}
                                className="!bg-white/5 !border-white/10 !text-white hover:!bg-white/10 !h-12 !rounded-xl"
                                onClick={() => window.print()}
                            >
                                Print
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

                <Col xs={24} lg={10}>
                    <Card title={<span className="text-white text-lg">Daily Schedule</span>} className="glass-effect !bg-black/40 !border-white/10 !rounded-3xl h-full border border-white/5">
                        <Timeline
                            mode="left"
                            items={trip.itinerary?.dailyPlan?.map((day: any) => ({
                                label: <span className="text-gray-400 font-medium">Day {day.day}</span>,
                                children: (
                                    <div className="text-white pb-6">
                                        <div className="font-bold mb-2 text-base text-[#ff4d4f]">{day.title}</div>
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                                            <ul className="pl-2 space-y-4 text-sm text-gray-300 list-none">
                                                {day.activities.map((act: any, idx: number) => {
                                                    const activityName = typeof act === 'string' ? act : act.name;
                                                    const activityAddress = typeof act === 'object' ? act.address : null;

                                                    return (
                                                        <li key={idx} className="flex flex-col gap-1 leading-relaxed">
                                                            <div className="flex flex-col">
                                                                <div className="text-white text-sm font-medium">
                                                                    {activityName}
                                                                </div>
                                                                {activityAddress && (
                                                                    <div className="text-gray-500 text-[11px] mt-0.5">
                                                                        {activityAddress}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )
                            }))}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Footer CTA */}
            <div className="mt-12 text-center p-8 glass-effect rounded-3xl border border-white/10 bg-gradient-to-br from-[#ff4d4f]/10 to-transparent">
                <Title level={3} className="!text-white mb-2">Want a personalized itinerary like this?</Title>
                <Text className="text-gray-300 block mb-6 text-lg">Our AI can plan your perfect luxury escape in seconds.</Text>
                <Link href="/">
                    <Button size="large" type="primary" className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-12 !px-8 !rounded-xl !text-lg font-bold">
                        Start Planning with Luxury Travel Planner
                    </Button>
                </Link>
            </div>

            {/* Sticky Bottom Banner */}
            <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/10 backdrop-blur-md">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff4d4f] to-[#ff7875] flex items-center justify-center shadow-[0_0_20px_rgba(255,77,79,0.3)]">
                            <Compass className="text-white" size={24} />
                        </div>
                        <div>
                            <Text className="text-white text-lg md:text-xl font-semibold block">Inspired by this trip?</Text>
                            <Text className="text-gray-400">Plan your own AI journey today</Text>
                        </div>
                    </div>
                    <Link href="/">
                        <Button
                            size="large"
                            type="primary"
                            className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-12 !px-10 !rounded-full !text-base font-bold shadow-[0_0_15px_rgba(255,77,79,0.4)] transition-all hover:scale-105"
                        >
                            Start Your Journey
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
