# 🏗️ Multitenancy-NestJS-Prisma (POC Híbrido)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
  
<p align="center">Un framework progresivo para Node.js, optimizado para construir aplicaciones del lado del servidor eficientes y escalables.</p>
<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## 1. 🎯 Objetivo

Construir un **entorno de pruebas local** que simule un modelo híbrido de multitenancy: **BD por tenant + schemas**. Esto permite aprender, validar conceptos y sentar bases para un entorno profesional escalable.

---

## 2. 🧩 Estrategia híbrida (simplificada para pruebas)

- Cada **tenant** tiene **su propia base de datos** (p.ej. `main.db`, `tenantA.db`, `tenantB.db` para SQLite).
- Dentro de cada BD, se usan los schemas definidos en Prisma para organizar los datos.
- Para este POC local: estamos usando **SQLite** para simplicidad.

---

## 3. 🗂️ Estructura del proyecto

```
/project-root
 ├── prisma/
 │   ├── schemas/
 │   │   ├── main.schema.prisma
 │   │   ├── tenantA.schema.prisma
 │   │   ├── tenantB.schema.prisma
 │   │   └── migrations/
 │   │   └── prisma/db/ (archivos .db de SQLite)
 │   ├── generated/ (clientes Prisma generados)
 │   └── seed.ts
 ├── src/
 │   ├── common/
 │   │   ├── middleware/
 │   │   │   └── tenant.middleware.ts
 │   │   ├── context/
 │   │   │   └── request-context.ts
 │   │   └── decorators/
 │   │       └── require-permission.decorator.ts
 │   ├── auth/ (módulo de autenticación)
 │   ├── rbac/ (módulo de control de acceso basado en roles)
 │   ├── prisma/ (servicios de Prisma)
 │   ├── tenants/ (módulo de gestión de tenants)
 │   ├── users/ (módulo de gestión de usuarios)
 │   ├── main.ts
 │   └── app.module.ts
 ├── .env (variables de entorno)
 ├── package.json
 └── README.md
```

---

## 4. ⚙️ Prisma Schemas (resumen)

El proyecto utiliza múltiples esquemas Prisma para soportar el modelo multitenant:

-   \`prisma/schemas/main.schema.prisma\`: Define los modelos centrales como `Tenant`, `User`, `Role`, `UserRole`.
-   \`prisma/schemas/tenantA.schema.prisma\`: Define modelos específicos para `tenantA`, como `Product`.
-   \`prisma/schemas/tenantB.schema.prisma\`: Define modelos específicos para `tenantB`, como `Product`.

---

## 5. 🌐 Contexto de Request y Middleware de Tenant

-   \`src/common/context/request-context.ts\`: Utiliza `AsyncLocalStorage` para almacenar el `tenantId` (y `userId` opcional) por cada request, permitiendo el aislamiento de datos.
-   \`src/common/middleware/tenant.middleware.ts\`: Un middleware que extrae el `x-tenant-id` de la cabecera HTTP y lo guarda en el `RequestContext`. Si el header falta, arroja un error.

---

## 6. 🔗 PrismaService Dinámico (`src/prisma/prisma.service.ts`)

Este servicio extiende `PrismaClient` y permite el acceso dinámico a diferentes bases de datos de tenant. Usa el `RequestContext` para determinar la URL de la base de datos del tenant actual y crea un cliente Prisma específico para ese tenant.

---

## 7. 🔒 RBAC - Decorador y Guard

-   \`src/common/decorators/require-permission.decorator.ts\`: Un decorador `@RequirePermission()` para marcar rutas o métodos que requieren permisos específicos.
-   \`src/common/guards/permissions.guard.ts\`: Un guard que verifica si el usuario autenticado tiene los permisos requeridos para acceder a una ruta, utilizando `PrismaService` para consultar roles y permisos del usuario en el contexto del tenant.

---

## 8. 📦 Comandos útiles

```bash
# Instalación de dependencias
$ npm install

# Build del proyecto (compila TypeScript a JavaScript)
$ npm run build

# Iniciar la aplicación en modo desarrollo (con watch)
$ npm run start:dev

# Iniciar la aplicación en modo producción
$ npm run start:prod

# Generar los clientes de Prisma para todos los schemas
$ npm run prisma:gen:main
$ npm run prisma:gen:tenantA
$ npm run prisma:gen:tenantB

# Ejecutar migraciones para cada schema (inicializa las bases de datos)
$ npm run prisma:migrate:main
$ npm run prisma:migrate:tenantA
$ npm run prisma:migrate:tenantB

# Abrir Prisma Studio para el schema principal
$ npm run prisma:studio:main

# Iniciar el seed para poblar la base de datos (si tienes uno)
$ npx ts-node prisma/seed.ts # Asegúrate de que el seed esté configurado para tu entorno.
```

---

## 9. ✅ Checklist de seguridad y buenas prácticas

-   🔒 Validación global de inputs (`class-validator`).
-   🌐 Configuración estricta de CORS.
-   🚦 Rate limiting para mitigar abusos.
-   🛡️ Headers seguros con `helmet`.
-   🔑 Manejo seguro de secretos en `.env` o servicios externos.
-   📊 Auditoría de acciones (`tenantId` + `userId`).

---

## 10. 🐳 Docker Compose (ejemplo para entorno local con PostgreSQL, si se usara)

(Actualmente usando SQLite, pero se incluye un ejemplo de Docker Compose para una configuración con PostgreSQL para referencia de un entorno de desarrollo más robusto).

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

## 11. 🔮 Siguientes pasos

1.  Integrar JWT para autenticación y gestión de tokens.
2.  Añadir cache con Redis para permisos.
3.  Implementar rollback seguro de migraciones.
4.  Integrar CI/CD con análisis de seguridad (SAST/DAST).
5.  Probar PgBouncer o Prisma Data Proxy para optimizar conexiones (para PostgreSQL).

---

## 12. 📚 Recursos y referencias

-   [Prisma Docs](https://www.prisma.io/docs/)
-   [NestJS Docs](https://docs.nestjs.com/)
-   [PgBouncer](https://www.pgbouncer.org/)
-   Ejemplos de `AsyncLocalStorage` en Node/NestJS.

---

## 13. Contacto y Licencia

<p align="center">
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

-   Autor - [Kamil Myśliwiec](https://twitter.com/kammysliwiec) (Autor original del template NestJS)
-   Website - [https://nestjs.com](https://nestjs.com/)
-   Twitter - [@nestframework](https://twitter.com/nestframework)

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
