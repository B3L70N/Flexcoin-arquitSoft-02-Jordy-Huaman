# Drivers arquitectónicos

## Objetivo

Integrar los elementos identificados y determinar cuáles influyen significativamente en las decisiones de arquitectura.

---

## Drivers arquitectónicos identificados

| ID | Driver arquitectónico | Origen | ¿Por qué influye en la arquitectura? |
|----|-----------------------|--------|--------------------------------------|
| DA01 | El sistema debe controlar las operaciones concurrentes que modifican los saldos. | AC02 (Consistencia) | Condiciona el procesamiento de transferencias y la gestión de datos. |
| DA02 | El sistema debe mantener tiempos de respuesta adecuados ante solicitudes concurrentes. | AC01 (Rendimiento) | Influye en el procesamiento y la comunicación entre componentes. |
| DA03 | El sistema debe proteger los datos de los usuarios y las operaciones. | AC05 (Seguridad) | Condiciona los mecanismos de autenticación y autorización. |
| DA04 | El sistema debe integrarse con una pasarela de pagos y un proveedor de criptomonedas. | RC04 (Servicios externos) | Condiciona la comunicación con los servicios externos. |
| DA05 | El sistema debe utilizar una API REST para la comunicación entre frontend y backend. | RC03 (API REST) | Define el mecanismo de comunicación entre las capas del sistema. |
| DA06 | El sistema debe permitir modificar funcionalidades sin afectar innecesariamente otros módulos. | AC06 (Mantenibilidad) | Favorece una arquitectura en capas con bajo acoplamiento y responsabilidades bien definidas. |
| DA07 | El libro interno de saldos debe mantenerse consistente con los movimientos y poder reconciliarse con el proveedor custodial. | RC08 (Modelo de saldos y custodia) | Define el registro autoritativo, los límites entre transferencias internas y retiros externos y el tratamiento de fallos de integración. |
| DA08 | El análisis de riesgo debe ejecutarse fuera de la ruta crítica mediante eventos durables y procesamiento asíncrono. | AC07 (Resiliencia asíncrona) | Evita que la latencia o falla del modelo afecte el resultado contable ya confirmado y requiere entrega/reintentos confiables. |
| DA09 | El chat y el análisis de riesgo deben proteger los datos y limitar la autoridad de la IA. | AC08, AC09 (Privacidad, supervisión y transparencia) | Exige autorización por usuario, minimización de datos, trazabilidad y revisión humana; el modelo no puede ejecutar movimientos ni bloqueos. |
| DA10 | La calidad del análisis de riesgo debe medirse y revisarse antes de utilizarlo como señal operativa. | AC10 (Efectividad evaluable) | Evita presentar resultados no validados como detección de fraude y requiere pruebas con datos etiquetados y control de cambios. |

---

## Clasificación de drivers

| Categoría | Drivers |
|-----------|---------|
| Atributos de calidad | DA01, DA02, DA03, DA06, DA08, DA09, DA10 |
| Restricciones | DA04, DA05, DA07 |

---

## Influencia de los drivers en la arquitectura

| Driver | Decisión arquitectónica asociada |
|--------|----------------------------------|
| DA01 Consistencia de saldos | Uso de transacciones controladas y mecanismos de bloqueo o serialización en las operaciones que modifican saldos. |
| DA02 Rendimiento | Diseño de componentes desacoplados, uso de caché para consultas de saldos y procesamiento asíncrono cuando sea posible. |
| DA03 Seguridad | Autenticación centralizada, autorización por roles y cifrado de datos sensibles. |
| DA04 Integración con servicios externos | Diseño de adaptadores para la pasarela de pagos y el proveedor de criptomonedas. |
| DA05 API REST | Definición de contratos REST entre frontend y backend, con endpoints claros para cada operación. |
| DA06 Mantenibilidad | Separación por capas y componentes con responsabilidades bien definidas, facilitando cambios sin afectar otras funcionalidades. |
| DA07 Libro y custodia | Mantener un libro interno auditable; ejecutar transferencias internas de manera atómica y reconciliar retiros externos con estados del proveedor. El caché no determina saldos disponibles. |
| DA08 Análisis asíncrono | Registrar eventos con el movimiento en el outbox transaccional y analizarlos en segundo plano con reintentos, deduplicación y aislamiento de fallos. |
| DA09 Uso responsable de IA | Tratar las respuestas y puntuaciones como asistencia/sugerencias; aplicar controles deterministas y decisiones humanas autorizadas para medidas sobre cuentas. Minimizar y proteger el contexto enviado a terceros. |
| DA10 Calidad del análisis | Medir precisión/recall y falsos positivos/negativos sobre datos etiquetados representativos; definir umbrales antes del uso operativo y reevaluar cambios o deriva. |

---

## Relación con las decisiones futuras

Los drivers identificados orientan las decisiones de arquitectura hacia un diseño por capas y componentes, con especial énfasis en la consistencia del libro, las integraciones externas, la privacidad y el procesamiento asíncrono supervisado de IA, además de la mantenibilidad. Durante el diseño técnico podrán precisarse metas de disponibilidad y escalabilidad.