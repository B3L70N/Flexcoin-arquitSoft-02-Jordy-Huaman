# 03. Requisitos funcionales

## Objetivo

Identificar las funcionalidades que el sistema debe proporcionar a partir de las historias de usuario definidas.

---

## Listado de requisitos funcionales

| ID | Requisito funcional |
|----|---------------------|
| RF01 | El sistema debe permitir registrar usuarios e iniciar sesión mediante un mecanismo de autenticación. |
| RF02 | El sistema debe permitir consultar los saldos disponibles de criptomonedas asociados a la cuenta del usuario. |
| RF03 | El sistema debe permitir iniciar operaciones de compra de criptomonedas mediante una pasarela de pagos integrada. |
| RF04 | El sistema debe permitir acreditar criptomonedas en la cuenta del usuario tras confirmar el resultado de la compra. |
| RF05 | El sistema debe permitir realizar transferencias de criptomonedas entre usuarios registrados. |
| RF06 | El sistema debe controlar la concurrencia de las operaciones que modifican los saldos, evitando actualizaciones inconsistentes. |
| RF07 | El sistema debe permitir consultar el historial de operaciones y sus respectivos estados. |
| RF08 | El sistema debe permitir registrar, actualizar y desactivar cuentas de usuario mediante las funciones administrativas autorizadas. |
| RF09 | El sistema debe permitir consultar los registros de las operaciones realizadas para su supervisión administrativa. |
| RF10 | El sistema debe permitir enviar notificaciones sobre el estado de las compras y transferencias realizadas. |
| RF11 | El sistema debe permitir solicitar retiros de criptomonedas hacia direcciones externas compatibles. |
| RF12 | El sistema debe permitir registrar y consultar los depósitos de criptomonedas recibidos, así como su estado de confirmación. |

---

## Relación entre historias de usuario y requisitos funcionales

| Historia de usuario | Requisitos funcionales relacionados |
|---------------------|-------------------------------------|
| HU01 (Registro e inicio de sesión) | RF01 |
| HU02 (Consultar saldo) | RF02 |
| HU03 (Comprar criptomonedas) | RF03, RF04 |
| HU04 (Transferir criptomonedas) | RF05, RF06 |
| HU05 (Consultar historial) | RF07 |
| HU06 (Gestionar cuentas de usuarios) | RF08 |
| HU07 (Supervisar operaciones) | RF09 |
| HU08 (Recibir notificaciones) | RF10 |
| HU09 (Retirar criptomonedas) | RF11 |
| HU10 (Consultar depósitos) | RF12 |

---

## Clasificación por módulo funcional

| Módulo | Requisitos asociados |
|--------|----------------------|
| Autenticación y cuentas | RF01, RF08 |
| Gestión de saldos | RF02, RF04, RF06 |
| Compra de criptomonedas | RF03, RF04 |
| Transferencias | RF05, RF06 |
| Historial y supervisión | RF07, RF09 |
| Notificaciones | RF10 |
| Retiros | RF11 |
| Depósitos | RF12 |