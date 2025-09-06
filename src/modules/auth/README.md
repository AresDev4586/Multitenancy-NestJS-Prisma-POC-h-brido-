# Auth Module

Este módulo gestiona la autenticación de usuarios.

## Endpoints principales
- `POST /auth/login`: Login de usuario (requiere email y password)
- `POST /auth/register`: Registro de usuario (requiere email y password)

## Servicio
- Usa `PrismaService` para acceder a la base de datos principal (`main`).
- Valida credenciales y registra usuarios.

## Extensión
Puedes agregar JWT, refresh tokens, y lógica de autorización avanzada aquí.
