import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SignJWT } from 'jose';
import { getUniquePMUID } from '@/lib/pmuid';

export async function POST(req: Request) {
    try {
        const { username, password, isMainAccount, phoneNumber, email, realName, profileImage } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        // Generate the unique permanent PMUID
        const publicId = await getUniquePMUID();

        // Main accounts get 1 Lakh bonus, others (Side) start at 0
        const starterBalance = isMainAccount ? 100000 : 0;

        const user = await prisma.user.create({
            data: {
                username: username.toLowerCase(),
                password, // Plain text for now as per previous instruction, but consider bcrypt later
                publicId,
                isMainAccount: !!isMainAccount,
                phoneNumber: phoneNumber || null,
                email: email || null,
                realName: realName || null,
                profileImage: profileImage || null,
                balance: starterBalance,
                isAdmin: username === 'admin',
            },
        });

        // Create JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const token = await new SignJWT({ 
            userId: user.id, 
            username: user.username, 
            isAdmin: user.isAdmin,
            isMainAccount: user.isMainAccount,
            publicId: user.publicId
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        const response = NextResponse.json({ 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                publicId: user.publicId,
                isMainAccount: user.isMainAccount,
                balance: user.balance 
            } 
        });

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
