// Prisma client singleton — prevents multiple instances in dev (hot reload)
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
