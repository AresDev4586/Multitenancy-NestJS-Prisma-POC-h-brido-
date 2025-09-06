import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  getRoles() {
    return this.rbacService.getRoles();
  }

  @Post('roles')
  createRole(@Body() body: { name: string }) {
    return this.rbacService.createRole(body.name);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(Number(id));
  }

  @Post('assign-role')
  assignRole(@Body() body: { userId: number; roleId: number }) {
    return this.rbacService.assignRoleToUser(body.userId, body.roleId);
  }
}
