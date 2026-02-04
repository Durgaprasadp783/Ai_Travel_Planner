"use client";

import React from 'react';
import { Form, Input, Button, Card, Tabs, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const LoginPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
        message.success('Action successful! Redirecting to dashboard...');
    };

    const loginForm = (
        <Form name="login" onFinish={onFinish} layout="vertical">
            <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Checkbox>Remember me</Checkbox>
                    <a href="">Forgot password</a>
                </div>
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>Log in</Button>
        </Form>
    );

    const registerForm = (
        <Form name="register" onFinish={onFinish} layout="vertical">
            <Form.Item name="username" rules={[{ required: true, message: 'Please input your Username!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!', type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>Sign Up</Button>
        </Form>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 24 }}>AI Travel Planner</h2>
                <Tabs defaultActiveKey="1" centered items={[
                    { label: 'Login', key: '1', children: loginForm },
                    { label: 'Register', key: '2', children: registerForm },
                ]} />
            </Card>
        </div>
    );
};

export default LoginPage;