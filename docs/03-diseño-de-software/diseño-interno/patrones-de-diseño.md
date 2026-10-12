# Patrones de diseño

## Objetivo

Documentar los patrones de diseño aplicados en el backend de Flexcoin, indicando dónde se usan, qué problema resuelven y con qué tecnología se implementan, para que el equipo programe de forma uniforme.

## Contexto

- **Estilo:** monolito modular (Node.js + Express).
- **Enfoque interno:** Clean Architecture.
- **Base:** diagrama de componentes (C4 nivel 3).

## Patrones aplicados

| Patrón | Dónde se usa | Problema que resuelve | Se implementa con | Archivos en el código |
|---|---|---|---|---|
| Adapter | Compras y Transferencias → Pasarela de pagos | La pasarela tiene su propia API | SDK o API REST de la pasarela | `payment-port.js`, `culqi-payment.adapter.js` |
| Adapter | Transferencias → Proveedor de criptomonedas | El proveedor tiene su propia API | API REST del proveedor (axios o fetch) | `cripto-port.js`, `binance-cripto.adapter.js` |
| Adapter | Transferencias → Red blockchain | La red blockchain tiene su propio protocolo | SDK o API REST del nodo | `blockchain-port.js`, `blockchain.adapter.js` |
| Repository | Todos los módulos → Base de datos | El negocio no debe conocer SQL | PostgreSQL (librería `pg` u ORM) | `transferencia-repository.js`, `postgres-transferencia-repository.js` |
| Decorator | Saldos → Caché | Consultar saldos más rápido sin modificar el repositorio | Redis | `cached-saldo-repository.js` |

## Cómo funciona cada patrón

| Patrón | En pocas palabras |
|---|---|
| Adapter | Traduce: el sistema dice `cobrar(monto)` y el adaptador lo convierte en la llamada propia de la pasarela, del proveedor de criptomonedas o de la blockchain. |
| Repository | El negocio dice `guardar(transferencia)`; el repositorio escribe el SQL. |
| Decorator | Busca primero en Redis; si no está, consulta PostgreSQL y lo guarda en Redis para la próxima vez. |

## Beneficio

- Cambiar de pasarela, de proveedor de criptomonedas o de red blockchain solo afecta al adaptador correspondiente.
- La caché con Redis se puede activar o retirar sin tocar las reglas de negocio.
- El control de concurrencia queda aislado del acceso a datos gracias al patrón Repository.

## Patrones previstos para siguientes iteraciones

| Patrón | Dónde se aplicaría | Cuándo |
|---|---|---|
| Observer | Operaciones → Notificaciones | Al implementar las notificaciones de estado |
| Factory | Compras → Transferencias | Si crear la operación se vuelve complejo por validaciones cruzadas |
| Facade | Comunicación entre módulos | Cuando los módulos crezcan y necesiten una única puerta de entrada |
| Singleton | Control de concurrencia | Si el servicio de bloqueo debe ser único en toda la aplicación |