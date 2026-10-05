# Decisiones Arquitectónicas (ADR)

## Objetivo

Documentar las decisiones arquitectónicas importantes tomadas durante el diseño de Flexcoin, junto con su justificación y los drivers que las motivan.

ADR significa Architecture Decision Record (Registro de Decisión Arquitectónica).

---

## Listado de decisiones arquitectónicas

| ID | Decisión arquitectónica | Driver relacionado | Justificación | Resultado |
|----|-------------------------|--------------------|---------------|-----------|
| ADR001 | Arquitectura en capas | DA06 Mantenibilidad | Separar Presentación, Lógica de negocio y Datos permite modificar una capa sin afectar las demás. | Capas de Presentación, Lógica de negocio y Datos. |
| ADR002 | Control de concurrencia a nivel de dominio | DA01 Consistencia | Las operaciones que modifican saldos deben ejecutarse con transacciones controladas y bloqueo o serialización para evitar inconsistencias. | Módulo de gestión de saldos con control transaccional. |
| ADR003 | Estrategia de caché para consultas de saldos | DA02 Rendimiento | Reducir consultas repetitivas a la base de datos y mejorar los tiempos de respuesta bajo alta concurrencia. | Caché para consultas frecuentes de saldos. |
| ADR004 | Integración con pasarela de pagos y proveedor de criptomonedas mediante adaptadores | DA04 Servicios externos | Desacoplar los casos de uso de los proveedores externos permite sustituirlos sin afectar la lógica de negocio. | Contratos e interfaces de pago y criptomonedas con adaptadores específicos. |
| ADR005 | API REST como mecanismo de comunicación | DA05 API REST | La restricción RC03 exige que el frontend y el backend se comuniquen mediante una API REST. | Contratos REST entre frontend y backend. |
| ADR006 | Clean Architecture como enfoque interno | DA06 Mantenibilidad | Separar las reglas de negocio de los detalles tecnológicos facilita las pruebas y el mantenimiento. | Capas de Dominio, Aplicación, Infraestructura y Presentación. |

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

---

## Descripción de cada decisión

### ADR001 - Arquitectura en capas

**Decisión.** Organizar el sistema en tres capas: Presentación, Lógica de negocio y Datos.

**Justificación.** El driver DA06 (Mantenibilidad) exige que los cambios en una parte del sistema no obliguen a modificar otras. La separación por capas permite esa independencia y facilita el mantenimiento.

**Resultado.** Capas de Presentación, Lógica de negocio y Datos.

---

### ADR002 - Control de concurrencia a nivel de dominio

**Decisión.** Implementar el control de concurrencia dentro del módulo de gestión de saldos, usando transacciones controladas y mecanismos de bloqueo o serialización.

**Justificación.** El driver DA01 (Consistencia) es crítico en Flexcoin. Las operaciones concurrentes que modifican saldos pueden generar inconsistencias si no se controlan. El caso histórico de 2014 demuestra el riesgo de no atender este punto.

**Resultado.** Módulo de gestión de saldos con control transaccional.

---

### ADR003 - Estrategia de caché para consultas de saldos

**Decisión.** Incorporar caché para las consultas frecuentes de saldos.

**Justificación.** El driver DA02 (Rendimiento) exige tiempos de respuesta adecuados bajo alta concurrencia. Las consultas repetitivas a la base de datos se pueden resolver desde caché, reduciendo la carga.

**Resultado.** Caché para consultas frecuentes de saldos.

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