# Decisiones Arquitectónicas (ADR)

## Objetivo

Documentar las decisiones arquitectónicas importantes tomadas durante el diseño de QuillaCoin, junto con su justificación y los drivers que las motivan.

ADR significa Architecture Decision Record (Registro de Decisión Arquitectónica).

---

## Listado de decisiones arquitectónicas

| ID | Decisión arquitectónica | Driver relacionado | Justificación | Resultado |
|----|-------------------------|--------------------|---------------|-----------|
| ADR001 | Arquitectura en capas | DA06 Mantenibilidad | Separar Presentación, Lógica de negocio y Datos permite modificar una capa sin afectar las demás. | Capas de Presentación, Lógica de negocio y Datos. |
| ADR002 | Integridad transaccional del libro de saldos | DA01 Consistencia | Los cambios de saldo deben comprobar fondos y registrar juntos los movimientos relacionados en el almacenamiento autoritativo. | Débito y crédito internos atómicos; sin depender de un bloqueo en memoria. |
| ADR003 | Estrategia de caché para consultas de saldos | DA02 Rendimiento | Reducir consultas repetitivas a la base de datos y mejorar los tiempos de respuesta bajo alta concurrencia. | Caché para consultas frecuentes de saldos. |
| ADR004 | Integración con pasarela de pagos y proveedor de criptomonedas mediante adaptadores | DA04 Servicios externos | Desacoplar los casos de uso de los proveedores externos permite sustituirlos sin afectar la lógica de negocio. | Contratos e interfaces de pago y criptomonedas con adaptadores específicos. |
| ADR005 | API REST como mecanismo de comunicación | DA05 API REST | La restricción RC03 exige que el frontend y el backend se comuniquen mediante una API REST. | Contratos REST entre frontend y backend. |
| ADR006 | Clean Architecture como enfoque interno | DA06 Mantenibilidad | Separar las reglas de negocio de los detalles tecnológicos facilita las pruebas y el mantenimiento. | Capas de Dominio, Aplicación, Infraestructura y Presentación. |
| ADR007 | Libro interno de saldos y fondos agrupados en un proveedor custodial | DA01 Consistencia, DA04 Servicios externos, DA07 Libro y custodia | El alcance académico debe demostrar movimientos internos consistentes sin operar fondos reales ni acoplar las reglas a un proveedor. | QuillaCoin mantiene el libro autoritativo; las transferencias internas son contables y atómicas; los retiros externos pasan por el proveedor y se reconcilian por estado. La primera fase simula proveedor y saldos en sandbox/testnet. |
| ADR008 | Asistencia conversacional y análisis de riesgo desacoplado | DA08 Resiliencia asíncrona, DA09 Uso responsable de IA, DA10 Calidad del análisis | La IA aporta asistencia y señales de riesgo sin introducir latencia o autoridad sobre el libro y las cuentas. | Chat acotado y separado; análisis asíncrono desde outbox durable; alertas no vinculantes, evaluadas y sujetas a revisión administrativa. |
| ADR009 | Autenticación de API con JWT y refresh rotatorio | DA03 Seguridad | La API REST y la SPA requieren autenticación interoperable y sesiones renovables con revocación. | Contraseña con Argon2id, JWT de acceso breve y refresh token rotatorio en cookie HttpOnly/Secure; secretos de refresh persistidos como hash. |
| ADR010 | PostgreSQL, libro inmutable y proyección transaccional de saldos | DA01 Consistencia, DA07 Libro y custodia | El libro requiere auditoría, idempotencia y débitos/créditos atómicos bajo concurrencia. | PostgreSQL como motor; hosting por decidir. Libro de doble partida inmutable y saldo disponible actualizado en la misma transacción; transferencias internas sin comisión e idempotentes. |

---

## Relación con los drivers arquitectónicos

| ADR | Driver | Tipo de driver |
|-----|--------|----------------|
| ADR001 | DA06 | Mantenibilidad |
| ADR002 | DA01 | Consistencia |
| ADR003 | DA02 | Rendimiento |
| ADR004 | DA04 | Servicios externos |
| ADR005 | DA05 | API REST |
| ADR006 | DA06 | Mantenibilidad |
| ADR007 | DA01, DA04, DA07 | Consistencia, integración y custodia |
| ADR008 | DA08, DA09, DA10 | Resiliencia, privacidad, trazabilidad, supervisión y efectividad |
| ADR009 | DA03 | Seguridad de autenticación y sesiones |
| ADR010 | DA01, DA07 | Integridad transaccional, auditoría e idempotencia |

