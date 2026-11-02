# Patrones de diseño

## Objetivo

Documentar los patrones de diseño aplicados en el backend de QuillaCoin, indicando dónde se usan, qué problema resuelven y con qué tecnología se implementan, para que el equipo programe de forma uniforme.

## Contexto

- **Estilo:** monolito modular (Node.js + Express).
- **Enfoque interno:** Clean Architecture.
- **Base:** diagrama de componentes (C4 nivel 3).

## Patrones aplicados

| Patrón | Dónde se usa | Problema que resuelve | Se implementa con | Archivos en el código |
|---|---|---|---|---|
| Adapter | Pagos y Operaciones → proveedores externos | Cada proveedor ofrece su propia API; los retiros externos no son transferencias internas | API REST/SDK del proveedor, inicialmente simulado | Puertos y adaptadores por definir |
| Repository | Saldos y módulos → almacenamiento transaccional | Mantener el libro y las operaciones sin acoplar el dominio a la base de datos | Servicio compatible con Cloudflare, decisión pendiente | Repositorios transaccionales por definir |
| Decorator | Saldos → Caché | Acelerar consultas con una vista derivada sin cambiar el origen autoritativo | Servicio compatible con Cloudflare, tecnología pendiente | Decorador de lectura por definir |

## Cómo funciona cada patrón

| Patrón | En pocas palabras |
|---|---|
| Adapter | Traduce las operaciones de compra o retiro externo al contrato de un proveedor. Las transferencias entre usuarios no llaman a ese adaptador. |
| Repository | El caso de uso solicita registrar un movimiento; el repositorio aplica débito, crédito y transferencia atómicamente. |
| Decorator | Puede servir una vista temporal de lectura; el saldo disponible siempre se valida contra el libro autoritativo. |

## Beneficio

- Cambiar la pasarela o el proveedor custodial afecta a su adaptador, no a las transferencias internas.
- La tecnología de caché se puede sustituir; no participa en la contabilización ni en la autorización de fondos.
- La consistencia depende de registrar juntos los movimientos del libro en una transacción del almacenamiento elegido.

## Patrones previstos para siguientes iteraciones

| Patrón | Dónde se aplicaría | Cuándo |
|---|---|---|
| Observer | Operaciones → Notificaciones | Al implementar las notificaciones de estado |
| Factory | Compras → Transferencias | Si crear la operación se vuelve complejo por validaciones cruzadas |
| Facade | Comunicación entre módulos | Cuando los módulos crezcan y necesiten una única puerta de entrada |
| Strategy | Adaptadores de pago y custodia | Cuando haya más de un proveedor que deba intercambiarse |