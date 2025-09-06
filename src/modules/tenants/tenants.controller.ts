import { Controller, Get, Post, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  create(@Body() body: { name: string; key: string }) {
    return this.tenantsService.createTenant(body.name, body.key);
  }

  @Get()
  findAll() {
    return this.tenantsService.listTenants();
  }
}
