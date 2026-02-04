"use client";

import React from 'react';
import { Form, Select, DatePicker, InputNumber, Button, Card, Typography, message } from 'antd';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function PlanTrip() {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Form Values:', values);
        message.loading("AI is generating your itinerary...", 2);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: 600, marginTop: 20 }}>
                <Title level={2} style={{ textAlign: 'center' }}>Plan Your Adventure</Title>
                <Form form={form} layout="vertical" onFinish={onFinish}>

                    <Form.Item name="destination" label="Where do you want to go?" rules={[{ required: true }]}>
                        <Select placeholder="Select a city" showSearch>
                            <Select.Option value="paris">Paris, France</Select.Option>
                            <Select.Option value="tokyo">Tokyo, Japan</Select.Option>
                            <Select.Option value="new-york">New York, USA</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="dates" label="Travel Dates" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="budget" label="Daily Budget ($)" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} prefix="$" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large">
                        Generate My Plan
                    </Button>
                </Form>
            </Card>
        </div>
    );
}