---

## Descripción de cada decisión

### ADR001 - Arquitectura en capas

**Decisión.** Organizar el sistema en tres capas: Presentación, Lógica de negocio y Datos.

**Justificación.** El driver DA06 (Mantenibilidad) exige que los cambios en una parte del sistema no obliguen a modificar otras. La separación por capas permite esa independencia y facilita el mantenimiento.

**Resultado.** Capas de Presentación, Lógica de negocio y Datos.

---

### ADR002 - Integridad transaccional del libro de saldos

**Decisión.** Aplicar las transferencias internas mediante una operación transaccional del almacenamiento autoritativo. La operación debe comprobar los fondos disponibles y registrar conjuntamente el débito, el crédito y la transferencia. PostgreSQL queda elegido como motor; la técnica concreta de concurrencia se validará con pruebas.

**Justificación.** El driver DA01 (Consistencia) es crítico en QuillaCoin. Un bloqueo en memoria no coordina varias instancias y no sustituye la atomicidad del almacenamiento. El caso histórico de 2014 demuestra el riesgo de no controlar las operaciones concurrentes.

**Resultado.** El libro autoritativo impide sobregiros, duplicaciones y movimientos parciales mediante transacciones y restricciones compatibles con la base seleccionada.

---

### ADR003 - Estrategia de caché para consultas de saldos

**Decisión.** Incorporar caché para las consultas frecuentes de saldos.

**Justificación.** El driver DA02 (Rendimiento) exige tiempos de respuesta adecuados bajo alta concurrencia. Las consultas repetitivas pueden servirse desde una vista temporal de caché, reduciendo carga sin hacer del caché la fuente autoritativa del saldo ni usarlo para aprobar movimientos.

**Resultado.** Caché derivada para lecturas frecuentes; tecnología por seleccionar. La validación de fondos y la contabilización se realizan contra el libro de saldos.

---

### ADR004 - Integración con pasarela de pagos y proveedor de criptomonedas mediante adaptadores

**Decisión.** Integrar los servicios externos mediante contratos e interfaces, con adaptadores específicos para cada proveedor.

**Justificación.** El driver DA04 (Servicios externos) obliga a comunicarse con la pasarela de pagos y el proveedor de criptomonedas. Acoplar los casos de uso directamente a los SDK dificultaría cambiar de proveedor o simularlos en pruebas.

**Resultado.** Contratos e interfaces de pago y criptomonedas con adaptadores específicos.

---

### ADR005 - API REST como mecanismo de comunicación

**Decisión.** Usar API REST como único mecanismo de comunicación entre el frontend y el backend.

**Justificación.** La restricción RC03 (API REST) lo exige. Además, REST es un estándar ampliamente soportado y permite desacoplar el frontend del backend.

**Resultado.** Contratos REST entre frontend y backend.

---

### ADR006 - Clean Architecture como enfoque interno

**Decisión.** Aplicar los principios de Clean Architecture para organizar internamente el código.

**Justificación.** El driver DA06 (Mantenibilidad) exige que las reglas de negocio estén aisladas de los detalles tecnológicos. Clean Architecture garantiza esa separación mediante la regla de dependencias hacia el dominio.

**Resultado.** Capas de Dominio, Aplicación, Infraestructura y Presentación.

---

### ADR007 - Libro interno de saldos con fondos agrupados en un proveedor custodial

**Estado.** Aceptada para el modelo académico; la operación con activos reales queda fuera del alcance y requiere una decisión posterior.

**Decisión.** QuillaCoin mantiene un libro interno de saldos por usuario y activo. En el modelo objetivo, los fondos externos se mantienen agrupados bajo un proveedor custodial, sin que QuillaCoin guarde las claves privadas de los usuarios. En la primera fase, el proveedor y los movimientos se simulan en sandbox o testnet, sin dinero ni criptoactivos reales.

Una transferencia entre usuarios de QuillaCoin genera un débito y un crédito internos, registrados atómicamente en el libro; no invoca al proveedor ni crea una transacción blockchain. Un retiro externo es un flujo separado: se registra con un identificador idempotente y estados, se solicita al proveedor y se reconcilia con el resultado que este informe. El caché puede acelerar consultas, pero no es la fuente de verdad para fondos disponibles.

