import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }
  async login(email: string, password: string) {
    const user = await this.prisma.main.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');
    return user;
  }
  // Métodos de autenticación aquí
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.main.user.create({
      data: { email, password: hashedPassword },
    });
    return user;
  }
}
