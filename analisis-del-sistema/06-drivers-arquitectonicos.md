# 06. Drivers arquitectónicos

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

---

## Clasificación de drivers

| Categoría | Drivers |
|-----------|---------|
| Atributos de calidad | DA01, DA02, DA03 |
| Restricciones | DA04, DA05 |

---

## Influencia de los drivers en la arquitectura

| Driver | Decisión arquitectónica asociada |
|--------|----------------------------------|
| DA01 Consistencia de saldos | Uso de transacciones controladas y mecanismos de bloqueo o serialización en las operaciones que modifican saldos. |
| DA02 Rendimiento | Diseño de componentes desacoplados, uso de caché para consultas de saldos y procesamiento asíncrono cuando sea posible. |
| DA03 Seguridad | Autenticación centralizada, autorización por roles y cifrado de datos sensibles. |
| DA04 Integración con servicios externos | Diseño de adaptadores para la pasarela de pagos y el proveedor de criptomonedas. |
| DA05 API REST | Definición de contratos REST entre frontend y backend, con endpoints claros para cada operación. |

---

## Relación con las decisiones futuras

Los drivers identificados orientan las decisiones de arquitectura hacia un diseño por capas y componentes, con especial énfasis en el control de concurrencia y la integración con servicios externos. Durante el diseño técnico se podrán añadir otros drivers derivados de la disponibilidad, la escalabilidad y la mantenibilidad.