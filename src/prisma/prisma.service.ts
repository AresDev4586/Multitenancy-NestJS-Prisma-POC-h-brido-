import { Injectable } from '@nestjs/common';
import { PrismaClient as MainClient } from '../../prisma/generated/main/client';
import { PrismaClient as TenantAClient } from '../../prisma/generated/tenantA/client';
import { PrismaClient as TenantBClient } from '../../prisma/generated/tenantB/client';
@Injectable()
export class PrismaService {
    main = new MainClient();
    tenantA = new TenantAClient();
    tenantB = new TenantBClient();

    async onModuleDestroy() {
        await this.main.$disconnect();
        await this.tenantA.$disconnect();
        await this.tenantB.$disconnect();
    }

    getTenantClient(tenant: string) {
        switch (tenant) {
            case 'tenant_a':
                return this.tenantA;
            case 'tenant_b':
                return this.tenantB;
            default:
                throw new Error(`Tenant client not found: ${tenant}`);
        }
    }
}
