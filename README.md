# 🏗️ Multitenancy-NestJS-Prisma (POC híbrido)

## 1. 🎯 Objetivo

Construir un **entorno de pruebas local** que simule un modelo híbrido de multitenancy: **BD por tenant + schemas**. Esto permite aprender, validar conceptos y sentar bases para un entorno profesional escalable.

---

## 2. 🧩 Estrategia híbrida (simplificada para pruebas)

-   Cada **tenant** tiene **su propia base de datos** (p.ej. `tenant_a_db`, `tenant_b_db`).

-   Dentro de cada BD, usamos un **schema extra** para organizar datos del sistema (`meta`, `audit`).

-   Para local: usaremos **Postgres + Docker**.


---

## 3. 🗂️ Estructura del proyecto

```
/project-root
 ├── prisma/
 │   ├── schema.prisma
 │   ├── migrations/
 │   └── seed.ts
 ├── src/
 │   ├── common/
 │   │   ├── middleware/
 │   │   │   └── tenant.middleware.ts
 │   │   ├── context/
 │   │   │   └── request-context.ts
 │   │   └── decorators/
 │   │       └── require-permission.decorator.ts
 │   ├── auth/
 │   │   └── guards/
 │   │       └── permissions.guard.ts
 │   ├── prisma/
 │   │   └── prisma.service.ts
 │   ├── tenants/
 │   │   ├── tenants.module.ts
 │   │   └── tenants.service.ts
 │   ├── users/
 │   │   ├── users.module.ts
 │   │   └── users.service.ts
 │   ├── main.ts
 │   └── app.module.ts
 ├── test/
 │   └── e2e/
 │       └── tenants.e2e-spec.ts
 ├── docker-compose.yml
 ├── package.json
 └── README.md
```

---

## 4. 🗄️ SQL inicial (Postgres local)

```sql
-- Base de datos para cada tenant
CREATE DATABASE tenant_a_db;
CREATE DATABASE tenant_b_db;

-- En cada BD creamos schemas
\c tenant_a_db;
CREATE SCHEMA meta;
CREATE SCHEMA audit;

\c tenant_b_db;
CREATE SCHEMA meta;
CREATE SCHEMA audit;
```

---

## 5. ⚙️ Prisma schema base (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  roles     UserRole[]
}

model Role {
  id          String         @id @default(uuid())
  name        String
  tenantId    String
  permissions RolePermission[]
  users       UserRole[]
}

model Permission {
  id    String @id @default(uuid())
  code  String
  roles RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}
```

---

## 6. 🌐 Contexto de request (`request-context.ts`)

```ts
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  tenantId: string;
  userId?: string;
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContextData>();

  static run(data: RequestContextData, callback: () => void) {
    this.storage.run(data, callback);
  }

  static get(): RequestContextData | undefined {
    return this.storage.getStore();
  }
}
```

---

## 7. 🛠️ Middleware de tenant (`tenant.middleware.ts`)

```ts
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContext } from '../context/request-context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) throw new BadRequestException('Missing tenant header');

    RequestContext.run({ tenantId }, () => next());
  }
}
```

---

## 8. 🔗 PrismaService dinámico (`prisma.service.ts`)

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RequestContext } from '../common/context/request-context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async $useTenant<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    const ctx = RequestContext.get();
    if (!ctx?.tenantId) throw new Error('Tenant not resolved');

    const dbUrl = process.env[`DB_URL_${ctx.tenantId.toUpperCase()}`];
    if (!dbUrl) throw new Error(`DB URL for tenant ${ctx.tenantId} not found`);

    const client = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    return fn(client).finally(() => client.$disconnect());
  }
}
```

---

## 9. 🔒 RBAC — Decorador y Guard

### Decorador `@RequirePermission()`

```ts
import { SetMetadata } from '@nestjs/common';
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### Guard `permissions.guard.ts`

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../../common/decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) return false;

    return this.prisma.$useTenant(async (db) => {
      const userRoles = await db.userRole.findMany({
        where: { userId },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });
      const userPermissions = new Set(
        userRoles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code))
      );
      return required.every((perm) => userPermissions.has(perm));
    });
  }
}
```

---

## 10. 🚀 Migraciones y seeds

-   **Migraciones**: usar `prisma migrate dev` en cada BD de tenant.

