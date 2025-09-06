import { Global, Module } from '@nestjs/common';
import { PrismaClient as MainPrismaClient } from '../../prisma/generated/main/client';
import { PrismaClient as TenantAPrismaClient } from '../../prisma/generated/tenantA/client';
import { PrismaClient as TenantBPrismaClient } from '../../prisma/generated/tenantB/client';
import { PrismaService } from './prisma.service';

const mainPrisma = new MainPrismaClient();
const tenantAPrisma = new TenantAPrismaClient();
const tenantBPrisma = new TenantBPrismaClient();

@Global()
@Module({
  providers: [
    { provide: 'PRISMA_MAIN', useValue: mainPrisma },
    { provide: 'PRISMA_TENANT_A', useValue: tenantAPrisma },
    { provide: 'PRISMA_TENANT_B', useValue: tenantBPrisma },
    PrismaService,
  ],
  exports: ['PRISMA_MAIN', 'PRISMA_TENANT_A', 'PRISMA_TENANT_B', PrismaService],
})
export class PrismaModule {}
