import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as dotenv from 'dotenv';
dotenv.config();

console.log(process.env.DATABASE_URL_MAIN)
console.log(process.env.DATABASE_URL_TENANTA)
console.log(process.env.DATABASE_URL_TENANTB)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
