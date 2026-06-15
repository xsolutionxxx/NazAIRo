import "dotenv/config";
import prisma from "../shared/lib/prisma-db.js";

const email = process.argv[2] || "nazartalaievych@gmail.com";

const result = await prisma.user.updateMany({
  where: { email },
  data: { role: "ADMIN" },
});

if (result.count > 0) {
  console.log(`✅ User "${email}" is now ADMIN`);
} else {
  console.log(`❌ No user found with email "${email}"`);
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log("Available users:", users);
}

await prisma.$disconnect();
process.exit(0);
