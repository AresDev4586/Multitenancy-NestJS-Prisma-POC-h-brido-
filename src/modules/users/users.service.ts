import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(email: string, password: string, tenantId: number) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.main.user.create({
            data: {
                email,
                password: hashedPassword,
                tenantId,
            },
        });
    }

    async listUsers() {
        return this.prisma.main.user.findMany({
            include: { roles: true, tenant: true },
        });
    }

    async findUserById(id: number) {
        return this.prisma.main.user.findUnique({
            where: { id },
            include: { roles: true, tenant: true },
        });
    }

    async updateUser(id: number, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.main.user.update({
            where: { id },
            data: { email, password: hashedPassword },
        });
    }

    async deleteUser(id: number) {
        return this.prisma.main.user.delete({
            where: { id },
        });
    }
}
