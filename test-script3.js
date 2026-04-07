const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findUnique({ where: { username: 'areebadmin' } });
    console.log("areebadmin:", user.profileImage);
}
main().finally(() => prisma.$disconnect());
