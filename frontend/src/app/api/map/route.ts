import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || !url.startsWith('https://maps.googleapis.com/')) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';
        
        return NextResponse.json({ data: `data:${contentType};base64,${base64}` });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch map' }, { status: 500 });
    }
}
