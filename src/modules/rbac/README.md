# RBAC Module

Este módulo gestiona los roles y la asignación de roles a usuarios.

## Endpoints principales
- `GET /rbac/roles`: Listar roles
- `POST /rbac/roles`: Crear rol
- `DELETE /rbac/roles/:id`: Eliminar rol
- `POST /rbac/assign-role`: Asignar rol a usuario

## Servicio
- Usa `PrismaService` para acceder a los modelos `Role` y `UserRole`.

## Extensión
Puedes agregar endpoints para permisos, revocar roles, y lógica de autorización basada en roles.
