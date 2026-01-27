
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || "file:./dev.db"
        }
    }
});

async function main() {
    try {
        console.log('Connecting...');
        const users = await prisma.user.findMany();
        console.log('Connected! Users:', users);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
