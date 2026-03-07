"use client";

import React, { useState } from 'react';
import { Form, DatePicker, InputNumber, Button, Card, Typography, Row, Col, message, Input } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { PlaneTakeoff, MapPin, User, Heart, Users, Home, Briefcase, Sparkles } from 'lucide-react';
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
    const [travelMode, setTravelMode] = useState('solo');
    const [peopleCount, setPeopleCount] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [smartPrompt, setSmartPrompt] = useState("");

    // --- Mode-Specific Limits ---
    const limits: Record<string, number> = {
        'solo': 1,
        'family': 5,
        'friends': 10,
        'business': 4,
        'couples': 2
    };

    const maxLimit = limits[travelMode] || 1;

    const personalityModes = [
        { id: 'solo', label: 'Solo Traveler', icon: User },
        { id: 'couples', label: 'Couples', icon: Heart },
        { id: 'friends', label: 'Friends Group', icon: Users },
        { id: 'family', label: 'Family', icon: Home },
        { id: 'business', label: 'Business Trips', icon: Briefcase },
    ];

    const interests = ['Beach', 'Food', 'Adventure', 'History', 'Nature', 'Shopping'];

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

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

        // Calculate days explicitly to ensure backend receives it correctly
        let calculatedDays = 0;
        if (values.dates && values.dates[0] && values.dates[1]) {
            const start = values.dates[0].toDate();
            const end = values.dates[1].toDate();
            const diffTime = Math.abs(end - start);
            calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        const tripData = {
            origin: values.origin,
            destination: values.destination,
            originCoordinates: originCoords,
            destinationCoordinates: destCoords,
            budget: values.budget,
            days: calculatedDays, // Explicitly pass the days
            startDate: values.dates[0].format('YYYY-MM-DD'),
            endDate: values.dates[1].format('YYYY-MM-DD'),
            mode: travelMode,
            peopleCount: peopleCount,
            interests: selectedInterests,
            smartPrompt: smartPrompt,
        };
        console.log("📤 Sending Trip Data:", tripData);

        try {
            // Day 11 Fix: Call backend on Port 5050 (or 5000 based on your terminal)
            const result = await apiRequest("/trips/generate", {
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

                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label={`Guest Count (Max: ${maxLimit})`}
                                    >
                                        <InputNumber
                                            prefix={<Users className="w-4 h-4 text-gray-400 mr-2" />}
                                            min={1}
                                            max={maxLimit}
                                            value={peopleCount}
                                            onChange={(val) => setPeopleCount(val || 1)}
                                            style={{ width: '100%' }}
                                            className="!bg-white/5 !border-white/10 !text-white !h-12 flex items-center !rounded-xl"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="mt-8">
                                <Text className="!text-white/80 text-lg mb-4 block font-medium">Select Your Travel Personality</Text>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {personalityModes.map((mode) => {
                                        const Icon = mode.icon;
                                        const isActive = travelMode === mode.id;
                                        return (
                                            <div
                                                key={mode.id}
                                                onClick={() => {
                                                    setTravelMode(mode.id);
                                                    const newMax = limits[mode.id] || 1;
                                                    if (peopleCount > newMax) {
                                                        setPeopleCount(newMax);
                                                    }
                                                }}
                                                className={`
                                                    cursor-pointer p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300
                                                    ${isActive
                                                        ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                    }
                                                `}
                                            >
                                                <Icon className={`w-6 h-6 ${isActive ? 'text-yellow-400' : 'text-white/60'}`} />
                                                <span className={`text-sm font-semibold ${isActive ? 'text-yellow-400' : 'text-white/80'}`}>
                                                    {mode.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8">
                                <Text className="!text-white/80 text-lg mb-4 block font-medium">Choose Interests</Text>
                                <div className="flex flex-wrap gap-3">
                                    {interests.map((interest) => {
                                        const isActive = selectedInterests.includes(interest);
                                        return (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => toggleInterest(interest)}
                                                className={`
                                                    px-6 py-2 rounded-full border transition-all duration-300 font-medium
                                                    ${isActive
                                                        ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                                        : 'bg-transparent border-white/20 text-gray-400 hover:border-white/40'
                                                    }
                                                `}
                                            >
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-yellow-500" />
                                    <Text className="!text-white/80 text-lg block font-medium">Magic Instructions (Optional)</Text>
                                </div>
                                <Input.TextArea
                                    value={smartPrompt}
                                    onChange={(e) => setSmartPrompt(e.target.value)}
                                    placeholder="e.g., I want to propose on Day 2 at sunset, or I have a severe peanut allergy, keep dinner spots safe."
                                    rows={4}
                                    className="!bg-white/5 !border-white/10 !text-white !rounded-2xl !p-4 placeholder:text-white/30 
                                               focus:!border-[#ff4d4f] focus:!shadow-[0_0_10px_rgba(255,77,79,0.2)] transition-all duration-300"
                                />
                            </div>

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
