"use client";

import React, { useState } from 'react';
import { Form, DatePicker, InputNumber, Button, Card, Typography, message } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { PlaneTakeoff, MapPin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from "@/lib/api";
import { motion } from 'framer-motion';

import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSkeleton from '@/components/LoadingSkeleton';
// NEW: Import the Autocomplete Component
import LocationAutocomplete from '@/components/LocationAutocomplete';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function PlanTripContent() {
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card style={{ width: 500, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <CompassOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                            <Title level={2} style={{ marginTop: '16px', color: 'white' }}>Plan Your Trip</Title>
                            <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Tell the AI where you want to go</Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            {/* Search Start Location */}
                            <Form.Item
                                name="origin"
                                label={<span style={{ color: 'white' }}>Starting From (Origin)</span>}
                                rules={[{ required: true, message: 'Please enter a starting location!' }]}
                            >
                                <LocationAutocomplete
                                    prefix={<PlaneTakeoff size={18} color="rgba(255,255,255,0.5)" />}
                                    placeholder="e.g. New York, USA"
                                    className={inputStyle}
                                    onSelectLocation={(loc) => setOriginCoords(loc.coordinates)}
                                />
                            </Form.Item>

                            {/* VALIDATION 1: Destination is Required */}
                            <Form.Item
                                name="destination"
                                label={<span style={{ color: 'white' }}>Destination</span>}
                                rules={[{ required: true, message: 'Please enter a destination!' }]}
                            >
                                <LocationAutocomplete
                                    prefix={<MapPin size={18} color="rgba(255,255,255,0.5)" />}
                                    placeholder="e.g. Paris, France"
                                    className={inputStyle}
                                    onSelectLocation={(loc) => setDestCoords(loc.coordinates)}
                                />
                            </Form.Item>

                            {/* VALIDATION 2: Dates are Required */}
                            <Form.Item
                                name="dates"
                                label={<span style={{ color: 'white' }}>Travel Dates</span>}
                                rules={[{ required: true, message: 'Select your travel dates' }]}
                            >
                                <RangePicker
                                    style={{ width: '100%', height: '48px' }}
                                    className="!bg-white/5 !border-white/10 !rounded-xl"
                                    popupClassName="luxury-datepicker-popup"
                                />
                            </Form.Item>

                            {/* VALIDATION 3: Advanced Budget Rules (Step 4 specific) */}
                            <Form.Item
                                name="budget"
                                label={<span style={{ color: 'white' }}>Budget ($)</span>}
                                rules={[
                                    { required: true, message: 'Please enter a budget!' },
                                    {
                                        type: 'number',
                                        min: 50,
                                        message: 'Budget must be at least $50 for a trip!'
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    prefix="$"
                                    placeholder="e.g. 500"
                                    className={inputStyle}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: '32px' }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading} // Day 11: Visual feedback
                                    icon={<SendOutlined />}
                                    style={{
                                        height: '50px',
                                        background: '#ff4d4f',
                                        borderColor: '#ff4d4f',
                                        fontWeight: 'bold',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {loading ? 'AI is Thinking...' : 'Generate Itinerary'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </motion.div>
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
