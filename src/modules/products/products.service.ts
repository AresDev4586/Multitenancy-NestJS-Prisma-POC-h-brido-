import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestContext } from '../../common/context/request-context';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async createProduct(name: string, price: number) {
        const tenantId = RequestContext.get()?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Tenant ID not found in request context.');
        }
        const tenantClient = this.prisma.getTenantClient(tenantId);
        if (!tenantClient || !tenantClient.product) {
            throw new BadRequestException(`Product client not available for tenant: ${tenantId}`);
        }

        return tenantClient.product.create({
            data: { name, price },
        });
    }

    async listProducts() {
        const tenantId = RequestContext.get()?.tenantId;
        if (!tenantId) {
            throw new BadRequestException('Tenant ID not found in request context.');
        }
        const tenantClient = this.prisma.getTenantClient(tenantId);
        if (!tenantClient || !tenantClient.product) {
            throw new BadRequestException(`Product client not available for tenant: ${tenantId}`);
        }

        return tenantClient.product.findMany();
    }
}