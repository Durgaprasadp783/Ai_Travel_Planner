"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Avatar, Typography, App, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces",
];

import ProtectedRoute from '@/components/ProtectedRoute'; // Added import

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const handleUpdate = async (values: { name: string; email: string }) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const body = { ...values, avatar: selectedAvatar }; // Include avatar in update
            const res = await fetch('http://localhost:5000/api/user/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                message.success('Profile updated successfully!');
            } else {
                message.error('Failed to update profile.');
            }
        } catch (error) {
            message.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (values: any) => {
        setPasswordLoading(true);
        // Mock API call
        setTimeout(() => {
            setPasswordLoading(false);
            setIsPasswordModalOpen(false);
            passwordForm.resetFields();
            message.success('Password changed successfully!');
        }, 1500);
    };

    return (
        <ProtectedRoute>
            <div className="bg-darkBg min-h-screen flex items-center justify-center p-4">
                <div className="glass-effect p-8 rounded-2xl w-full max-w-md flex flex-col items-center">

                    {/* Main Avatar Preview */}
                    <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={selectedAvatar}
                        style={{ backgroundColor: '#ff4d4f', marginBottom: '16px' }}
                    />

                    {/* Explorer Name */}
                    <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
                        {user?.name || 'Explorer Name'}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
                        Travel Enthusiast
                    </Text>

                    {/* Avatar Selector */}
                    <div style={{ marginBottom: '32px', width: '100%' }}>
                        <Text style={{ color: 'white', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
                            Choose Avatar
                        </Text>
                        <div className="flex justify-center gap-3 flex-wrap">
                            {AVATAR_PRESETS.map((url, index) => (
                                <div
                                    key={index}
                                    className="glass-effect rounded-full cursor-pointer transition-all hover:scale-110"
                                    style={{
                                        padding: '4px',
                                        border: selectedAvatar === url ? '2px solid #ff4d4f' : '2px solid transparent'
                                    }}
                                    onClick={() => setSelectedAvatar(url)}
                                >
                                    <Avatar src={url} size={48} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        initialValues={{
                            name: user?.name || '',
                            email: user?.email || '',
                        }}
                        style={{ width: '100%' }}
                    >
                        <Form.Item
                            label={<span style={{ color: 'white' }}>Full Name</span>}
                            name="name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input
                                placeholder="Full Name"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: 'white' }}>Email Address</span>}
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input
                                placeholder="Email Address"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                style={{
                                    background: '#ff4d4f',
                                    borderColor: '#ff4d4f',
                                    fontWeight: 'bold',
                                    marginTop: '8px'
                                }}
                            >
                                Update Profile
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Security Section */}
                    <div style={{ width: '100%', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>Security</Title>
                        <Button
                            icon={<LockOutlined />}
                            block
                            onClick={() => setIsPasswordModalOpen(true)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                height: '45px'
                            }}
                        >
                            Change Password
                        </Button>
                    </div>

                    {/* Password Reset Modal */}
                    <Modal
                        title={<span style={{ color: 'white' }}>Change Password</span>}
                        open={isPasswordModalOpen}
                        onCancel={() => setIsPasswordModalOpen(false)}
                        footer={null}
                        className="luxury-modal"
                        closeIcon={<span style={{ color: 'white' }}>×</span>}
                    >
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordChange}
                        >
                            <Form.Item
                                label={<span style={{ color: 'white' }}>Current Password</span>}
                                name="currentPassword"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input.Password
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: 'white' }}>New Password</span>}
                                name="newPassword"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input.Password
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={<span style={{ color: 'white' }}>Confirm Password</span>}
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Required' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={passwordLoading}
                                    block
                                    style={{
                                        background: '#ff4d4f',
                                        borderColor: '#ff4d4f',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Update Password
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </div>
        </ProtectedRoute>
    );
}
