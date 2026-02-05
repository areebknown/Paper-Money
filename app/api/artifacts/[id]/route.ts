import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/artifacts/[id] - Get single artifact with full details
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const artifact = await prisma.artifact.findUnique({
            where: { id: params.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                pawnShop: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!artifact) {
            return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
        }

        // Increment view count
        await prisma.artifact.update({
            where: { id: params.id },
            data: {
                viewCount: { increment: 1 },
                lastViewed: new Date(),
            },
        });

        // Calculate dynamic values
        let materialPoints = 0;
        if (artifact.materialComposition) {
            const materials = JSON.parse(artifact.materialComposition as string);
            for (const [material, quantity] of Object.entries(materials)) {
                const asset = await prisma.asset.findUnique({
                    where: { id: material },
                });
                if (asset) {
                    materialPoints += Number(asset.currentPrice) * Number(quantity);
                }
            }
        }

        const demandPoints = Math.floor(artifact.viewCount * 0.5);
        const pawnPoints = artifact.isPspPermanent
            ? artifact.pawnPoints
            : artifact.pawnShopId
                ? artifact.pawnPoints
                : 0;

        const totalValue =
            Number(artifact.basePoints) +
            materialPoints +
            demandPoints +
            Number(pawnPoints);

        return NextResponse.json({
            artifact: {
                ...artifact,
                materialPoints,
                demandPoints,
                pawnPoints: Number(pawnPoints),
                totalValue,
            },
        });
    } catch (error) {
        console.error('GET /api/artifacts/[id] error:', error);
        return NextResponse.json({ error: 'Failed to fetch artifact' }, { status: 500 });
    }
}

// PATCH /api/artifacts/[id] - Update artifact (admin only)
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const updates: any = {};

        if (body.name !== undefined) updates.name = body.name;
        if (body.description !== undefined) updates.description = body.description;
        if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
        if (body.basePoints !== undefined) updates.basePoints = Number(body.basePoints);
        if (body.ownerId !== undefined) updates.ownerId = body.ownerId;

        const artifact = await prisma.artifact.update({
            where: { id: params.id },
            data: updates,
        });

        return NextResponse.json({ artifact });
    } catch (error) {
        console.error('PATCH /api/artifacts/[id] error:', error);
        return NextResponse.json({ error: 'Failed to update artifact' }, { status: 500 });
    }
}