**Drivers.** DA01 (Consistencia), DA04 (Integración con servicios externos) y DA07 (Libro y custodia).

**Justificación.** Separar los movimientos internos de la liquidación externa reduce dependencias remotas dentro de la operación contable crítica y hace posible probar concurrencia sin fondos reales. El libro interno ofrece un registro propio y auditable, mientras que el proveedor abstrae la custodia externa.

**Consecuencias y pendientes.**

- Los débitos y créditos internos deben persistirse en una transacción atómica y evitar saldos negativos y operaciones duplicadas.
- Las solicitudes externas pueden tener resultados tardíos o inciertos; se requieren estados, reintentos idempotentes y reconciliación antes de considerarlas finales.
- No se ha seleccionado un proveedor. Antes de operar con fondos reales se deberán validar sus capacidades y condiciones para cuentas agrupadas, retiros y operación en Perú, además de los requisitos legales y regulatorios aplicables.
- Los activos digitales, la pasarela peruana, el hosting de PostgreSQL, el caché y la política de promoción a producción siguen por definir.

---

### ADR008 - Asistencia conversacional y análisis de riesgo desacoplado

**Estado.** Aceptada como dirección de diseño; proveedor de IA, cola y política de retención pendientes. No implica que estas capacidades estén implementadas.

**Decisión.** QuillaCoin ofrece un chat de asistencia a través del backend y una capacidad de análisis posterior de señales de operaciones. El chat solo responde preguntas sobre el uso de la plataforma y, si consulta datos de cuenta, lo hace mediante operaciones autorizadas del backend limitadas al usuario autenticado. No ejecuta transferencias, compras, retiros ni acciones administrativas.

Para análisis de riesgo, los eventos de negocio —inicialmente, las transferencias internas— se escriben en un outbox durable dentro de la misma transacción que confirma el movimiento correspondiente. Un worker los reclama y procesa fuera de la ruta HTTP y puede solicitar una evaluación a reglas deterministas o a un proveedor de IA. La salida genera una sugerencia/alerta para revisión, no una decisión financiera o de seguridad.

**Drivers.** DA08 (Análisis asíncrono), DA09 (Uso responsable de IA) y DA10 (Calidad del análisis).

**Justificación.** La generación de texto y los modelos externos tienen latencia, errores y resultados probabilísticos. Separarlos evita que una falla externa afecte la consistencia del libro, mientras que el outbox permite reintentar el análisis sin perder eventos confirmados.

**Consecuencias y restricciones.**

- La transferencia no espera al proveedor de IA. El evento debe ser durable, identificable y procesado de forma idempotente; los fallos deben reintentarse y quedar observables para su recuperación.
- La falta temporal del proveedor puede retrasar alertas, pero no alterar el resultado ya confirmado ni impedir las operaciones financieras.
- El modelo solo recibe señales minimizadas y autorizadas; no se envían credenciales, secretos ni información personal innecesaria. Deben evaluarse las condiciones de uso, retención y tratamiento de datos del proveedor antes de integrarlo.
- Las respuestas y puntuaciones deben conservar la referencia del evento y la versión de reglas/modelo. Una alerta no equivale a fraude confirmado.
- Solo un administrador autorizado puede revisar y resolver alertas. Cualquier suspensión o restricción se ejecuta mediante una acción separada, explícita y auditada; la IA no congela cuentas ni bloquea operaciones.
- El chat no es fuente de verdad ni canal para ejecutar transacciones. Si el proveedor no está disponible, se informa el fallo y se mantienen independientes las funciones principales.
- Inicialmente el worker puede reclamar eventos pendientes directamente desde el outbox; un broker externo solo se añade si los requisitos de escala lo justifican. La política de reintentos, retención y recuperación de eventos agotados queda por definir.
- Los umbrales de calidad, el historial conversacional y las políticas de retención quedan por definir antes de implementar. Los resultados se evalúan con datos etiquetados y no se presentan como detección cierta de fraude.

---

### ADR009 - Autenticación de API con JWT y refresh rotatorio

**Estado.** Aceptada para el backend inicial. Verificación de correo, recuperación de contraseña, expiración exacta y política de bloqueo por intentos requieren especificación antes de implementar esas funciones.

