# Nivel 3 · Diagrama de componentes

> **Proyecto:** Flexcoin · **Contenedor detallado:** API Flexcoin  
> **Modelo:** C4 · Nivel 3 de 4 · **Versión:** 1.0

---

## 1. Objetivo

Abrir el contenedor **API Flexcoin** del nivel 2 y mostrar sus **componentes**: los módulos del monolito modular, la responsabilidad de cada uno y cómo se relacionan entre sí y con la base de datos, la caché y los sistemas externos.

| Aspecto | Descripción |
|---|---|
| Pregunta que responde | ¿Cómo se divide el backend por dentro y qué hace cada parte? |
| Audiencia | Arquitectos y desarrolladores |
| Qué es un componente | Un grupo de funcionalidades con una responsabilidad clara, accesible mediante una interfaz. En este proyecto, cada **módulo** del monolito es un componente |
| Nivel anterior | `Nivel2-DiagramadeContenedores.md` |
| Siguiente nivel | `Nivel4-DiagramadeCodigo.md` |

---

## 2. Diagrama

```mermaid
flowchart TB
    WebApp["🖥️ Aplicación web<br/>[Contenedor: SPA - Angular]"]

    subgraph API ["API Flexcoin [Contenedor: Node.js + Express · monolito modular]"]
        APIRest["API REST<br/>[Componente: rutas + middlewares]<br/>Expone /api/v1, autentica JWT<br/>y valida la entrada"]

        subgraph Modulos ["Módulos de negocio"]
            ModUsr["Usuarios<br/>[Componente: módulo]<br/>Registro, autenticación y roles"]
            ModSal["Saldos<br/>[Componente: módulo]<br/>Consulta y actualización de saldos"]
            ModCom["Compras<br/>[Componente: módulo]<br/>Órdenes de compra y confirmación"]
            ModTrans["Transferencias<br/>[Componente: módulo]<br/>Movimientos entre usuarios"]
            ModOp["Operaciones<br/>[Componente: módulo]<br/>Historial, retiros y depósitos"]
            ModConc["Control de concurrencia<br/>[Componente: módulo transversal]<br/>Bloqueo y serialización de saldos"]
            ModPag["Pagos<br/>[Componente: módulo]<br/>Cobro mediante la pasarela"]
            ModNot["Notificaciones<br/>[Componente: módulo]<br/>Avisa estado de operaciones"]
        end
    end

    Cache[("⚡ Caché<br/>[Contenedor: Redis]<br/>Saldos de consulta frecuente")]
    DB[("🗄️ Base de datos<br/>[Contenedor: PostgreSQL]<br/>Usuarios, saldos, operaciones y transferencias")]

    Pasarela["💳 Pasarela de pago<br/>[Sistema externo]"]
    Proveedor["🪙 Proveedor de criptomonedas<br/>[Sistema externo]"]
    Blockchain["⛓️ Red blockchain<br/>[Sistema externo]"]

    WebApp -->|Llama a la API HTTPS/JSON| APIRest

    APIRest -->|Invoca casos de uso| ModUsr
    APIRest -->|Invoca casos de uso| ModSal
    APIRest -->|Invoca casos de uso| ModCom
    APIRest -->|Invoca casos de uso| ModTrans
    APIRest -->|Invoca casos de uso| ModOp

    ModUsr -.->|Valida cuenta| ModSal
    ModSal -.->|Verifica fondos| ModCom
    ModSal -.->|Verifica fondos| ModTrans

    ModCom -.->|Acredita criptomonedas| ModSal
    ModCom -.->|Solicita cobro| ModPag
    ModCom -.->|Registra on-chain| Blockchain

    ModTrans -.->|Actualiza saldos| ModSal
    ModTrans -.->|Ejecuta transferencia| Proveedor
    ModTrans -.->|Registra on-chain| Blockchain

    ModOp -.->|Consulta movimientos| ModSal

    ModSal -.->|Solicita bloqueo| ModConc
    ModCom -.->|Solicita bloqueo| ModConc
    ModTrans -.->|Solicita bloqueo| ModConc

    ModPag -->|Cobra HTTPS/REST| Pasarela

    ModCom -.->|Publica cambio de estado| ModNot
    ModTrans -.->|Publica cambio de estado| ModNot

    ModSal -->|Cachea saldos TCP| Cache

    Modulos -.->|Cada módulo lee y escribe sus tablas SQL| DB

    style WebApp fill:#2e86de,stroke:#1b4f72,color:#ffffff
    style APIRest fill:#5dade2,stroke:#1b4f72,color:#000000
    style ModUsr fill:#aed6f1,stroke:#1b4f72,color:#000000
    style ModSal fill:#aed6f1,stroke:#1b4f72,color:#000000
    style ModCom fill:#aed6f1,stroke:#1b4f72,color:#000000
    style ModTrans fill:#aed6f1,stroke:#1b4f72,color:#000000
    style ModOp fill:#aed6f1,stroke:#1b4f72,color:#000000
    style ModConc fill:#f5b7b1,stroke:#922b21,color:#000000
    style ModPag fill:#aed6f1,stroke:#1b4f72,color:#000000
    style ModNot fill:#aed6f1,stroke:#1b4f72,color:#000000
    style Cache fill:#d5dbdb,stroke:#566573,color:#000000
    style DB fill:#d5dbdb,stroke:#566573,color:#000000
    style Pasarela fill:#bdc3c7,stroke:#2c3e50,color:#000000
    style Proveedor fill:#bdc3c7,stroke:#2c3e50,color:#000000
    style Blockchain fill:#bdc3c7,stroke:#2c3e50,color:#000000
```

