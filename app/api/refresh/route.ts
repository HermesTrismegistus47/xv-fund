import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Get the current Google Apps Script URL from the portfolio route
        const url = 'https://script.google.com/macros/s/AKfycbwPXZhIDoumMOw26oVcnJjGZlI_kw_l2f0luUh5RYdrhjYyPIq36ZujIxdBip6IdOeQ/exec';
        
        console.log('API: Calling refresh script at:', url);
        
        // Call the refreshAllData function in Google Apps Script
        // Try calling it with refresh parameter in URL
        const refreshUrl = `${url}?token=blueeyeswillrule&refresh=true`;
        const res = await fetch(refreshUrl, { 
            method: 'GET',
            cache: 'no-store' 
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('API: Refresh failed with status:', res.status, 'Response:', errorText);
            throw new Error(`Refresh failed with status ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        console.log('API: Refresh response:', data);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Prices refreshed successfully',
            data 
        });
        
    } catch (error) {
        console.error('API: Refresh error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to refresh prices',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
