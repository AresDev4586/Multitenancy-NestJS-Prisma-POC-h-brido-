import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { email: string; password: string; tenantId: number }) {
    return this.usersService.createUser(body.email, body.password, body.tenantId);
  }

  @Get()
  findAll() {
    return this.usersService.listUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(Number(id));
  }
  @Put('update/:id')
  update(@Param('id') id: string, @Body() body: { email: string; password: string }) {
    return this.usersService.updateUser(Number(id), body.email, body.password);
  }

  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }

  // Métodos adicionales para update, delete, asignar roles, etc. pueden agregarse aquí
}
