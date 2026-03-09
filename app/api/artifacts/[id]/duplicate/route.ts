import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const originalArtifact = await prisma.artifact.findUnique({
            where: { id },
        });

        if (!originalArtifact) {
            return NextResponse.json({ error: 'Original artifact not found' }, { status: 404 });
        }

        // Create new artifact matching the exact stats (unique PID auto-assigned by DB)
        const duplicateArtifact = await prisma.artifact.create({
            data: {
                name: `${originalArtifact.name} (Copy)`,
                description: originalArtifact.description,
                imageUrl: originalArtifact.imageUrl,
                basePoints: originalArtifact.basePoints,
                tier: originalArtifact.tier,
                materialComposition: originalArtifact.materialComposition || undefined,
                width: originalArtifact.width,
                height: originalArtifact.height,
                depth: originalArtifact.depth,
            },
        });

        return NextResponse.json({ success: true, artifact: duplicateArtifact }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/artifacts/[id]/duplicate error:', error);
        return NextResponse.json({
            error: 'Failed to duplicate artifact',
            details: error.message
        }, { status: 500 });
    }
}
