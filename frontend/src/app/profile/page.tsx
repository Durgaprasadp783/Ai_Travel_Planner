"use client";

import React, { useState } from "react";
import { Card, Typography, Spin, Button, Modal, Form, Input, message } from "antd";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const handleResetPassword = async (values: any) => {
        try {
            setConfirmLoading(true);
            const token = localStorage.getItem("token");
            const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth`;

            const res = await fetch(`${API_BASE}/reset-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update password");
            }

            message.success("Password updated successfully");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
            <Card title="My Profile" style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ marginBottom: "16px" }}>
                    <Title level={4}>User Details</Title>
                    <Text strong>Name: </Text> <Text>{user.name}</Text>
                    <br />
                    <Text strong>Email: </Text> <Text>{user.email}</Text>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button type="primary" onClick={() => router.push("/dashboard")}>
                        Go to Dashboard
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)}>
                        Reset Password
                    </Button>
                </div>
            </Card>

            <Modal
                title="Reset Password"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        name="currentPassword"
                        label="Current Password"
                        rules={[{ required: true, message: "Please enter current password" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: "Please enter new password" },
                            { min: 6, message: "Password must be at least 6 characters" }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: "Please confirm your password" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={confirmLoading} block>
                            Update Password
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
