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

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
