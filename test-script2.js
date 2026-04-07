const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { username: true, profileImage: true } });
    const withImage = users.filter(u => u.profileImage);
    console.log(JSON.stringify(withImage, null, 2));
}

main().finally(() => prisma.$disconnect());
