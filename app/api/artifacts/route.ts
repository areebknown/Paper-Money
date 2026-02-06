import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/artifacts - List all artifacts or filter by owner
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get('ownerId');
        const includePublic = searchParams.get('public') === 'true';

        const where: any = {};

        if (ownerId) {
            where.ownerId = ownerId;
        } else if (includePublic) {
            // "Public" means untargeted/marketplace items? 
            // For now, if no ownerId is specified, we likely want ALL artifacts for Admin view,
            // or we need a specific 'public' flag. 
            // Current strict logic: { ownerId: { not: null } } hides system artifacts.
            // FIX: If no params, show ALL (for admin panel).
        } else {
            // Default behavior: Don't exclude system artifacts (ownerId: null).
            // Previously: where.ownerId = { not: null };
        }

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
        console.log('[API] Create Artifact Body:', body);

        const {
            name,
            description,
            imageUrl,
            basePoints,
            pawnPoints,
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

        const artifact = await prisma.artifact.create({
            data: {
                name,
                description: description || '',
                imageUrl: imageUrl || '',
                basePoints: Number(basePoints),
                pawnPoints: pawnPoints ? Number(pawnPoints) : 0,
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
