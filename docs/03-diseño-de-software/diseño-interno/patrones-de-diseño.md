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
| Transactional Outbox | Transferencias → outbox/worker de análisis | Evitar perder eventos cuando la transferencia se confirma pero la publicación al transporte falla | Registro durable en la misma transacción del libro; transporte por seleccionar | Esquema y publicador por definir |
| Consumer idempotente | Worker de análisis de riesgo | Tolerar entregas repetidas y reintentos sin duplicar alertas | Identificador único de evento y restricción de persistencia | Worker y repositorio por definir |
| Adapter / Strategy | Chat y análisis → proveedor de IA | Aislar el proveedor/modelo de los casos de uso y permitir simulación o sustitución | API/SDK compatible, por seleccionar | Puerto y adaptadores por definir |

## Cómo funciona cada patrón

| Patrón | En pocas palabras |
|---|---|
| Adapter | Traduce las operaciones de compra o retiro externo al contrato de un proveedor. Las transferencias entre usuarios no llaman a ese adaptador. |
| Repository | El caso de uso solicita registrar un movimiento; el repositorio aplica débito, crédito y transferencia atómicamente. |
| Decorator | Puede servir una vista temporal de lectura; el saldo disponible siempre se valida contra el libro autoritativo. |
| Transactional Outbox | El evento se guarda junto con la transferencia en una sola transacción; un worker lo publica/procesa después y reintenta ante fallos. |
| Consumer idempotente | El worker registra que procesó cada evento de modo que recibirlo otra vez no duplica el efecto lógico. |
| Adapter / Strategy | Los casos de uso dependen de un contrato, no de un proveedor específico de IA; el resultado sigue siendo una sugerencia. |

## Beneficio

- Cambiar la pasarela o el proveedor custodial afecta a su adaptador, no a las transferencias internas.
- La tecnología de caché se puede sustituir; no participa en la contabilización ni en la autorización de fondos.
- La consistencia depende de registrar juntos los movimientos del libro en una transacción del almacenamiento elegido.
- La IA queda fuera de la ruta crítica. Su demora puede postergar alertas, nunca alterar el resultado de una transferencia confirmada.
- La puntuación del modelo no confirma fraude ni produce suspensiones automáticas; las alertas requieren revisión autorizada y auditada.

## Patrones previstos para siguientes iteraciones

| Patrón | Dónde se aplicaría | Cuándo |
|---|---|---|
| Observer | Operaciones → Notificaciones | Al implementar las notificaciones de estado |
| Factory | Compras → Transferencias | Si crear la operación se vuelve complejo por validaciones cruzadas |
| Facade | Comunicación entre módulos | Cuando los módulos crezcan y necesiten una única puerta de entrada |
| Strategy | Adaptadores de pago y custodia | Cuando haya más de un proveedor que deba intercambiarse |
| Circuit Breaker | Llamadas del chat/worker al proveedor de IA | Si la integración requiere limitar fallos repetidos y recuperar el servicio de forma controlada |