# Atributos de calidad

## Objetivo

Determinar cómo debe comportarse el sistema, además de las funcionalidades que debe proporcionar.

En QuillaCoin se consideran relevantes la consistencia y concurrencia del libro, el rendimiento, la disponibilidad, la seguridad, la privacidad, la mantenibilidad y la resiliencia y supervisión de las funciones de IA.

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
| AC07 | Resiliencia asíncrona | La indisponibilidad, demora o error del análisis de IA no debe impedir ni revertir una transferencia confirmada; los eventos pendientes deben poder reintentarse sin duplicar movimientos ni alertas. |
| AC08 | Privacidad | El chat y el análisis deben aplicar mínimo privilegio y minimización de datos; ningún usuario puede consultar datos de otro y no se envían credenciales, secretos ni datos personales innecesarios al proveedor de IA. |
| AC09 | Supervisión y transparencia | Las evaluaciones del modelo deben ser identificables como sugerencias, trazables a su evento y versión de modelo/reglas, y sujetas a revisión humana antes de cualquier medida sobre una cuenta. |
| AC10 | Efectividad evaluable | La calidad del análisis de riesgo debe probarse con datos etiquetados y revisarse ante cambios del modelo/reglas; no se presenta como detección confiable de fraude hasta acordar y cumplir umbrales medibles. |

---

## Clasificación por categoría

| Categoría | Atributos |
|-----------|-----------|
| Operacionales | AC01 Rendimiento, AC03 Disponibilidad, AC04 Escalabilidad |
| De integridad de datos | AC02 Consistencia |
| De seguridad y privacidad | AC05 Seguridad, AC08 Privacidad |
| De desarrollo y operación | AC06 Mantenibilidad, AC07 Resiliencia asíncrona, AC09 Supervisión y transparencia, AC10 Efectividad evaluable |

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
| Chat de asistencia | AC01, AC03, AC05, AC08, AC09 |
| Análisis de riesgo posterior a la operación | AC02, AC03, AC07, AC08, AC09, AC10 |