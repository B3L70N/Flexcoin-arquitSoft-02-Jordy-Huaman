# Necesidad del Negocio

## Objetivo

Describir el problema o necesidad que da origen al sistema Flexcoin, antes de entrar al análisis funcional y arquitectónico.

---

## Contexto

Flexcoin es una plataforma académica que busca ofrecer servicios de compra, venta y transferencia de criptomonedas a través de una aplicación web. La idea es que los usuarios puedan gestionar sus activos digitales desde un solo lugar, con operaciones controladas y seguras.

El caso toma como referencia el incidente de Flexcoin en 2014, cuando la plataforma sufrió un ataque que vació su hot wallet por no controlar adecuadamente las operaciones concurrentes. Ese antecedente marca el eje del proyecto actual, que prioriza la consistencia y el control de concurrencia.

---

## Problema a resolver

La plataforma debe permitir a los usuarios:

- Gestionar sus cuentas y consultar sus saldos de criptomonedas.
- Comprar criptomonedas mediante una pasarela de pagos.
- Transferir criptomonedas a otros usuarios.
- Retirar criptomonedas hacia direcciones externas.
- Consultar el historial de sus operaciones.

Y debe hacerlo garantizando que **las operaciones concurrentes no generen inconsistencias en los saldos**, que fue justamente lo que provocó el colapso de la plataforma original.

---

## Necesidad arquitectónica

El sistema requiere una arquitectura que:

- Separe las reglas de negocio de los detalles tecnológicos.
- Controle las operaciones concurrentes que modifican saldos.
- Se integre de forma desacoplada con servicios externos como la pasarela de pagos, el proveedor de criptomonedas y la red blockchain.
- Sea mantenible y evolutiva, dado que es un proyecto académico que puede crecer.

---

## Justificación del proyecto

Flexcoin no busca reinventar una plataforma de criptomonedas, sino demostrar que las decisiones arquitectónicas correctas pueden evitar fallos como el de 2014. El valor del proyecto está en el análisis y las decisiones, no en la implementación.