import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: PrismaService) { }

    async createTenant(name: string, key: string) {
        return this.prisma.main.tenant.create({
            data: { name, key },
        });
    }

    async listTenants() {
        return this.prisma.main.tenant.findMany();
    }
}
