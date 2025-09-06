import { PrismaClient as MainClient } from './generated/main';
import { PrismaClient as TenantAClient } from './generated/tenantA';
import { PrismaClient as TenantBClient } from './generated/tenantB';

async function main() {
    const main = new MainClient();
    const tenantA = new TenantAClient();
    const tenantB = new TenantBClient();

    // --- Main DB ---
    const tenantAEntry = await main.tenant.create({
        data: { name: 'Tenant A', key: 'tenant_a' },
    });
    const tenantBEntry = await main.tenant.create({
        data: { name: 'Tenant B', key: 'tenant_b' },
    });

    const adminRole = await main.role.create({ data: { name: 'admin' } });

    await main.user.create({
        data: {
            email: 'admin@a.com',
            password: '123456',
            tenantId: tenantAEntry.id,
            roles: { create: [{ roleId: adminRole.id }] },
        },
    });

    await main.user.create({
        data: {
            email: 'admin@b.com',
            password: '123456',
            tenantId: tenantBEntry.id,
            roles: { create: [{ roleId: adminRole.id }] },
        },
    });

    // --- Tenant A DB ---
    await tenantA.product.createMany({
        data: [
            { name: 'Laptop', price: 1200 },
            { name: 'Mouse', price: 25 },
        ],
    });

    // --- Tenant B DB ---
    await tenantB.product.createMany({
        data: [
            { name: 'Phone', price: 800 },
            { name: 'Headset', price: 50 },
        ],
    });

    await main.$disconnect();
    await tenantA.$disconnect();
    await tenantB.$disconnect();
}

main().catch(console.error);
