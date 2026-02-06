export default async function EditAuctionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">Edit Auction</h1>
            <p className="text-gray-400">Editing functionality for auction <code className="text-cyan-400">{id}</code> is coming soon.</p>
            <a href="/admin/auctions" className="inline-block mt-4 text-cyan-500 hover:underline">&larr; Back to List</a>
        </div>
    );
}
