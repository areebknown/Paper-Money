
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHistory() {
    try {
        console.log('Fetching latest price history...');
        const history = await prisma.assetPriceHistory.findMany({
            take: 10,
            orderBy: { timestamp: 'desc' },
            include: { asset: true }
        });

        console.log('--- LATEST MARKET UPDATES ---');
        history.forEach(h => {
            // Convert to IST for clarity
            const date = new Date(h.timestamp);
            const istDate = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            console.log(`${h.asset.name}: ${h.price} at ${istDate} (UTC: ${h.timestamp.toISOString()})`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkHistory();
