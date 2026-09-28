# 07. Arquitectura inicial

## Objetivo

Organizar los módulos identificados dentro de una primera propuesta de arquitectura, utilizando una arquitectura de tres capas.

---

## 7.1. Arquitectura de tres capas

```mermaid
flowchart TD
    subgraph Presentacion["PRESENTACIÓN"]
        P[Interfaz web / API]
    end

    subgraph Negocio["LÓGICA DE NEGOCIO"]
        N1[Usuarios]
        N2[Gestión de saldos]
        N3[Compras]
        N4[Transferencias]
        N5[Depósitos]
        N6[Retiros]
        N7[Historial]
        N8[Control de concurrencia]
    end

    subgraph Datos["DATOS"]
        D[(Base de datos<br/>Usuarios, saldos y operaciones)]
    end

    subgraph Externos["SERVICIOS EXTERNOS"]
        E1[Pasarela de pagos]
        E2[Proveedor de criptomonedas]
        E3[Red blockchain]
    end

    P --> N1
    P --> N2
    P --> N3
    P --> N4
    P --> N5
    P --> N6
    P --> N7
    P --> N8

    N1 --> D
    N2 --> D
    N3 --> D
    N4 --> D
    N5 --> D
    N6 --> D
    N7 --> D
    N8 --> D

    N3 --> E1
    N3 --> E2
    N4 --> E2
    N4 --> E3
    N6 --> E2
    N6 --> E3
```

---

## 7.2. Descripción de las capas

| Capa | Pregunta que responde | Función |
|------|-----------------------|---------|
| Presentación | ¿Cómo interactúa el usuario? | Proporciona la interfaz web y la comunicación mediante API REST. |
| Lógica de negocio | ¿Qué hace el sistema? | Gestiona usuarios, saldos, compras, transferencias y control de concurrencia. |
| Datos | ¿Dónde se almacena la información? | Almacena los usuarios, saldos, operaciones e historial de transacciones. |

---

## 7.3. Diagrama de arquitectura por capas
![Arquitectura por capas](../graphics/arquitectura-capas.jpg)
