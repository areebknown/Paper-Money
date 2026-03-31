import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const rootDomain = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
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
    };

    const qs = new URLSearchParams(options);

    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
