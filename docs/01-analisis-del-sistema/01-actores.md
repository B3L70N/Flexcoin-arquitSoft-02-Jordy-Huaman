#  Actores del sistema

## Objetivo

Determinar quiénes interactúan con el sistema y qué necesitan realizar.

---

## Actores identificados

| Actor | ¿Qué necesita realizar? |
|-------|-------------------------|
| Usuario en Perú | Registrarse, iniciar sesión, consultar sus saldos, comprar activos, transferirlos internamente, solicitar retiros externos y consultar el historial de sus operaciones. |
| Administrador | Administrar las cuentas de usuario, supervisar las operaciones, consultar registros y gestionar la configuración general del sistema. |
| Pasarela de pagos | Procesar los pagos realizados por los usuarios para la compra de criptomonedas y comunicar el resultado de las operaciones. |
| Proveedor custodial de criptomonedas | Mantener los fondos agrupados del modelo objetivo y proporcionar, mediante API, servicios de consulta, adquisición y retiros externos. En la fase académica se simula. |
| Red blockchain | Liquidar los retiros externos cuando el proveedor custodial los envía a la cadena; QuillaCoin no se integra directamente en la fase académica. |
| Servicio de notificaciones | Enviar notificaciones a los usuarios sobre el estado de sus compras, transferencias internas y retiros. |

---

## Clasificación de actores

| Tipo | Actores |
|------|---------|
| Usuarios humanos | Usuario en Perú, Administrador |
| Sistemas externos | Pasarela de pagos, Proveedor custodial de criptomonedas, Red blockchain (integrada por el proveedor), Servicio de notificaciones |

---

## Descripción breve por actor

**Usuario.** Persona ubicada en Perú y registrada en la plataforma que consulta saldos, compra activos mediante medios locales disponibles, realiza transferencias internas, solicita retiros externos y revisa su historial.

**Administrador.** Responsable de la operación de la plataforma, gestiona cuentas, supervisa las transacciones y ajusta la configuración general del sistema.

**Pasarela de pagos.** Servicio externo que procesa los pagos asociados a la compra de criptomonedas y devuelve el resultado de cada operación.

**Proveedor custodial de criptomonedas.** Servicio externo que, en el modelo objetivo, mantiene fondos agrupados y ofrece operaciones mediante API. Su selección y sus condiciones para uso en Perú están pendientes; en la fase académica se representa con un adaptador simulado.

**Red blockchain.** Infraestructura que valida y registra las operaciones on-chain originadas por el proveedor al procesar retiros externos; no interviene en las transferencias internas de QuillaCoin.

**Servicio de notificaciones.** Servicio externo que informa al usuario sobre el estado de sus compras, transferencias internas y retiros.

---

## Nota

Los proveedores externos definitivos se determinarán durante el diseño técnico, según la compatibilidad con las criptomonedas seleccionadas y las condiciones de integración.