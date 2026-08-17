import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "@/app/generated/prisma";

// Neon's serverless driver needs a WebSocket implementation outside the
// browser/edge runtime. This keeps pooled/interactive-transaction support
// working reliably across Vercel's Node.js serverless functions.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaNeon({ connectionString });

// Prevents exhausting the DB connection pool by reusing a single
// PrismaClient instance across hot-reloads in development, and across
// warm serverless function invocations on Vercel.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
