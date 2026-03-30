import { prisma } from './db';

/**
 * Generates a random 8-digit numeric string formatted as PM-XXXX-XXXX.
 * Used for the immutable public identifier.
 */
export function generatePMUID(): string {
    const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `PM-${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/**
 * Ensures the PMUID is unique in the database.
 */
export async function getUniquePMUID(): Promise<string> {
    let pmuid = generatePMUID();
    let isUnique = false;

    while (!isUnique) {
        const existing = await prisma.user.findUnique({
            where: { publicId: pmuid }
        });

        if (!existing) {
            isUnique = true;
        } else {
            pmuid = generatePMUID();
        }
    }

    return pmuid;
}
