import { NextResponse } from 'next/server';

export async function GET() {
    try {
		// Add parameter to request blockchain category data from B157:M212
		const url = 'https://script.google.com/macros/s/AKfycbwPXZhIDoumMOw26oVcnJjGZlI_kw_l2f0luUh5RYdrhjYyPIq36ZujIxdBip6IdOeQ/exec?token=blueeyeswillrule&includeBlockchainCategories=true';
        console.log('API: Fetching from URL:', url);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Upstream error ${res.status}`);
        const data = await res.json();
        console.log('API: Received data:', JSON.stringify(data).substring(0, 500) + '...');
        console.log('API: Investments count:', data?.investments?.length || 0);
        console.log('API: Blockchain categories count:', data?.blockchainCategories?.length || 0);
        return NextResponse.json(data, { status: 200 });
    } catch (e: unknown) {
        console.error('API Error:', e);
        return NextResponse.json({ error: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}
