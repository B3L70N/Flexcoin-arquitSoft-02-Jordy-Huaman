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

---

## Descripción de cada decisión

### ADR001 - Arquitectura en capas

**Decisión.** Organizar el sistema en tres capas: Presentación, Lógica de negocio y Datos.

**Justificación.** El driver DA06 (Mantenibilidad) exige que los cambios en una parte del sistema no obliguen a modificar otras. La separación por capas permite esa independencia y facilita el mantenimiento.

**Resultado.** Capas de Presentación, Lógica de negocio y Datos.

---

### ADR002 - Integridad transaccional del libro de saldos

**Decisión.** Aplicar las transferencias internas mediante una operación transaccional del almacenamiento autoritativo. La operación debe comprobar los fondos disponibles y registrar conjuntamente el débito, el crédito y la transferencia. La base de datos concreta y la técnica de concurrencia quedan sujetas a evaluación.

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
- Los activos digitales, la pasarela peruana, la base de datos, el caché y la política de promoción a producción siguen por definir.