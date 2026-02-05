import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/pawnshop - Get user's pawn shop status
export async function GET() {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const pawnShop = await prisma.pawnShop.findUnique({
            where: { userId },
            include: {
                artifacts: true,
            },
        });

        return NextResponse.json({ pawnShop });
    } catch (error) {
        console.error('GET /api/pawnshop error:', error);
        return NextResponse.json({ error: 'Failed to fetch pawn shop' }, { status: 500 });
    }
}

// POST /api/pawnshop - Activate pawn shop (or add artifact to shop)
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, artifactId } = body;

        if (action === 'activate') {
            // Create or activate pawn shop
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Check if shop already exists
            let pawnShop = await prisma.pawnShop.findUnique({ where: { userId } });

            if (!pawnShop) {
                // Create new shop (activation cost is set by admin, default 0 for now)
                pawnShop = await prisma.pawnShop.create({
                    data: {
                        userId,
                        isActive: true,
                        activatedAt: new Date(),
                        activationCost: 5000, // Default cost
                        pspValue: 100, // Default PSP value per artifact
                    },
                });
            } else if (!pawnShop.isActive) {
                // Reactivate existing shop
                const activationCost = Number(pawnShop.activationCost);
                if (Number(user.balance) < activationCost) {
                    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
                }

                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: userId },
                        data: { balance: { decrement: activationCost } },
                    }),
                    prisma.pawnShop.update({
                        where: { id: pawnShop.id },
                        data: {
                            isActive: true,
                            activatedAt: new Date(),
                        },
                    }),
                ]);
            }

            return NextResponse.json({ pawnShop });
        } else if (action === 'add_artifact') {
            // Add artifact to pawn shop
            const pawnShop = await prisma.pawnShop.findUnique({ where: { userId } });

            if (!pawnShop || !pawnShop.isActive) {
                return NextResponse.json({ error: 'Pawn shop not active' }, { status: 400 });
            }

            const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
            if (!artifact) {
                return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
            }

            if (artifact.ownerId !== userId) {
                return NextResponse.json({ error: 'You do not own this artifact' }, { status: 403 });
            }

            // Add artifact to shop with PSP
            const updatedArtifact = await prisma.artifact.update({
                where: { id: artifactId },
                data: {
                    pawnShopId: pawnShop.id,
                    pawnPoints: Number(pawnShop.pspValue),
                    isPspPermanent: false,
                },
            });

            return NextResponse.json({ artifact: updatedArtifact });
        } else if (action === 'remove_artifact') {
            // Remove artifact from shop (loses PSP)
            const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
            if (!artifact) {
                return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
            }

            if (artifact.ownerId !== userId) {
                return NextResponse.json({ error: 'You do not own this artifact' }, { status: 403 });
            }

            const updatedArtifact = await prisma.artifact.update({
                where: { id: artifactId },
                data: {
                    pawnShopId: null,
                    pawnPoints: 0,
                    isPspPermanent: false,
                },
            });

            return NextResponse.json({ artifact: updatedArtifact });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('POST /api/pawnshop error:', error);
        return NextResponse.json({ error: 'Failed to update pawn shop' }, { status: 500 });
    }
}
