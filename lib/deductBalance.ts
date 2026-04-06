import { Prisma, PrismaClient } from '@prisma/client';

type TxClient = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Deducts `amount` from a user's balance, draining greenMoney first.
 *
 * Priority:
 *   1. Deduct as much as possible from greenMoney (down to 0)
 *   2. Deduct the remainder from real money (balance - greenMoney)
 *
 * Both `balance` and `greenMoney` are kept consistent so that:
 *   realMoney = balance - greenMoney
 * always reflects the true split.
 *
 * @param tx    - Prisma transaction client
 * @param userId - The user to deduct from
 * @param amount - The amount to deduct (must already be validated >= 0)
 * @returns The updated user record (with balance and greenMoney)
 */
export async function deductBalance(tx: TxClient, userId: string, amount: number) {
    // Fetch fresh values inside the transaction
    const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, greenMoney: true },
    });

    if (!user) throw new Error('User not found');

    const currentBalance = Number(user.balance);
    const currentGreen = Number(user.greenMoney ?? 0);

    if (currentBalance < amount) {
        throw new Error('Insufficient balance');
    }

    // How much of the payment comes from green money
    const greenDeduct = Math.min(currentGreen, amount);
    // The rest comes from real money (already embedded inside balance)
    // We always decrement balance by full amount regardless, because
    // balance = greenMoney + realMoney. greenMoney is just a tag on top.

    return tx.user.update({
        where: { id: userId },
        data: {
            balance: { decrement: amount },
            greenMoney: { decrement: greenDeduct },
        },
    });
}
