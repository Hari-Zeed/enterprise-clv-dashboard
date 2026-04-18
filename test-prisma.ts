import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Success:", user);
  } catch (e) {
    console.log("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
