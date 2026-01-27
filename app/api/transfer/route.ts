
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { receiverUsername, amount } = await req.json();

        const transferAmount = parseFloat(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Start Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Sender
            const sender = await tx.user.findUnique({ where: { id: userId } });
            if (!sender) throw new Error('Sender not found');

            if (sender.balance < transferAmount) {
                throw new Error('Insufficient balance');
            }

            // 2. Get Receiver
            const receiver = await tx.user.findUnique({ where: { username: receiverUsername } });
            if (!receiver) throw new Error('Receiver not found');

            if (receiver.id === sender.id) {
                throw new Error('Cannot send money to yourself');
            }

            // 3. Decrement Sender Balance
            await tx.user.update({
                where: { id: sender.id },
                data: { balance: { decrement: transferAmount } },
            });

            // 4. Increment Receiver Balance
            await tx.user.update({
                where: { id: receiver.id },
                data: { balance: { increment: transferAmount } },
            });

            // 5. Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    amount: transferAmount,
                    senderId: sender.id,
                    receiverId: receiver.id,
                    status: 'COMPLETED',
                },
            });

            return transaction;
        });

        return NextResponse.json({ success: true, transaction: result });

    } catch (error: any) {
        console.error('Transfer error:', error);
        const message = error.message || 'Internal server error';
        if (message === 'Insufficient balance' || message === 'Receiver not found' || message === 'Cannot send money to yourself') {
            return NextResponse.json({ error: message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
    }
}
