# Login por cuenta + dictado por voz + precio al por mayor

## Objetivo
Que cada persona que abra la app vea solo su propio negocio.

## Problema
Todas las cuentas compartían una única fila de negocio (`negocio id = 1`) y el navegador
hablaba con Turso directamente con un token público: cualquiera que abriera la URL veía
y podía escribir los datos de todos.

## Decisión
- Cuentas en el servidor: email + contraseña (scrypt), sesión con cookie httpOnly.
- El token de la base de datos nunca llega al navegador: todo pasa por `/api/db`.
- Cada fila lleva `usuario_id`; toda consulta filtra por la cuenta de la sesión.
- El primer registro hereda los datos sueltos de la versión anterior (una sola vez).

## Tareas
- [x] `lib/turso.ts` server-only (acepta `libsql://` y `file:`)
- [x] `lib/db-server.ts` con migración y consultas por `usuario_id`
- [x] `lib/db.ts` cliente HTTP con la misma API `dbApi`
- [x] `lib/sesion.ts` scrypt + cookie httpOnly de 30 días
- [x] `app/api/auth/[accion]/route.ts` (registro, login, logout, sesión)
- [x] `app/api/db/route.ts` (operaciones autenticadas)
- [x] `components/login.tsx` y puerta de sesión en `app-shell`
- [x] Ajustes: cuenta y cerrar sesión
- [x] Voz: motivos visibles en vez de fallar en silencio
- [x] Precio al por mayor con número de unidades

## Verificación
- `tsc --noEmit` limpio, `next build` OK.
- E2E contra base temporal: dos cuentas registradas, datos de A invisibles para B,
  borrado de B no toca a A, login/logout correctos, migración de datos viejos adoptada
  por la primera cuenta.
- `precioPedido`: 2.000 × 10 al 35% = 31.000 (3.100 por unidad, 11.000 de ganancia).

## Pendiente / límites
- Sin recuperación de contraseña, sin verificación de correo, sin límite de intentos.
- El "primer registro hereda todo" asume que el dueño entra antes que sus amigos.
