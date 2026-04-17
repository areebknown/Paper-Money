import { NextResponse } from 'next/server';
import { getOrigin } from '@/lib/auth';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || '';
    const mode = searchParams.get('mode') || 'login'; // 'login' | 'signup'

    const { rootDomain } = getOrigin(req);
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${rootDomain}/api/auth/google/callback`;

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 });
    }

    // Pass both username and mode through Google's state parameter
    const state = JSON.stringify({ username, mode });

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
        state,
    };

    const qs = new URLSearchParams(options);
    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
