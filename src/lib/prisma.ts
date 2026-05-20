import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
    const log: Prisma.LogLevel[] =
        process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl?.includes("neon.tech")) {
        const adapter = new PrismaNeon({ connectionString: databaseUrl });

        return new PrismaClient({
            adapter,
            log,
        });
    }

    return new PrismaClient({ log });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
