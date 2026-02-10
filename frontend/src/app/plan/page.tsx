"use client";

import React, { useState } from 'react';
import { Form, Select, DatePicker, InputNumber, Button, Card, Typography, message } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { apiRequest } from "@/lib/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function PlanTripPage() {
    const [form] = Form.useForm();
    const router = useRouter();

    // Day 11: State to track if the AI is currently working
    const [loading, setLoading] = useState(false);

    // --- THE LOGIC: This only runs when the button is clicked ---
    const onFinish = async (values: any) => {
        setLoading(true);
        message.destroy(); // Clear any previous error popups

        const tripData = {
            destination: values.destination,
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

            if (result.success) {
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

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', minHeight: '80vh' }}>
            <Card style={{ width: 500, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <CompassOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <Title level={2} style={{ marginTop: '16px' }}>Plan Your Trip</Title>
                    <Text type="secondary">Tell the AI where you want to go</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish} // <--- The logic trigger
                    autoComplete="off"
                >
                    <Form.Item
                        name="destination"
                        label="Destination"
                        rules={[{ required: true, message: 'Please select a destination' }]}
                    >
                        <Select placeholder="Search for a city">
                            <Select.Option value="Paris, France">Paris, France</Select.Option>
                            <Select.Option value="Tokyo, Japan">Tokyo, Japan</Select.Option>
                            <Select.Option value="London, UK">London, UK</Select.Option>
                            <Select.Option value="New York, USA">New York, USA</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dates"
                        label="Travel Dates"
                        rules={[{ required: true, message: 'Select your travel dates' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="budget"
                        label="Total Budget ($)"
                        rules={[{ required: true, message: 'Enter your budget' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 2000" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '32px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading} // Day 11: Visual feedback
                            icon={<SendOutlined />}
                        >
                            {loading ? 'AI is Thinking...' : 'Generate Itinerary'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}