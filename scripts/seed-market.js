const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ASSETS = [
    { id: 'IRON', name: 'Iron', unit: '1kg Packet', currentPrice: 100 },
    { id: 'COPPER', name: 'Copper', unit: '1kg Packet', currentPrice: 1000 },
    { id: 'LITHIUM', name: 'Lithium', unit: '1kg Packet', currentPrice: 2000 },
    { id: 'SILVER', name: 'Silver', unit: '10g Biscuit', currentPrice: 4000 },
    { id: 'GOLD', name: 'Gold', unit: '10g Biscuit', currentPrice: 80000 },
    { id: 'OIL', name: 'Crude Oil', unit: '1 Barrel', currentPrice: 50000 },
];

async function seed() {
    for (const asset of ASSETS) {
        await prisma.asset.upsert({
            where: { id: asset.id },
            update: {},
            create: {
                ...asset,
                change24h: 0,
                history: {
                    create: {
                        price: asset.currentPrice,
                    }
                }
            }
        });
    }
    console.log('Assets seeded successfully');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
