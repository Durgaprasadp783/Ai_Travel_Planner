"use client";

import React from 'react';
import { Button, Result } from 'antd';

// Next.js automatically passes the 'error' and a 'reset' function to this page
export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>
            <Result
                status="500"
                title="Something went wrong"
                subTitle={error.message || "Sorry, an unexpected error occurred."}
                extra={
                    <Button type="primary" onClick={() => reset()}>
                        Try Again
                    </Button>
                }
            />
        </div>
    );
}