"use client";

import React, { useState } from 'react';
import { Form, Select, DatePicker, InputNumber, Button, Card, Typography, message } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function PlanTripPage() {
    const [form] = Form.useForm();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- THE LOGIC: Saving Data Correctly ---
    const onFinish = async (values: any) => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                message.error("You must be logged in to save a trip.");
                setLoading(false);
                return;
            }

            // 1. Format the data 
            const travelData = {
                destination: values.destination,
                budget: values.budget,
                days: values.dates[1].diff(values.dates[0], 'day') + 1, // Calculate duration
                startDate: values.dates[0].format('YYYY-MM-DD'),
                endDate: values.dates[1].format('YYYY-MM-DD'),
            };

            // 2. Send to Backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/trips`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(travelData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save trip");
            }

            // 3. Save to local storage (optional, for redundancy or other UI needs)
            localStorage.setItem('lastPlannedTrip', JSON.stringify(travelData));

            // 4. Redirect
            message.success('Trip saved successfully!');
            router.push('/dashboard');

        } catch (error: any) {
            console.error("Trip Save Error:", error);
            message.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = () => {
        message.error('Please fix the errors in the form before submitting.');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Card style={{ width: 500, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <CompassOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
                    <Title level={2}>Plan Your Trip</Title>
                    <Text type="secondary">Enter your details below</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    {/* VALIDATION 1: Destination is Required */}
                    <Form.Item
                        name="destination"
                        label="Destination"
                        rules={[{ required: true, message: 'Please select a destination!' }]}
                    >
                        <Select placeholder="Select City">
                            <Select.Option value="Paris">Paris, France</Select.Option>
                            <Select.Option value="Tokyo">Tokyo, Japan</Select.Option>
                            <Select.Option value="New York">New York, USA</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* VALIDATION 2: Dates are Required */}
                    <Form.Item
                        name="dates"
                        label="Travel Dates"
                        rules={[{ required: true, message: 'Please select your travel dates!' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    {/* VALIDATION 3: Advanced Budget Rules (Step 4 specific) */}
                    <Form.Item
                        name="budget"
                        label="Budget ($)"
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
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                            icon={<SendOutlined />}
                        >
                            Generate Itinerary
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}