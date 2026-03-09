import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/artifacts - List all artifacts or filter by owner
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get('ownerId');
        const includePublic = searchParams.get('public') === 'true';
        const search = searchParams.get('search') || '';
        const limitStr = searchParams.get('limit');
        const pageStr = searchParams.get('page');
        const available = searchParams.get('available') === 'true';

        const limit = limitStr ? parseInt(limitStr, 10) : undefined;
        const page = pageStr ? Math.max(1, parseInt(pageStr, 10)) : 1;

        const where: any = {};

        if (ownerId) {
            where.ownerId = ownerId;
        }

        if (search) {
            const numSearch = parseInt(search, 10);
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                ...(isNaN(numSearch) ? [] : [{ productId: { equals: numSearch } }])
            ];
        }

        if (available) {
            where.ownerId = null;
            // Artifacts linked to an active auction cannot be selected again
            where.auctions = {
                none: {
                    auction: {
                        status: { in: ['SCHEDULED', 'WAITING_ROOM', 'LIVE'] }
                    }
                }
            };
        }

        const skip = limit ? (page - 1) * limit : undefined;
        const take = limit ? limit : undefined;

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
            skip,
            take,
        });

        const total = limit ? await prisma.artifact.count({ where }) : undefined;

        // Calculate dynamic values (MP, DP) for each artifact
        const enrichedArtifacts = await Promise.all(
            artifacts.map(async (artifact) => {
                // Material Points (MP) - get current market prices
                let materialPoints = 0;
                if (artifact.materialComposition) {
                    const materials = artifact.materialComposition as Record<string, number>;
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

                const totalValue =
                    Number(artifact.basePoints) +
                    materialPoints +
                    demandPoints;

                return {
                    ...artifact,
                    materialPoints,
                    demandPoints,
                    totalValue,
                };
            })
        );

        return NextResponse.json({ artifacts: enrichedArtifacts, total });
    } catch (error) {
        console.error('GET /api/artifacts error:', error);
        return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
    }
}

function calculateArtifactTier(bp: number): string {
    if (bp <= 1000) return 'E';
    if (bp <= 5000) return 'D';
    if (bp <= 12000) return 'C';
    if (bp <= 35000) return 'B';
    if (bp <= 100000) return 'A';
    if (bp <= 300000) return 'AA';
    if (bp <= 1000000) return 'AAA';
    if (bp <= 3000000) return 'S';
    if (bp <= 10000000) return 'SS';
    if (bp <= 30000000) return 'SSS';
    return 'SSS+';
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
        console.log('[API] Create Artifact Body:', body);

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

        // Strict Validation
        if (!name || basePoints === undefined) {
            console.error('[API] Missing required fields for artifact:', { name, basePoints });
            return NextResponse.json({ error: 'Name and Base Points are required' }, { status: 400 });
        }

        const numericBp = Number(basePoints);
        const tier = calculateArtifactTier(numericBp);

        const artifact = await prisma.artifact.create({
            data: {
                name,
                description: description || '',
                imageUrl: imageUrl || '',
                basePoints: numericBp,
                tier,
                // Ensure materialComposition is valid JSON or undefined
                materialComposition: materialComposition && Object.keys(materialComposition).length > 0 ? materialComposition : undefined,
                width: width ? Number(width) : undefined,
                height: height ? Number(height) : undefined,
                depth: depth ? Number(depth) : undefined,
            },
        });

        console.log('[API] Artifact Created:', artifact.id);
        return NextResponse.json({ artifact }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/artifacts error:', error);
        return NextResponse.json({
            error: 'Failed to create artifact',
            details: error.message
        }, { status: 500 });
    }
}