-   **Seed** (`prisma/seed.ts`):


```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.role.create({
    data: { name: 'admin', tenantId: 'tenant_a', permissions: { create: [{ permission: { create: { code: 'manage_users' } } }] } },
  });
  await prisma.user.create({
    data: { email: 'admin@a.com', roles: { create: [{ roleId: admin.id }] } },
  });
}

main().finally(() => prisma.$disconnect());
```

---

## 11. ✅ E2E básico (`tenants.e2e-spec.ts`)

```ts
describe('Tenant isolation', () => {
  it('should not allow tenant A to see tenant B data', async () => {
    // Simular petición con x-tenant-id = tenant_a
    // Crear usuario en tenant_a y verificar que no aparece en tenant_b
  });
});
```

---

## 12. 🛡️ Checklist de seguridad

-   ✅ Validar inputs globalmente.

-   ✅ CORS bien configurado.

-   ✅ Rate limiting.

-   ✅ Headers seguros (Helmet).

-   ✅ Secrets en `.env` seguro.


---

## 13. 🐳 Docker Compose (local)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    volumes:
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
```

Archivo `docker/init.sql`:

```sql
CREATE DATABASE tenant_a_db;
CREATE DATABASE tenant_b_db;
```

---

## 14. 📦 Comandos útiles

```bash
# Levantar DB
npm run docker:up

# Generar cliente Prisma
npx prisma generate

# Migraciones
DB_URL_TENANT_A="postgresql://.../tenant_a_db" npx prisma migrate dev
DB_URL_TENANT_B="postgresql://.../tenant_b_db" npx prisma migrate dev

# Seed
ts-node prisma/seed.ts
```

---

## 15. 🔮 Siguientes pasos

-   Añadir **Redis** para cachear permisos.

-   Mejorar **auditoría** (guardar cada acción con `tenantId`, `userId`).

-   Integrar **CI/CD** con SonarQube + OWASP ZAP.

-   Probar **rollback de migraciones** por tenant.


---

# 🏗️ Multitenancy-NestJS-Prisma (POC híbrido)

## 14. 📦 Comandos útiles

```bash
# Levantar contenedores Docker
npm run docker:up

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones en tenant A
DB_URL_TENANT_A="postgresql://.../tenant_a_db" npx prisma migrate dev

# Ejecutar migraciones en tenant B
DB_URL_TENANT_B="postgresql://.../tenant_b_db" npx prisma migrate dev

# Ejecutar seed global o por tenant
npx ts-node prisma/seed.ts
```

---

## 15. ✅ Checklist de seguridad

-   🔒 Validación global de inputs (`class-validator`).

-   🌐 Configuración estricta de CORS.

-   🚦 Rate limiting para mitigar abusos.

-   🛡️ Headers seguros con `helmet`.

-   🔑 Manejo seguro de secretos en `.env` o servicios externos (Vault, AWS Secrets Manager).

-   📊 Auditoría de acciones (`tenantId` + `userId`).


---

## 16. 🐳 Docker Compose para entorno local

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
    volumes:
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
```

Archivo `docker/init.sql`:

```sql
CREATE DATABASE tenant_a_db;
CREATE DATABASE tenant_b_db;
```

---

## 17. 🚀 Pruebas E2E recomendadas

-   🧪 Verificar que datos de tenant A no son accesibles desde tenant B.

-   🔑 Probar autorización por roles y permisos.

-   📋 Validar seeds y migraciones por tenant.

-   🧹 Confirmar auditoría de logs.


---

## 18. 📚 Recursos y referencias

-   [Prisma Docs](https://www.prisma.io/docs/)

-   [NestJS Docs](https://docs.nestjs.com/)

-   [PgBouncer](https://www.pgbouncer.org/)

-   Ejemplos de `AsyncLocalStorage` en Node/NestJS.


---

## 19. 🔮 Siguientes pasos

1.  Añadir cache con Redis para permisos.

2.  Implementar rollback seguro de migraciones.

3.  Integrar CI/CD con análisis de seguridad (SAST/DAST).

4.  Probar PgBouncer o Prisma Data Proxy para optimizar conexiones.


---

## 20. 🎯 Conclusión

Con esta guía tienes un **POC híbrido de multitenancy (DB + Schema)** en NestJS + Prisma. Escalable, seguro y con bases para producción. ✅
