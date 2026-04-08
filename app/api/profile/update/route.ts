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
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isMainAccount: true, username: true, realNameUpdatedAt: true, realName: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = {};
        
        if (username !== undefined && username !== user.username) {
            // Validation: min 3 chars, max 20, no ending period, only lowercase alphanumeric, _, .
            if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
            if (username.endsWith('.')) return NextResponse.json({ error: 'Username cannot end with a period' }, { status: 400 });
            if (/[^a-z0-9_.]/.test(username)) return NextResponse.json({ error: 'Username contains invalid characters' }, { status: 400 });
            
            // Check if username is reserved
            const reserved = await prisma.reservedUsername.findFirst({
                where: {
                    username: username,
                    expiresAt: { gt: new Date() }
                }
            });
            if (reserved) {
                return NextResponse.json({ error: 'Username is temporarily unavailable' }, { status: 400 });
            }

            updateData.username = username;
        }

        if (about !== undefined) {
            updateData.about = about;
        }

        if (profileImage !== undefined) {
            updateData.profileImage = profileImage;
        }

        // Only allow changing realName if main account AND the name actually changed
        if (realName !== undefined && user.isMainAccount && realName !== user.realName) {
            if (realName.trim().split(' ').filter(Boolean).length < 2) {
                return NextResponse.json({ error: 'Real Name must contain at least two words' }, { status: 400 });
            }
            // Entropy check
            if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(realName)) {
                return NextResponse.json({ error: 'Real Name contains too many consonants in a row' }, { status: 400 });
            }
            if (/([a-z])\1{2,}/i.test(realName)) {
                return NextResponse.json({ error: 'Real Name contains too many repeating characters' }, { status: 400 });
            }

            // 30-day lock check
            if (user.realNameUpdatedAt) {
                const daysSinceUpdate = (Date.now() - new Date(user.realNameUpdatedAt).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceUpdate < 30) {
                    return NextResponse.json({ error: `You cannot change your Real Name for another ${Math.ceil(30 - daysSinceUpdate)} days.` }, { status: 403 });
                }
            }

            updateData.realName = realName;
            updateData.realNameUpdatedAt = new Date();
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            if (updateData.username && updateData.username !== user.username) {
                // Delete previous reservation if it exists so we can reuse the record or create a new one
                const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days
                await tx.reservedUsername.upsert({
                    where: { username: user.username },
                    update: { expiresAt },
                    create: { username: user.username, expiresAt, userId }
                });
            }

            return await tx.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    username: true,
                    realName: true,
                    realNameUpdatedAt: true,
                    about: true,
                    profileImage: true,
                    isMainAccount: true,
                }
            });
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
