import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to extract Cloudinary public ID from a URL
const extractPublicId = (url: string) => {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        if (uploadIndex === -1) return null;

        let startIndex = uploadIndex + 1;
        // Skip transformations (e.g., q_auto,f_auto)
        while (startIndex < parts.length && (parts[startIndex].includes(',') || /^[a-z]_[a-z0-9]+/.test(parts[startIndex]))) {
            startIndex++;
        }
        // Skip version (e.g., v123456789)
        if (startIndex < parts.length && /^v\d+$/.test(parts[startIndex])) {
            startIndex++;
        }

        let publicIdWithExt = parts.slice(startIndex).join('/');
        const lastDotIndex = publicIdWithExt.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            publicIdWithExt = publicIdWithExt.substring(0, lastDotIndex);
        }
        return publicIdWithExt;
    } catch {
        return null; // Safe fallback
    }
};

// GET /api/artifacts/[id] - Get single artifact with full details
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const artifact = await prisma.artifact.findUnique({
            where: { id },
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
            where: { id },
            data: {
                viewCount: { increment: 1 },
                lastViewed: new Date(),
            },
        });

        // Calculate dynamic values
        let materialPoints = 0;
        if (artifact.materialComposition) {
            const materials = artifact.materialComposition as Record<string, number>;
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

        const totalValue =
            Number(artifact.basePoints) +
            materialPoints +
            demandPoints;

        return NextResponse.json({
            artifact: {
                ...artifact,
                materialPoints,
                demandPoints,
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
    { params }: { params: Promise<{ id: string }> }
) {
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

        const body = await req.json();
        const updates: any = {};

        if (body.name !== undefined) updates.name = body.name;
        if (body.description !== undefined) updates.description = body.description;
        if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
        if (body.basePoints !== undefined) updates.basePoints = Number(body.basePoints);
        if (body.ownerId !== undefined) updates.ownerId = body.ownerId;

        const artifact = await prisma.artifact.update({
            where: { id },
            data: updates,
        });

        return NextResponse.json({ artifact });
    } catch (error) {
        console.error('PATCH /api/artifacts/[id] error:', error);
        return NextResponse.json({ error: 'Failed to update artifact' }, { status: 500 });
    }
}

// DELETE /api/artifacts/[id] - Delete artifact (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Step 1: Fetch the artifact before deleting to get its image URL
        const artifactToDelete = await prisma.artifact.findUnique({
            where: { id },
            select: { imageUrl: true },
        });

        // Deleting the artifact will cascade to remove it from any existing auctions 
        // due to `onDelete: Cascade` in AuctionArtifact
        await prisma.artifact.delete({
            where: { id },
        });

        // Step 2: Check if image needs to be deleted from Cloudinary
        if (artifactToDelete?.imageUrl) {
            const imageUrl = artifactToDelete.imageUrl;

            // Count if ANY OTHER artifact still uses this exact URL
            const otherArtifactsUsingImage = await prisma.artifact.count({
                where: { imageUrl },
            });

            // If 0 remaining, delete it from Cloudinary
            if (otherArtifactsUsingImage === 0) {
                const publicId = extractPublicId(imageUrl);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log(`[Cloudinary] Deleted unused image: ${publicId}`);
                    } catch (cloudErr) {
                        console.error('[Cloudinary] Failed to delete image:', cloudErr);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Artifact deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/artifacts/[id] error:', error);
        return NextResponse.json({ error: 'Failed to delete artifact' }, { status: 500 });
    }
}
