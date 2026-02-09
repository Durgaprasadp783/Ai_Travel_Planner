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

    const onFinish = (values: any) => {
        setLoading(true);

        // Prepare data
        const tripData = {
            destination: values.destination,
            budget: values.budget,
            startDate: values.dates[0].format('YYYY-MM-DD'),
            endDate: values.dates[1].format('YYYY-MM-DD'),
        };

        // Save to LocalStorage (Acting as our temporary database)
        localStorage.setItem('lastPlannedTrip', JSON.stringify(tripData));

        // Simulate Network Delay (To show off the loading spinner)
        setTimeout(() => {
            message.success('Trip planned successfully!');
            setLoading(false);
            router.push('/dashboard');
        }, 1500);
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