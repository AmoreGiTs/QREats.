import { PrismaClient } from '@prisma/client';
import { addTenantMiddleware, addAuditMiddleware } from './middleware/tenant';

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error']
  });

  // Add multi-tenant isolation middleware
  if (process.env.ENABLE_TENANT_ISOLATION !== 'false') {
    addTenantMiddleware(client);
    console.log('[Prisma] ✅ Tenant isolation middleware enabled');
  }

  // Add audit logging middleware (optional, for compliance)
  if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
    addAuditMiddleware(client);
    console.log('[Prisma] ✅ Audit logging middleware enabled');
  }

  return client;
};

// Read Client Singleton (for replicas)
const readPrismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_READ_URL || process.env.DATABASE_URL,
      },
    },
    log: ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
  var readPrisma: undefined | ReturnType<typeof readPrismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
const readPrisma = globalThis.readPrisma ?? readPrismaClientSingleton();

/**
 * Helper to run queries on the read replica
 */
export async function useReadReplica<T>(fn: (client: typeof readPrisma) => Promise<T>): Promise<T> {
  return fn(readPrisma);
}

export default prisma;
export { readPrisma };

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
  globalThis.readPrisma = readPrisma;
}
