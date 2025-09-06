import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) { }

  async createRole(name: string) {
    return this.prisma.main.role.create({
      data: { name },
    });
  }

  async getRoles() {
    return this.prisma.main.role.findMany();
  }

  async deleteRole(id: number) {
    return this.prisma.main.role.delete({
      where: { id },
    });
  }

  async assignRoleToUser(userId: number, roleId: number) {
    return this.prisma.main.userRole.create({
      data: { userId, roleId },
    });
  }
}
