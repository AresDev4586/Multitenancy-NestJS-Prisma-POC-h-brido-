import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: any) { } // inyecta el client correcto
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const required = this.reflector.get<string[]>('roles', ctx.getHandler());
        if (!required) return true;
        const req = ctx.switchToHttp().getRequest();
        const user = req.user; // asume que auth ya puso user en req
        if (!user) return false;
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { roles: { include: { role: true } } },
        });
        const userRoles = dbUser?.roles?.map(r => r.role.name) ?? [];
        return required.some(r => userRoles.includes(r));
    }
}
