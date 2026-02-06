"use client";

import React, { useState } from 'react';
import { Form, Select, DatePicker, InputNumber, Button, Card, Typography, message } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs'; // Import dayjs for date handling

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function PlanTripPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // --- THE LOGIC: Saving Data Correctly ---
    const onFinish = (values: any) => {
        setLoading(true);

        // 1. Format the data so the Dashboard can read it easily
        const travelData = {
            destination: values.destination,
            budget: values.budget,
            // CRITICAL FIX: Saving specific start and end dates as strings
            startDate: values.dates[0].format('YYYY-MM-DD'),
            endDate: values.dates[1].format('YYYY-MM-DD'),
        };

        // 2. Save to local storage
        localStorage.setItem('lastPlannedTrip', JSON.stringify(travelData));

        // 3. Redirect after a short delay
        setTimeout(() => {
            message.success('Itinerary generated successfully!');
            setLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Card style={{ width: 500, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <CompassOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
                    <Title level={2}>Plan Your Trip</Title>
                    <Text type="secondary">Fill in the details for your AI-generated itinerary</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <Form.Item
                        name="destination"
                        label="Destination"
                        rules={[{ required: true, message: 'Please select a destination' }]}
                    >
                        <Select placeholder="Where are you going?">
                            <Select.Option value="Paris, France">Paris, France</Select.Option>
                            <Select.Option value="Tokyo, Japan">Tokyo, Japan</Select.Option>
                            <Select.Option value="New York, USA">New York, USA</Select.Option>
                            <Select.Option value="London, UK">London, UK</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dates"
                        label="Travel Dates"
                        rules={[{ required: true, message: 'Please select travel dates' }]}
                    >
                        {/* Added disabledDate to prevent selecting past dates (Day 11 Feature) */}
                        <RangePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current < dayjs().endOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="budget"
                        label="Daily Budget ($)"
                        rules={[{ required: true, message: 'Please enter a budget' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 100" />
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
                            {loading ? 'Generating...' : 'Generate Itinerary'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}