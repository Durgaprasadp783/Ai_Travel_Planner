"use client";

import React from 'react';
import { Button, Result } from 'antd';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Link href="/dashboard">
                        <Button type="primary">Back to Dashboard</Button>
                    </Link>
                }
            />
        </div>
    );
}