**Decisión.** Los usuarios se registran e inician sesión con correo y contraseña. La contraseña se almacena únicamente como hash Argon2id con parámetros vigentes y configurables. La API emite un JWT de acceso de vida corta para las llamadas autenticadas y renueva la sesión mediante refresh token rotatorio en cookie `HttpOnly`, `Secure` y con `SameSite` apropiado. Los refresh tokens se almacenan en forma de hash para permitir rotación, revocación y cierre de sesión.

El JWT de acceso se envía como Bearer y el frontend lo mantiene solo en memoria; no se guarda en `localStorage`. Las rutas de autenticación con cookie aplican protección CSRF adecuada al diseño de origen/CORS.

**Justificación.** La SPA puede consumir la API REST mediante tokens sin mantener una sesión de servidor para cada petición, mientras que la rotación y revocación limitan la exposición de sesiones largas.

**Consecuencias.**

- Los endpoints mínimos son `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` y `GET /api/v1/auth/me`.
- La identidad del usuario se obtiene del JWT validado por middleware; nunca se acepta un `userId` de origen financiero desde el cliente.
- Refresh tokens usados o revocados no pueden volver a utilizarse; la rotación debe detectar reutilización y revocar la sesión/token family correspondiente.
- Las respuestas de autenticación no deben revelar si un correo registrado existe, y se aplican límites a intentos de inicio de sesión.

---

### ADR010 - PostgreSQL, libro inmutable y proyección transaccional de saldos

**Estado.** Aceptada para el diseño del backend inicial. Proveedor/hosting de PostgreSQL, esquema final, nivel de aislamiento y estrategia operativa de copias de seguridad quedan pendientes.

**Decisión.** PostgreSQL es el motor relacional elegido. El libro registra movimientos inmutables de doble partida por activo; cada transferencia confirmada produce un débito y un crédito de igual magnitud. La proyección de saldo disponible se mantiene en una tabla de cuentas por usuario y activo y se actualiza en la misma transacción que la transferencia y sus apuntes contables. El hosting de la base se decidirá separadamente al comparar costo, respaldo, disponibilidad y operación.

Las cantidades se representan como unidades enteras mínimas del activo, nunca con coma flotante binaria. El contrato de transferencia no cobra comisión inicialmente, no permite transferirse a sí mismo y requiere que origen y destino sean cuentas activas del mismo activo. La identidad de origen proviene de la autenticación.

**Contrato HTTP inicial de transferencia.**

- `POST /api/v1/transferencias`, autenticado con Bearer JWT.
- `Idempotency-Key` obligatorio en el encabezado; el cuerpo contiene `destinoId`, `activo` y `montoUnidades` como cadena decimal entera positiva. El origen no viene en el cuerpo.
- En éxito responde `201 Created` con `transferenciaId`, estado y monto/activo registrados.
- Un reintento con la misma clave y la misma solicitud no crea otro movimiento y devuelve el resultado original. Reutilizar la clave con datos diferentes se rechaza con `409 Conflict`.
- Se rechazan solicitudes inválidas con `400`, no autenticadas con `401`, recursos inexistentes/no disponibles con respuesta controlada y fondos insuficientes con `409`; ningún rechazo deja movimientos parciales.

**Transacción lógica.** Validar y reservar idempotencia; bloquear/actualizar las cuentas de origen y destino en orden determinista; comprobar y debitar únicamente si el saldo alcanza; acreditar el destino; insertar transferencia y dos apuntes balanceados; insertar el evento del outbox; confirmar todo junto. El conflicto de clave, falta de fondos o cualquier fallo revierte todos los cambios. La restricción única de idempotencia y las escrituras condicionales/locks de PostgreSQL protegen ante solicitudes concurrentes; no se usan bloqueos en memoria.

**Consecuencias y pruebas obligatorias.**

- La fuente auditable son los apuntes inmutables; la proyección acelera consultas, pero debe reconciliarse con la suma del libro.
- Una corrección contable se hace mediante apuntes compensatorios, nunca editando o borrando movimientos confirmados.
- Cada transferencia debe producir apuntes cuyo total neto sea cero para el activo y actualizar ambos saldos y el outbox de forma atómica.
- Pruebas de integración deben cubrir transferencias concurrentes sobre un mismo origen, claves idempotentes repetidas/conflictivas, saldo insuficiente, fallos a mitad de transacción y consistencia entre apuntes y proyecciones.
- El manejo de una misma clave después de un rechazo determinista y los detalles numéricos de precisión/límites por activo deben fijarse en el contrato de API y catálogo de activos antes de implementar.