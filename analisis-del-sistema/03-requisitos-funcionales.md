# 03. Requisitos funcionales

## Objetivo

Definir las funciones que debe cumplir el sistema para satisfacer las necesidades de los usuarios y establecer su relación con las historias de usuario.

---

## 3.1. Requisitos funcionales

| ID | Requisito funcional |
|----|---------------------|
| RF01 | El sistema debe permitir el registro de usuarios y la autenticación mediante credenciales. |
| RF02 | El sistema debe permitir consultar el saldo disponible de cada criptomoneda asociada a la cuenta del usuario. |
| RF03 | El sistema debe permitir iniciar operaciones de compra de criptomonedas mediante una pasarela de pagos integrada y registrar su resultado. |
| RF04 | El sistema debe permitir transferir criptomonedas entre usuarios, verificando el saldo disponible y controlando la concurrencia para evitar inconsistencias. |
| RF05 | El sistema debe registrar las operaciones realizadas y permitir consultar su historial y estado. |
| RF06 | El sistema debe permitir al administrador consultar, gestionar y actualizar el estado de las cuentas de los usuarios. |
| RF07 | El sistema debe permitir al administrador consultar los registros de las operaciones realizadas en la plataforma. |
| RF08 | El sistema debe generar notificaciones sobre el estado de las compras y transferencias realizadas por los usuarios. |
| RF09 | El sistema debe permitir iniciar retiros de criptomonedas hacia direcciones externas compatibles, mediante la integración con el proveedor seleccionado. |
| RF10 | El sistema debe permitir registrar y consultar los depósitos de criptomonedas recibidos, verificando su estado mediante el proveedor o la red blockchain correspondiente. |

---

## 3.2. Matriz de trazabilidad entre historias de usuario y requisitos funcionales

La siguiente tabla relaciona cada historia de usuario con los requisitos funcionales que permiten satisfacerla.

| Historia de usuario | Requisitos funcionales asociados |
|---------------------|----------------------------------|
| HU01 | RF01 |
| HU02 | RF02 |
| HU03 | RF03 |
| HU04 | RF04 |
| HU05 | RF05 |
| HU06 | RF06 |
| HU07 | RF07 |
| HU08 | RF08 |
| HU09 | RF09 |
| HU10 | RF10 |