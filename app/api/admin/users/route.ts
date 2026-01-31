
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// Helper to check if current user is admin
async function isAdmin() {
    const userId = await getUserIdFromRequest();
    if (!userId) return false;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return user?.isAdmin === true;
}

export async function GET(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const usersRaw = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                portfolios: {
                    include: { asset: true }
                }
            }
        });

        const users = (usersRaw as any[]).map(user => {
            const rawInvested = user.portfolios.reduce((sum: number, p: any) => sum + (p.units * Number(p.asset.currentPrice)), 0);
            const totalInvested = Math.round(rawInvested * 100) / 100;
            return {
                ...user,
                totalInvested
            };
        });

        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, balance, amountToAdd, broadcast, isSuspended } = await req.json();

        // Bulk Allocation
        if (broadcast && amountToAdd) {
            try {
                const amount = Math.round(parseFloat(amountToAdd) * 100) / 100;
                await prisma.user.updateMany({
                    data: {
                        balance: { increment: amount }
                    }
                });
                return NextResponse.json({ success: true, message: `Added ${amount.toFixed(2)} to all users` });
            } catch (e) {
                throw new Error("Bulk update failed");
            }
        }

        // Individual Update
        if (!id || (balance === undefined && amountToAdd === undefined && isSuspended === undefined)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        let data: any = {};
        if (balance !== undefined) data.balance = Math.round(parseFloat(balance) * 100) / 100;
        if (amountToAdd !== undefined) {
            const amount = Math.round(parseFloat(amountToAdd) * 100) / 100;
            data.balance = { increment: amount };
        }
        if (isSuspended !== undefined) data.isSuspended = isSuspended;

        const user = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Prevent deleting self? Maybe.
        const currentUserId = await getUserIdFromRequest();
        if (id === currentUserId) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