---

## 3. Componentes

| Componente | Responsabilidad | Funcionalidades principales | Carpeta en el código |
|---|---|---|---|
| **API REST** | Punto de entrada HTTP del contenedor | Rutas `/api/v1`, autenticación JWT, validación de la entrada, manejo de errores | `src/api/` |
| **Usuarios** | Identidad y acceso | Registro, inicio de sesión, roles (usuario, administrador) | `src/modules/usuarios/` |
| **Saldos** | Estado de las cuentas | Consulta y actualización de los saldos de criptomonedas | `src/modules/saldos/` |
| **Compras** | Adquisición de criptomonedas | Órdenes de compra y confirmación con la pasarela | `src/modules/compras/` |
| **Transferencias** | Movimientos entre usuarios | Transferencias de criptomonedas entre cuentas | `src/modules/transferencias/` |
| **Operaciones** | Historial y movimientos externos | Historial, retiros y depósitos | `src/modules/operaciones/` |
| **Control de concurrencia** | Coordinación de saldos | Bloqueo y serialización de operaciones que modifican saldos | `src/modules/control-concurrencia/` |
| **Pagos** | Cobros | Cobro mediante la pasarela de pago | `src/modules/pagos/` |
| **Notificaciones** | Comunicación con el usuario | Avisar el estado de las operaciones | `src/modules/notificaciones/` |

---

## 4. Relaciones entre componentes

| Origen | Destino | Descripción | Tipo de comunicación |
|---|---|---|---|
| Aplicación web | API REST | Llama a la API | HTTPS/JSON |
| API REST | Módulos de negocio | Invoca los casos de uso | Llamada en memoria |
| Usuarios | Saldos | Valida la cuenta antes de operar | Llamada en memoria (API pública del módulo) |
| Saldos | Compras | Verifica fondos disponibles | Llamada en memoria |
| Saldos | Transferencias | Verifica fondos disponibles | Llamada en memoria |
| Compras | Saldos | Acredita criptomonedas tras confirmar el cobro | Llamada en memoria |
| Compras | Pagos | Solicita el cobro | Llamada en memoria |
| Transferencias | Saldos | Actualiza saldos origen y destino | Llamada en memoria |
| Operaciones | Saldos | Consulta movimientos para el historial | Llamada en memoria |
| Saldos, Compras, Transferencias | Control de concurrencia | Solicita bloqueo antes de modificar un saldo | Llamada en memoria |
| Compras, Transferencias | Notificaciones | Publica el cambio de estado | Evento en memoria |

---

## 5. Relaciones con contenedores y sistemas externos

| Componente | Destino | Descripción | Protocolo | Patrón aplicado |
|---|---|---|---|---|
| Todos los módulos | Base de datos (PostgreSQL) | Cada módulo lee y escribe **solo sus propias tablas** | SQL | Repository |
| Saldos | Caché (Redis) | Guarda y lee saldos en memoria | TCP | Decorator |
| Pagos | Pasarela de pago | Cobra | HTTPS/REST | Adapter |
| Compras, Transferencias | Proveedor de criptomonedas | Ejecuta la operación sobre criptomonedas reales | HTTPS/REST | Adapter |
| Compras, Transferencias | Red blockchain | Registra la transacción on-chain | HTTPS/REST | Adapter |
| Notificaciones | Servicio de notificaciones | Envía el aviso al usuario | HTTPS/REST | Adapter |

---

## 6. Reglas del monolito modular

| # | Regla | Motivo |
|---|---|---|
| 1 | Todos los componentes se despliegan juntos en el contenedor API Flexcoin | Es un monolito: un solo proceso y un solo despliegue |
| 2 | Un módulo usa a otro solo a través de su API pública (`index.ts`) | Evita que un cambio interno en un módulo rompa a los demás |
| 3 | Un módulo no lee ni escribe las tablas de otro módulo | Mantiene la independencia de los datos de cada módulo |
| 4 | Cada sistema externo se integra en un único módulo | La integración queda en un solo lugar y es fácil de reemplazar |
| 5 | El control de concurrencia es transversal | Ningún módulo modifica saldos sin solicitar bloqueo |
| 6 | Cada módulo se organiza por dentro con Clean Architecture | Las reglas de negocio no dependen de la tecnología (ver nivel 4) |