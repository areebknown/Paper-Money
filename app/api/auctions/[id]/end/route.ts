import { NextResponse } from 'next/server';
import { endAuctionService } from '@/lib/auction-service';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await endAuctionService(id);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('POST /end error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
