#  Requisitos funcionales

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
| RF05 | El sistema debe permitir transferir activos entre usuarios registrados mediante un débito y un crédito internos del libro de saldos, sin ejecutar un retiro al proveedor ni una transacción blockchain. |
| RF06 | El sistema debe aplicar atómicamente los movimientos del libro de saldos y controlar la concurrencia, evitando sobregiros, duplicaciones y saldos inconsistentes. |
| RF07 | El sistema debe permitir consultar el historial de operaciones y sus respectivos estados. |
| RF08 | El sistema debe permitir registrar, actualizar y desactivar cuentas de usuario mediante las funciones administrativas autorizadas. |
| RF09 | El sistema debe permitir consultar los registros de las operaciones realizadas para su supervisión administrativa. |
| RF10 | El sistema debe permitir enviar notificaciones sobre el estado de las compras, transferencias internas y retiros realizados. |
| RF11 | El sistema debe permitir solicitar retiros idempotentes a direcciones externas compatibles a través del proveedor custodial y consultar sus estados hasta conocer el resultado. |
| RF12 | El sistema debe permitir registrar y consultar depósitos externos y su estado de confirmación cuando esta integración esté disponible; en la fase académica, el flujo se simula. |
| RF13 | El sistema debe ofrecer un chat de asistencia que responda preguntas sobre el uso de QuillaCoin y, previa autenticación, consulte únicamente la información operativa a la que el usuario tenga permiso. El chat no ejecuta compras, transferencias, retiros ni cambios de seguridad. |
| RF14 | Al confirmar una transferencia interna, el sistema debe registrar un evento durable en la misma transacción del libro mediante un outbox, para que el análisis posterior no dependa de una publicación en memoria. |
| RF15 | Un worker asíncrono debe analizar eventos financieros durables —inicialmente, transferencias internas— mediante reglas y/o un proveedor de IA, y generar una alerta o evaluación de riesgo no vinculante para revisión; su indisponibilidad no debe revertir ni retrasar una transferencia ya confirmada. |
| RF16 | El sistema debe permitir al personal administrador autorizado revisar, clasificar y registrar la resolución de alertas de riesgo. Cualquier restricción de cuenta debe ejecutarse mediante el flujo administrativo existente, con autorización y auditoría, no por decisión autónoma del modelo. |

---

## Relación entre historias de usuario y requisitos funcionales

| Historia de usuario | Requisitos funcionales relacionados |
|---------------------|-------------------------------------|
| HU01 (Registro e inicio de sesión) | RF01 |
| HU02 (Consultar saldo) | RF02 |
| HU03 (Comprar criptomonedas) | RF03, RF04 |
| HU04 (Transferir criptomonedas) | RF05, RF06, RF14 |
| HU05 (Consultar historial) | RF07 |
| HU06 (Gestionar cuentas de usuarios) | RF08 |
| HU07 (Supervisar operaciones) | RF09 |
| HU08 (Recibir notificaciones) | RF10 |
| HU09 (Retirar criptomonedas) | RF11 |
| HU10 (Consultar depósitos) | RF12 |
| HU11 (Consultar al asistente) | RF13 |
| HU12 (Revisar alertas de riesgo) | RF15, RF16 |

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
| Asistencia conversacional | RF13 |
| Outbox y análisis de riesgo | RF14, RF15 |
| Revisión administrativa de alertas | RF16 |