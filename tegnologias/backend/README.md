# QuillaCoin backend

Backend inicial del monolito modular: autenticación, consulta de saldos y transferencias internas simuladas. No procesa dinero ni criptoactivos reales y no integra compras, retiros, custodios ni proveedores de IA.

## Requisitos

- Node.js 22 o superior
- Docker con el plugin Compose, o PostgreSQL 16 accesible

## Arranque local

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
npm install
npm run migrate
npm run dev
```

La API escucha en `http://localhost:3000`; `GET /health` comprueba el proceso y `GET /ready` comprueba PostgreSQL. El activo `TST` de la migración es exclusivamente simulado, tiene cero decimales y no representa un activo negociable.

## Rutas iniciales

| Método | Ruta | Acceso |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Público |
| `POST` | `/api/v1/auth/login` | Público, limitado por IP |
| `POST` | `/api/v1/auth/refresh` | Cookie de refresh + `Origin` permitido |
| `POST` | `/api/v1/auth/logout` | Cookie de refresh + `Origin` permitido |
| `GET` | `/api/v1/auth/me` | Bearer JWT |
| `GET` | `/api/v1/saldos` | Bearer JWT |
| `POST` | `/api/v1/transferencias` | Bearer JWT + `Idempotency-Key` |

El cuerpo de transferencia es `{"destinoId":"<uuid>","activo":"TST","montoUnidades":"10"}`. Las cuentas nuevas tienen saldo cero; el fondeo de prueba y la compra simulada todavía no forman parte de esta entrega.

## Verificación

```powershell
npm test
npm run build
```

Las pruebas de integración transaccionales usan una base PostgreSQL dedicada cuyo nombre termine en `_test`. Con Compose, créala y migra el esquema:

```powershell
docker compose exec -T postgres createdb -U quilla quillacoin_test
$env:DATABASE_URL='postgresql://quilla:quilla@localhost:5432/quillacoin_test'
npm run migrate
$env:RUN_DATABASE_TESTS='true'
npm test
```

La suite borra al finalizar únicamente los usuarios y registros que ella misma crea.

Antes de usarlo, cambia `JWT_ACCESS_SECRET` y configura `APP_ORIGIN`. En despliegues HTTPS, `COOKIE_SECURE=true` es obligatorio. La clave de acceso y la contraseña de PostgreSQL del Compose son solo para desarrollo local.
