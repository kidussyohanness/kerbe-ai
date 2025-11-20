#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.split("=");
  return [k.replace(/^--/, ""), v];
}));

async function main() {
  const email = (args.email || "").toLowerCase();
  const name = args.name || "";
  const password = args.password || "";
  if (!email || !password) {
    console.error("Usage: node scripts/create-user.mjs --email=user@company.com --name='Name' --password='Secret'");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash: hash },
    create: { email, name, passwordHash: hash },
  });
  // eslint-disable-next-line no-console
  console.log("Created/updated user:", { id: user.id, email: user.email });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


