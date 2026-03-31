import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';

    const host = req.headers.get('host') || 'localhost:3000';
    const rootDomain = host.includes('localhost') 
        ? `http://${host}` 
        : 'https://wars-bid.vercel.app';
    
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${rootDomain}/api/auth/google/callback`;
    
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 });
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: REDIRECT_URI,
        client_id: GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
        state: username, // Pass our chosen username through Google's state parameter
    };

    const qs = new URLSearchParams(options);

    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
