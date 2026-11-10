# Necesidad del Negocio

## Objetivo

Describir el problema o necesidad que da origen al sistema QuillaCoin, antes de entrar al análisis funcional y arquitectónico.

---

## Contexto

QuillaCoin es una plataforma académica orientada inicialmente a usuarios ubicados en Perú. El primer alcance se ejecutará en sandbox o testnet, sin pagos ni criptoactivos reales. Los medios de pago locales se evaluarán para operar en soles peruanos (PEN); los proveedores y activos digitales compatibles aún están por seleccionar.

El modelo objetivo usa un libro de saldos propio de QuillaCoin y fondos agrupados en una cuenta de un proveedor custodial. En la primera etapa ambos lados se simulan mediante adaptadores de sandbox; no se guardan claves privadas de usuarios en QuillaCoin. El caso toma como referencia el incidente de Flexcoin en 2014, que motiva priorizar la consistencia y el control de concurrencia.

---

## Problema a resolver

La plataforma debe permitir a los usuarios:

- Gestionar sus cuentas y consultar sus saldos de criptomonedas.
- Comprar criptomonedas mediante una pasarela de pagos.
- Transferir saldos entre usuarios de QuillaCoin mediante movimientos internos del libro de saldos, sin enviar una transacción a la blockchain.
- Solicitar retiros externos a direcciones compatibles mediante el proveedor, registrando y consultando el estado de cada solicitud.
- Consultar el historial de sus operaciones.
- Recibir asistencia conversacional para usar la plataforma y consultar únicamente su propia información autorizada.
- Identificar señales de actividad inusual después de registrar las operaciones, mediante un análisis asíncrono que genere alertas para revisión administrativa.

Y debe hacerlo garantizando que **las operaciones concurrentes no generen inconsistencias en los saldos**, que fue justamente lo que provocó el colapso de la plataforma original.

---

## Necesidad arquitectónica

La fase académica valida estos flujos con proveedores simulados, sin dinero ni criptoactivos reales. Cualquier paso posterior a operaciones reales requerirá seleccionar y validar proveedores, sus condiciones de uso y los requisitos aplicables en Perú.

El sistema requiere una arquitectura que:

- Separe las reglas de negocio de los detalles tecnológicos.
- Mantenga un libro de saldos auditable y aplique de forma atómica los débitos y créditos de las transferencias internas.
- Trate el libro de saldos como fuente de verdad; el caché solo será una vista temporal de lectura.
- Procese los retiros externos con estados, solicitudes idempotentes y reconciliación con el proveedor ante fallos o respuestas tardías.
- Mantenga el análisis de riesgo fuera de la ruta crítica: una IA lenta o indisponible no debe impedir ni revertir una transferencia confirmada.
- Proteja la privacidad y mantenga supervisión humana: el chat no ejecuta movimientos y las alertas de IA no bloquean cuentas automáticamente.
- Se integre de forma desacoplada con la pasarela peruana y el proveedor custodial, sin asumir una integración directa de QuillaCoin con la blockchain.
- Sea mantenible y evolutiva, dado que es un proyecto académico que puede crecer.

---

## Justificación del proyecto

QuillaCoin no busca reinventar una plataforma de criptomonedas, sino demostrar que las decisiones arquitectónicas correctas pueden evitar fallos como el de 2014. El valor del proyecto está en el análisis y las decisiones.