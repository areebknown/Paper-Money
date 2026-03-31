import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getUserFromToken } from '@/lib/auth';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Enhanced Upload Endpoint
 * - Supports Admin artifacts (default)
 * - Supports User PFPs (allows non-admins if folder is 'user_pfps')
 */
export async function POST(req: Request) {
    const user = await getUserFromToken();
    
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const folder = (formData.get('folder') as string) || 'artifacts';
        const publicId = formData.get('public_id') as string | null;

        // Security Check: 
        // 1. If not logged in, only allow 'user_pfps' folder (Signup flow)
        // 2. If logged in but not admin, only allow 'user_pfps' folder (Profile update)
        // 3. Admin can do anything
        const isPfpUpload = folder === 'user_pfps';
        const isAllowed = user?.isAdmin || isPfpUpload;

        if (!isAllowed) {
            return NextResponse.json({ error: 'Unauthorized folder access' }, { status: 403 });
        }

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert browser File to Buffer for Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadOptions: any = {
                folder,
                fetch_format: 'auto',
                quality: 'auto',
                transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }], // Optimized for PFPs
            };

            // If publicId (PMUID) is provided, use it as the filename
            if (publicId) {
                uploadOptions.public_id = publicId;
                uploadOptions.overwrite = true; // Replace previous if exists
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            url: result.secure_url.replace('/upload/', '/upload/q_auto,f_auto/'),
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        });
    } catch (error: any) {
        console.error('[Upload] Cloudinary error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
