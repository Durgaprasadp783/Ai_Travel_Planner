"use client";

import React, { useState } from 'react';
import { Form, DatePicker, InputNumber, Button, Card, Typography, Row, Col, message } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { PlaneTakeoff, MapPin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from "@/lib/api";
import { motion } from 'framer-motion';

import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSkeleton from '@/components/LoadingSkeleton';
// NEW: Import the Autocomplete Component
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { App } from 'antd';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function PlanTripContent() {
    const { message, notification } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Coordinate State
    const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
    const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

    // Pre-fill destination from URL
    React.useEffect(() => {
        const destinationParam = searchParams.get('destination');
        if (destinationParam) {
            form.setFieldsValue({
                destination: destinationParam
            });
        }
    }, [searchParams, form]);

    // --- THE LOGIC: This only runs when the button is clicked ---
    const onFinish = async (values: any) => {
        setLoading(true);
        message.destroy(); // Clear any previous error popups

        const tripData = {
            origin: values.origin,
            destination: values.destination,
            originCoordinates: originCoords, // Pass coords
            destinationCoordinates: destCoords, // Pass coords
            budget: values.budget,
            // Formatting dates into strings for the Backend/AI
            startDate: values.dates[0].format('YYYY-MM-DD'),
            endDate: values.dates[1].format('YYYY-MM-DD'),
        };

        try {
            // Day 11 Fix: Call backend on Port 5050 (or 5000 based on your terminal)
            const result = await apiRequest("/trips", {
                method: "POST",
                body: JSON.stringify(tripData),
            });

            if (result && result._id) {
                // Save to localStorage for Dashboard/Itinerary pages
                localStorage.setItem('lastPlannedTrip', JSON.stringify(result));
                message.success("AI has successfully generated your itinerary!");
                router.push('/dashboard');
            }
        } catch (err: any) {
            // Handling the "Trip Generation Error" gracefully
            console.error("Submission Error:", err.message);
            message.error("The AI is having trouble. Please check your backend terminal.");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = () => {
        message.error('Please fix the errors in the form before submitting.');
    };

    // Shared input style
    const inputStyle = "!bg-white/5 !border-white/10 !text-white !h-12 !rounded-xl placeholder:text-white/30";

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', minHeight: '80vh' }}>
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <div className="max-w-[1200px] mx-auto p-4 lg:p-10 min-h-screen">
                    <div className="glass-effect rounded-[40px] p-6 lg:p-12 mb-10 border border-white/5">
                        <Title level={1} className="!text-white !mb-4 md:!text-5xl text-3xl font-black">
                            Plan Your Next <span className="text-[#ff4d4f]">Luxury Escape</span>
                        </Title>
                        <Text className="!text-white/60 text-lg block mb-8">
                            Let our AI design a bespoke journey tailored exclusively to your tastes.
                        </Text>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            requiredMark={false}
                            className="luxury-form"
                        >
                            <Row gutter={[24, 0]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Starting Point"
                                        name="origin"
                                        rules={[{ required: true, message: 'Where are you starting from?' }]}
                                    >
                                        <LocationAutocomplete
                                            placeholder="e.g. New York, USA"
                                            onSelectLocation={(loc) => {
                                                setOriginCoords(loc.coordinates);
                                            }}
                                            className="!bg-white/5 !border-white/10 !text-white !h-12 !rounded-xl"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Destination"
                                        name="destination"
                                        rules={[{ required: true, message: 'Where do you want to go?' }]}
                                    >
                                        <LocationAutocomplete
                                            placeholder="e.g. Paris, France"
                                            onSelectLocation={(loc) => {
                                                setDestCoords(loc.coordinates);
                                            }}
                                            className="!bg-white/5 !border-white/10 !text-white !h-12 !rounded-xl"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Budget (USD)"
                                        name="budget"
                                        rules={[{ required: true, message: 'What is your budget?' }]}
                                    >
                                        <InputNumber
                                            prefix={<span className="text-gray-400">$</span>}
                                            style={{ width: '100%' }}
                                            placeholder="5000"
                                            className="!bg-white/5 !border-white/10 !text-white !h-12 flex items-center !rounded-xl"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Travel Dates"
                                        name="dates"
                                        rules={[{ required: true, message: 'When are you traveling?' }]}
                                    >
                                        <RangePicker
                                            className="!w-full !bg-white/5 !border-white/10 !h-12 !rounded-xl"
                                            placeholder={['Start Date', 'End Date']}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item className="mt-8 mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading}
                                    className="!bg-[#ff4d4f] !border-[#ff4d4f] hover:!bg-[#ff7875] !h-16 !rounded-2xl !text-xl font-bold shadow-2xl shadow-[#ff4d4f]/20 transition-all hover:scale-[1.01]"
                                >
                                    {loading ? 'AI is Thinking...' : 'Generate My Perfect Journey'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PlanTripPage() {
    return (
        <ProtectedRoute>
            <React.Suspense fallback={<LoadingSkeleton />}>
                <PlanTripContent />
            </React.Suspense>
        </ProtectedRoute>
    );
}
