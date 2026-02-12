"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Tabs, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth`;

const LoginPage = () => {
    const { login } = useAuth(); // Destructure login from custom hook
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    /* ================= LOGIN ================= */
    const handleLogin = async (values: any) => {
        try {
            setLoading(true);

            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            login(data.token); // Use AuthContext login

            message.success("Login successful!");
            router.push("/dashboard");
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ================= REGISTER ================= */
    const handleRegister = async (values: any) => {
        try {
            setLoading(true);

            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.username,
                    email: values.email,
                    password: values.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            message.success("Registration successful! Please login.");
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FORMS ================= */

    const loginForm = (
        <Form onFinish={handleLogin} layout="vertical">
            <Form.Item
                name="email"
                rules={[
                    { required: true, message: "Please input your Email!" },
                    { type: "email", message: "Invalid email format!" },
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: "Please input your Password!" },
                    { min: 8, message: "Password must be at least 8 characters" },
                ]}
            >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>

            <Form.Item>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Checkbox>Remember me</Checkbox>
                    <a>Forgot password</a>
                </div>
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Log in
            </Button>
        </Form>
    );

    const registerForm = (
        <Form onFinish={handleRegister} layout="vertical">
            <Form.Item
                name="username"
                rules={[{ required: true, message: "Please input your Username!" }]}
            >
                <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
            </Form.Item>

            <Form.Item
                name="email"
                rules={[
                    { required: true, message: "Please input your Email!" },
                    { type: "email", message: "Invalid email format!" },
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: "Please input your Password!" },
                    { min: 8, message: "Password must be at least 8 characters" },
                ]}
            >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Sign Up
            </Button>
        </Form>
    );

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h2 style={{ textAlign: "center", marginBottom: 24 }}>AI Travel Planner</h2>

                <Tabs
                    defaultActiveKey="1"
                    centered
                    items={[
                        { label: "Login", key: "1", children: loginForm },
                        { label: "Register", key: "2", children: registerForm },
                    ]}
                />
            </Card>
        </div>
    );
};

export default LoginPage;
