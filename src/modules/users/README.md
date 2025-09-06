# Users Module

Este módulo gestiona los usuarios del sistema.

## Endpoints principales
- `POST /users`: Crear usuario (requiere email, password y tenantId)
- `GET /users`: Listar usuarios (incluye roles y tenant)

## Servicio
- Usa `PrismaService` para acceder al modelo `User` y sus relaciones.

## Extensión
Puedes agregar endpoints para actualizar, eliminar usuarios y asignar roles.
