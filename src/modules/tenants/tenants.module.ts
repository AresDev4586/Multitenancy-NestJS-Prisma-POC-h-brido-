import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [TenantsService, PrismaService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
