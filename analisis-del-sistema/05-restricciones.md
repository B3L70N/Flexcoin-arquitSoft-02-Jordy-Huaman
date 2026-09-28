# Restricciones

## Objetivo

Identificar las restricciones que condicionan las decisiones de diseño y arquitectura del sistema.

---

## Restricciones identificadas

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RC01 | Aplicación web | El sistema debe ser accesible mediante un navegador web. |
| RC02 | Control de versiones | El código fuente debe gestionarse mediante Git y GitHub. |
| RC03 | API REST | La comunicación entre el frontend y el backend debe realizarse mediante una API REST. |
| RC04 | Servicios externos | El sistema debe integrarse con una pasarela de pagos y un proveedor de criptomonedas. |
| RC05 | Recursos disponibles | El desarrollo debe ajustarse al presupuesto y a la infraestructura disponibles. |

---

## Clasificación de restricciones

| Tipo | Restricciones |
|------|---------------|
| Técnicas | RC01, RC03 |
| De integración | RC04 |
| De gestión del proyecto | RC02, RC05 |

---

## Impacto de las restricciones en el diseño

| Restricción | Impacto principal |
|-------------|-------------------|
| RC01 Aplicación web | Define el tipo de cliente y condiciona la capa de presentación. |
| RC02 Control de versiones | Obliga a mantener el código en un repositorio remoto compartido. |
| RC03 API REST | Define el estilo de comunicación entre frontend y backend. |
| RC04 Servicios externos | Obliga a diseñar adaptadores para la pasarela de pagos y el proveedor de criptomonedas. |
| RC05 Recursos disponibles | Limita las tecnologías, el hosting y el nivel de infraestructura a utilizar. |
