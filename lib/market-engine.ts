import { prisma } from './db';

export const ASSETS = [
    { id: 'IRON', name: 'Iron', unit: '1kg Packet', startPrice: 100, upProb: 0.8, magMin: 0.005, magMax: 0.025 },
    { id: 'COPPER', name: 'Copper', unit: '1kg Packet', startPrice: 1000, upProb: 0.7, magMin: 0.01, magMax: 0.03 },
    { id: 'LITHIUM', name: 'Lithium', unit: '1kg Packet', startPrice: 2000, upProb: 0.65, magMin: 0.03, magMax: 0.08 },
    { id: 'SILVER', name: 'Silver', unit: '10g Biscuit', startPrice: 4000, upProb: 0.6, magMin: 0.01, magMax: 0.04 },
    { id: 'GOLD', name: 'Gold', unit: '10g Biscuit', startPrice: 80000, upProb: 0.55, magMin: 0.005, magMax: 0.02 },
    { id: 'OIL', name: 'Crude Oil', unit: '1 Barrel', startPrice: 50000, upProb: 0.5, magMin: 0.05, magMax: 0.12 },
];

export async function initAssets() {
    for (const assetConfig of ASSETS) {
        const existing = await prisma.asset.findUnique({ where: { id: assetConfig.id } });
        if (!existing) {
            await prisma.asset.create({
                data: {
                    id: assetConfig.id,
                    name: assetConfig.name,
                    unit: assetConfig.unit,
                    currentPrice: assetConfig.startPrice,
                    change24h: 0,
                    history: {
                        create: {
                            price: assetConfig.startPrice,
                            timestamp: new Date()
                        }
                    }
                }
            });
            console.log(`Initialized asset: ${assetConfig.name}`);
        }
    }
}

export async function updateMarketPrices() {
    // Ensure assets exist
    await initAssets();

    const assets = await prisma.asset.findMany();
    const now = new Date();

    for (const asset of assets) {
        const config = ASSETS.find(a => a.id === asset.id);
        if (!config) continue;

        const isUp = Math.random() < config.upProb;
        const magnitude = config.magMin + (Math.random() * (config.magMax - config.magMin));
        const direction = isUp ? 1 : -1;

        const changePercent = direction * magnitude;
        const rawNewPrice = Number(asset.currentPrice) * (1 + changePercent);
        const newPrice = Math.max(1, Math.round(rawNewPrice * 100) / 100);

        await prisma.asset.update({
            where: { id: asset.id },
            data: {
                currentPrice: newPrice,
                change24h: changePercent * 100,
                history: {
                    create: {
                        price: newPrice,
                        timestamp: now
                    }
                }
            }
        });
    }

    console.log(`Market updated at ${now.toISOString()}`);
}
