import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { username, realName, about, profileImage } = body;

        // Fetch user first to check if they are main account
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isMainAccount: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = {};
        
        if (username !== undefined) {
            // Validation: min 3 chars, max 20, no ending period, only lowercase alphanumeric, _, .
            if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
            if (username.endsWith('.')) return NextResponse.json({ error: 'Username cannot end with a period' }, { status: 400 });
            if (/[^a-z0-9_.]/.test(username)) return NextResponse.json({ error: 'Username contains invalid characters' }, { status: 400 });
            updateData.username = username;
        }

        if (about !== undefined) {
            updateData.about = about;
        }

        if (profileImage !== undefined) {
            updateData.profileImage = profileImage;
        }

        // Only allow changing realName if main account
        if (realName !== undefined && user.isMainAccount) {
            if (realName.trim().split(' ').filter(Boolean).length < 2) {
                return NextResponse.json({ error: 'Real Name must contain at least two words' }, { status: 400 });
            }
            updateData.realName = realName;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                realName: true,
                about: true,
                profileImage: true,
                isMainAccount: true,
            }
        });

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });

    } catch (error: any) {
        console.error('Update profile error:', error);

        // Handle unique constraint violation for username
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Username already in use' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
