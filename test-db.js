const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const users = await prisma.user.findMany({
        where: { parentAccountId: { not: null } },
        select: { id: true, parentAccountId: true, username: true }
    });
    console.log("Finance accounts:", JSON.stringify(users, null, 2));
    
    if (users.length > 0) {
        const parentId = users[0].parentAccountId;
        const main = await prisma.user.findFirst({
            where: { id: parentId },
            include: { financeAccounts: true }
        });
        console.log("Main account:", JSON.stringify(main, null, 2));
    }
    process.exit(0);
}
test();
