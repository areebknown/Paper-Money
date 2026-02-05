import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/artifacts - List all artifacts or filter by owner
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get('ownerId');
        const includePublic = searchParams.get('public') === 'true';

        const where = ownerId
            ? { ownerId }
            : includePublic
                ? {}
                : { ownerId: { not: null } };

        const artifacts = await prisma.artifact.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                pawnShop: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate dynamic values (MP, DP) for each artifact
        const enrichedArtifacts = await Promise.all(
            artifacts.map(async (artifact) => {
                // Material Points (MP) - get current market prices
                let materialPoints = 0;
                if (artifact.materialComposition) {
                    const materials = JSON.parse(artifact.materialComposition as string);
                    // Fetch current market prices for gold, silver, etc.
                    for (const [material, quantity] of Object.entries(materials)) {
                        const asset = await prisma.asset.findUnique({
                            where: { id: material },
                        });
                        if (asset) {
                            materialPoints += Number(asset.currentPrice) * Number(quantity);
                        }
                    }
                }

                // Demand Points (DP) - based on views in last 7 days
                const demandPoints = Math.floor(artifact.viewCount * 0.5); // Simple formula

                // Pawn Shop Points (PSP)
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

                return {
                    ...artifact,
                    materialPoints,
                    demandPoints,
                    pawnPoints: Number(pawnPoints),
                    totalValue,
                };
            })
        );

        return NextResponse.json({ artifacts: enrichedArtifacts });
    } catch (error) {
        console.error('GET /api/artifacts error:', error);
        return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
    }
}

// POST /api/artifacts - Create new artifact (admin only)
export async function POST(req: Request) {
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
        const {
            name,
            description,
            imageUrl,
            basePoints,
            materialComposition,
            width,
            height,
            depth,
        } = body;

        const artifact = await prisma.artifact.create({
            data: {
                name,
                description,
                imageUrl,
                basePoints: Number(basePoints),
                materialComposition: materialComposition ? JSON.stringify(materialComposition) : null,
                width: width ? Number(width) : null,
                height: height ? Number(height) : null,
                depth: depth ? Number(depth) : null,
            },
        });

        return NextResponse.json({ artifact }, { status: 201 });
    } catch (error) {
        console.error('POST /api/artifacts error:', error);
        return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 });
    }
}
