"use client";

import React, { useState } from 'react'; // 1. Added useState here
import { Form, Select, DatePicker, InputNumber, Button, Card, Typography, message } from 'antd';
import { CompassOutlined, SendOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function PlanTripPage() {
    const [form] = Form.useForm();
    const router = useRouter();

    // --- STEP 3: INITIALIZE LOADING STATE ---
    // We start with 'false' because the app isn't loading when the page first opens
    const [loading, setLoading] = useState(false);

    const onFinish = (values: any) => {
        // --- STEP 3: SET LOADING TO TRUE ---
        // This turns on the spinner as soon as the user clicks the button
        setLoading(true);

        const travelData = {
            destination: values.destination,
            budget: values.budget,
            dates: [
                values.dates[0].format('YYYY-MM-DD'),
                values.dates[1].format('YYYY-MM-DD')
            ]
        };

        localStorage.setItem('lastPlannedTrip', JSON.stringify(travelData));

        // Simulate AI processing time (2 seconds)
        setTimeout(() => {
            message.success('AI is crafting your perfect trip...');

            // We don't need to set loading to false here because we are 
            // redirecting to a new page, but it's good practice!
            setLoading(false);

            router.push('/dashboard');
        }, 2000);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Card style={{ width: 500, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <CompassOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
                    <Title level={2}>Plan Your Trip</Title>
                    <Text type="secondary">Let AI build your itinerary</Text>
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
                        rules={[{ required: true, message: 'Select a destination' }]}
                    >
                        <Select placeholder="Where to?">
                            <Select.Option value="Paris, France">Paris, France</Select.Option>
                            <Select.Option value="Tokyo, Japan">Tokyo, Japan</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dates"
                        label="Travel Dates"
                        rules={[{ required: true, message: 'Select dates' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="budget"
                        label="Daily Budget ($)"
                        rules={[{ required: true, message: 'Enter a budget' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
                    </Form.Item>

                    <Form.Item>
                        {/* --- STEP 3: ADD LOADING PROP TO BUTTON --- */}
                        {/* The 'loading' prop automatically adds the Ant Design spinner */}
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            icon={<SendOutlined />}
                            loading={loading}
                        >
                            {loading ? 'AI is Thinking...' : 'Generate Itinerary'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}