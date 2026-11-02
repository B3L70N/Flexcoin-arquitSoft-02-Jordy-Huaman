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
| RC06 | Ámbito geográfico | El alcance inicial se limita a usuarios y medios de pago disponibles en Perú; los pagos se expresan en soles peruanos (PEN). |
| RC07 | Entorno académico | La primera fase usa sandbox o testnet y proveedores simulados; no procesa dinero ni criptoactivos reales. |
| RC08 | Modelo de saldos y custodia | QuillaCoin mantiene el libro interno de saldos y el modelo objetivo agrupa los fondos en un proveedor custodial. La entidad proveedora y la viabilidad de producción están pendientes de validación. |
| RC09 | Despliegue y persistencia | Cloudflare es la plataforma objetivo. El runtime, la base de datos y el caché deben seleccionarse tras verificar soporte transaccional, consistencia y compatibilidad. |
| RC10 | Automatización | La integración y el despliegue continuo (CI/CD) deben automatizar las verificaciones y los despliegues acordados para cada entorno; la política de promoción a producción queda por definir. |

---

## Clasificación de restricciones

| Tipo | Restricciones |
|------|---------------|
| Técnicas | RC01, RC03, RC09, RC10 |
| De integración | RC04, RC08 |
| De alcance y operación | RC06, RC07 |
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
| RC06 Ámbito geográfico | Limita el primer alcance a Perú y requiere evaluar medios de pago locales en PEN. |
| RC07 Entorno académico | Exige separar simulación académica de cualquier futura operación con fondos reales. |
| RC08 Modelo de saldos y custodia | Requiere mantener un libro interno consistente, integrar al proveedor mediante su API y validar antes de producción que su servicio admita el modelo agrupado. |
| RC09 Despliegue y persistencia | Orienta el despliegue a Cloudflare, pero no predetermina una base de datos o caché hasta comprobar las garantías necesarias para el libro de saldos. |
| RC10 Automatización | Requiere pipeline CI/CD con verificaciones y despliegues automatizados, según una política de promoción aún por definir. |
