# Atributos de calidad

## Objetivo

Determinar cómo debe comportarse el sistema, además de las funcionalidades que debe proporcionar.

En el caso Flexcoin se consideran relevantes la concurrencia, la consistencia de los saldos, el rendimiento, la disponibilidad, la seguridad y la mantenibilidad del sistema.

---

## Atributos de calidad y escenarios

| ID | Atributo de calidad | Escenario de calidad |
|----|---------------------|----------------------|
| AC01 | Rendimiento | Las consultas de saldos y el procesamiento de transferencias deben responder dentro de tiempos aceptables, incluso cuando exista una alta cantidad de solicitudes concurrentes. |
| AC02 | Consistencia | Cuando varias transferencias intenten modificar simultáneamente un mismo saldo, el sistema debe controlar las operaciones para evitar saldos incorrectos o transferencias que excedan los fondos disponibles. |
| AC03 | Disponibilidad | El sistema debe permanecer operativo durante el procesamiento de compras y transferencias, permitiendo consultar saldos y estados de las operaciones cuando los servicios necesarios estén disponibles. |
| AC04 | Escalabilidad | El sistema debe permitir incrementar su capacidad de procesamiento ante un aumento de usuarios y solicitudes, sin afectar significativamente la integridad de las operaciones. |
| AC05 | Seguridad | Los datos de los usuarios, las credenciales y las operaciones financieras deben estar protegidos frente a accesos no autorizados y modificaciones indebidas. |
| AC06 | Mantenibilidad | El sistema debe estar organizado en componentes con responsabilidades definidas, de modo que permita realizar cambios y correcciones sin afectar innecesariamente otras funcionalidades. |

---

## Clasificación por categoría

| Categoría | Atributos |
|-----------|-----------|
| Operacionales | AC01 Rendimiento, AC03 Disponibilidad, AC04 Escalabilidad |
| De integridad de datos | AC02 Consistencia |
| De seguridad | AC05 Seguridad |
| De desarrollo | AC06 Mantenibilidad |

---

## Relación con las operaciones del sistema

| Operación | Atributos de calidad involucrados |
|-----------|-----------------------------------|
| Consulta de saldos | AC01, AC03, AC05 |
| Compra de criptomonedas | AC01, AC03, AC05 |
| Transferencia entre usuarios | AC01, AC02, AC03, AC05 |
| Retiro a billetera externa | AC02, AC03, AC05 |
| Registro de depósitos | AC02, AC03 |
| Supervisión administrativa | AC01, AC06 |
| Notificaciones | AC03, AC06 |