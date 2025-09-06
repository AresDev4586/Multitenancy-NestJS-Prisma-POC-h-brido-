# Tenants Module

Este módulo gestiona los tenants (clientes o espacios independientes).

## Endpoints principales
- `POST /tenants`: Crear tenant (requiere name y key)
- `GET /tenants`: Listar tenants

## Servicio
- Usa `PrismaService` para acceder al modelo `Tenant` y sus relaciones.

## Extensión
Puedes agregar endpoints para actualizar, eliminar tenants y gestionar usuarios asociados.
