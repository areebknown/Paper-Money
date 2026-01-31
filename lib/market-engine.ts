import { prisma } from './db';

export const ASSETS = [
    { id: 'IRON', name: 'Iron', unit: '1kg Packet', startPrice: 100, upProb: 0.74, magMin: 0.005, magMax: 0.04, description: 'Safest asset, anti-loss hedge' },
    { id: 'COPPER', name: 'Copper', unit: '1kg Packet', startPrice: 1000, upProb: 0.70, magMin: 0.02, magMax: 0.03, description: 'Low risk, slow growth' },
    { id: 'SILVER', name: 'Silver', unit: '10g Biscuit', startPrice: 4000, upProb: 0.60, magMin: 0.01, magMax: 0.045, description: 'Balanced trading metal' },
    { id: 'GOLD', name: 'Gold', unit: '10g Biscuit', startPrice: 80000, upProb: 0.90, magMin: 0.015, magMax: 0.025, description: 'Wealth preservation' },
    { id: 'LITHIUM', name: 'Lithium', unit: '1kg Packet', startPrice: 2000, upProb: 0.55, magMin: 0.03, magMax: 0.06, description: 'Growth + volatility' },
    { id: 'OIL', name: 'Crude Oil', unit: '1 Barrel', startPrice: 10000, upProb: 0.50, magMin: 0.05, magMax: 0.12, description: 'Adrenaline button 😭' },
];

export async function initAssets() {
    for (const assetConfig of ASSETS) {
        // 1. Ensure the Market System account for this asset exists
        const systemUsername = `MARKET_${assetConfig.id}`;
        await prisma.user.upsert({
            where: { username: systemUsername },
            update: {},
            create: {
                username: systemUsername,
                password: 'SYSTEM_ACCOUNT_LOCKED', // Non-loginable
                isAdmin: true,
                balance: 10000000 // Infinite-like pool for market side (within Decimal 10,2 limit)
            }
        });

        // 2. Ensure Asset exists
        await prisma.asset.upsert({
            where: { id: assetConfig.id },
            update: {
                name: assetConfig.name,
                unit: assetConfig.unit,
                description: assetConfig.description
            },
            create: {
                id: assetConfig.id,
                name: assetConfig.name,
                unit: assetConfig.unit,
                description: assetConfig.description,
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
        console.log(`Initialized asset and market account for: ${assetConfig.name}`);
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
