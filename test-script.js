const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const artifacts = await prisma.artifact.findMany({ take: 5 });
    console.log(JSON.stringify(artifacts, null, 2));
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
    });
