#  Actores del sistema

## Objetivo

Determinar quiénes interactúan con el sistema y qué necesitan realizar.

---

## Actores identificados

| Actor | ¿Qué necesita realizar? |
|-------|-------------------------|
| Usuario | Registrarse, iniciar sesión, consultar sus saldos, comprar criptomonedas, transferirlas a otros usuarios y consultar el historial de sus operaciones. |
| Administrador | Administrar las cuentas de usuario, supervisar las operaciones, consultar registros y gestionar la configuración general del sistema. |
| Pasarela de pagos | Procesar los pagos realizados por los usuarios para la compra de criptomonedas y comunicar el resultado de las operaciones. |
| Proveedor de servicios de criptomonedas | Proporcionar los servicios necesarios para adquirir, consultar y transferir criptomonedas reales mediante una API. |
| Red blockchain | Validar y registrar las transacciones de criptomonedas que se realizan en la cadena de bloques. |
| Servicio de notificaciones | Enviar notificaciones a los usuarios sobre el estado de sus compras y transferencias. |

---

## Clasificación de actores

| Tipo | Actores |
|------|---------|
| Usuarios humanos | Usuario, Administrador |
| Sistemas externos | Pasarela de pagos, Proveedor de servicios de criptomonedas, Red blockchain, Servicio de notificaciones |

---

## Descripción breve por actor

**Usuario.** Persona registrada en la plataforma que gestiona su cuenta, consulta saldos, compra criptomonedas, realiza transferencias y revisa el historial de sus operaciones.

**Administrador.** Responsable de la operación de la plataforma, gestiona cuentas, supervisa las transacciones y ajusta la configuración general del sistema.

**Pasarela de pagos.** Servicio externo que procesa los pagos asociados a la compra de criptomonedas y devuelve el resultado de cada operación.

**Proveedor de servicios de criptomonedas.** Servicio externo que permite adquirir, consultar y transferir criptomonedas reales mediante una API.

**Red blockchain.** Infraestructura externa que valida y registra las transacciones dentro de la cadena de bloques.

**Servicio de notificaciones.** Servicio externo que informa al usuario sobre el estado de sus compras y transferencias.

---

## Nota

Los proveedores externos definitivos se determinarán durante el diseño técnico, según la compatibilidad con las criptomonedas seleccionadas y las condiciones de integración.