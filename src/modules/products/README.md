# Products Module

Este módulo gestiona los productos, implementando lógica multitenant.

## Endpoints principales
- `POST /products`: Crea un nuevo producto para el tenant actual (requiere `name` y `price`).
- `GET /products`: Lista todos los productos del tenant actual.

## Multitenancy
- Este módulo es **multitenant-aware**.
- Para todas las operaciones, es **obligatorio** incluir la cabecera `x-tenant-id` en la solicitud (ej: `x-tenant-id: tenant_a`).
- El `TenantMiddleware` (configurado globalmente en `AppModule`) extrae este ID y lo almacena en el `RequestContext`.
- `ProductsService` utiliza el `tenantId` del `RequestContext` para obtener el cliente Prisma específico del tenant, asegurando el aislamiento de datos.

## Servicio (`ProductsService`)
- Utiliza `PrismaService` y el `RequestContext` para interactuar con la base de datos de productos del tenant específico.

## Extensión
- Puedes añadir lógica para actualizar, eliminar productos, o implementar búsquedas y filtros específicos por tenant.
