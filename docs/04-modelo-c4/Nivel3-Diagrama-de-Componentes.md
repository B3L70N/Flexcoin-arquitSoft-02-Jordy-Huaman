# Nivel 3 · Diagrama de componentes

> **Proyecto:** QuillaCoin · **Contenedor detallado:** API QuillaCoin<br>
> **Modelo:** C4 · Nivel 3 de 4 · **Versión:** 1.0

---

## 1. Objetivo

Abrir el contenedor **API QuillaCoin** del nivel 2 y mostrar sus **componentes**: los módulos del monolito modular, la responsabilidad de cada uno y cómo se relacionan entre sí y con la base de datos, la caché y los sistemas externos.

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

    subgraph API ["API QuillaCoin [Contenedor: Node.js + Express · monolito modular]"]
        APIRest["API REST<br/>[Componente: rutas + middlewares]<br/>Expone /api/v1, autentica JWT<br/>y valida la entrada"]

        subgraph Modulos ["Módulos de negocio"]
            ModUsr["Usuarios<br/>[Componente: módulo]<br/>Registro, autenticación y roles"]
            ModSal["Saldos y libro<br/>[Componente: módulo]<br/>Libro interno autoritativo y consulta de saldos"]
            ModCom["Compras<br/>[Componente: módulo]<br/>Órdenes de compra y confirmación"]
            ModTrans["Transferencias internas<br/>[Componente: módulo]<br/>Débito y crédito internos atómicos"]
            ModOp["Operaciones<br/>[Componente: módulo]<br/>Historial, retiros externos y depósitos"]
            ModConc["Integridad transaccional<br/>[Responsabilidad transversal]<br/>Consistencia aplicada por el almacenamiento"]
            ModPag["Pagos<br/>[Componente: módulo]<br/>Cobro mediante la pasarela"]
            ModNot["Notificaciones<br/>[Componente: módulo]<br/>Avisa estado de operaciones"]
            ModChat["Asistencia conversacional<br/>[Componente: módulo]<br/>Aplica permisos y limita consultas del chat"]
        end
    end

    Worker["🧠 Worker de análisis de riesgo<br/>[Proceso separado; runtime por definir]<br/>Consume eventos y crea alertas revisables"]
    Cache[("⚡ Caché<br/>[Contenedor: tecnología por definir]<br/>Vista temporal, no autoritativa")]
    DB[("🗄️ Base de datos transaccional<br/>[Contenedor: PostgreSQL; hosting por decidir]<br/>Libro, operaciones y outbox")]

    Pasarela["💳 Pasarela peruana<br/>[Sistema externo · por seleccionar]"]
    Proveedor["🪙 Proveedor custodial<br/>[Sistema externo · sandbox/testnet en la fase académica]"]
    IA["🤖 Proveedor de IA<br/>[Sistema externo opcional · por seleccionar]"]

    WebApp -->|Llama a la API HTTPS/JSON| APIRest

    APIRest -->|Invoca casos de uso| ModUsr
    APIRest -->|Invoca casos de uso| ModSal
    APIRest -->|Invoca casos de uso| ModCom
    APIRest -->|Invoca casos de uso| ModTrans
    APIRest -->|Invoca casos de uso| ModOp
    APIRest -->|Atiende preguntas autenticadas| ModChat

    ModUsr -.->|Valida cuenta| ModSal
    ModSal -.->|Verifica fondos| ModCom
    ModSal -.->|Verifica fondos antes del movimiento| ModTrans

    ModCom -.->|Registra crédito tras confirmar el flujo simulado| ModSal
    ModCom -.->|Solicita cobro| ModPag
    ModCom -.->|Solicita adquisición de cripto| Proveedor

    ModTrans -->|Registra débito y crédito atómicos| ModSal
    ModChat -->|Envía solo contexto autorizado y minimizado| IA

    ModOp -.->|Consulta movimientos| ModSal
    ModOp -.->|Solicita retiro externo y consulta estado| Proveedor

    ModSal -.->|Persiste el libro en una transacción| ModConc
    ModCom -.->|Acredita resultados en una transacción| ModConc
    ModTrans -.->|Mueve saldos en una transacción| ModConc

    ModPag -->|Cobra HTTPS/REST| Pasarela

    ModCom -.->|Publica cambio de estado| ModNot
    ModTrans -.->|Publica cambio de estado| ModNot
    ModTrans -->|Solicita transferencia y evento de riesgo| ModSal
    DB -->|Outbox durable; worker reclama y reintenta eventos| Worker
    Worker -->|Solicita evaluación minimizada| IA
    Worker -->|Persiste alerta y estado de revisión| DB

    ModSal -->|Actualiza vista de lectura derivada| Cache

    ModSal -->|Registra libro y evento outbox en la misma transacción| DB
    Modulos -.->|Usan sus repositorios; el libro es propiedad de Saldos| DB

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
    style ModChat fill:#aed6f1,stroke:#1b4f72,color:#000000
    style Worker fill:#d2b4de,stroke:#512e5f,color:#000000
    style Cache fill:#d5dbdb,stroke:#566573,color:#000000
    style DB fill:#d5dbdb,stroke:#566573,color:#000000
    style Pasarela fill:#bdc3c7,stroke:#2c3e50,color:#000000
    style Proveedor fill:#bdc3c7,stroke:#2c3e50,color:#000000
    style IA fill:#bdc3c7,stroke:#2c3e50,color:#000000
```

---

## 3. Componentes

| Componente | Responsabilidad | Funcionalidades principales | Carpeta en el código |
|---|---|---|---|
| **API REST** | Punto de entrada HTTP del contenedor | Rutas `/api/v1`, autenticación JWT, validación de la entrada, manejo de errores | `src/api/` |
| **Usuarios** | Identidad y acceso | Registro, inicio de sesión, roles (usuario, administrador) | `src/modules/usuarios/` |
| **Saldos y libro** | Fuente de verdad de los saldos internos | Registra movimientos y expone saldos derivados del libro | `src/modules/saldos/` |
| **Compras** | Adquisición de criptomonedas | Órdenes de compra y confirmación con la pasarela | `src/modules/compras/` |
| **Transferencias** | Movimientos internos | Débito y crédito atómicos entre usuarios; no invoca proveedor ni blockchain | `src/modules/transferencias/` |
| **Operaciones** | Historial y movimientos externos | Historial, retiros con estados y depósitos simulados en la fase académica | `src/modules/operaciones/` |
| **Integridad transaccional** | Integridad del libro | Garantías de concurrencia y prevención de doble gasto mediante el almacenamiento autoritativo; no requiere un bloqueo en memoria | Responsabilidad transversal de Saldos y los repositorios |
| **Pagos** | Cobros | Cobro mediante la pasarela de pago | `src/modules/pagos/` |
| **Notificaciones** | Comunicación con el usuario | Avisar el estado de las operaciones | `src/modules/notificaciones/` |
| **Asistencia conversacional** | Atención al usuario | Responder preguntas del producto y consultar datos propios autorizados; no invoca operaciones financieras | `src/modules/asistencia/` |
| **Outbox y consumo de eventos** | Entrega confiable | Persistir junto con la transferencia el evento que requiere análisis; el worker lo reclama y reintenta | Tabla PostgreSQL durable |
| **Worker de análisis de riesgo** | Análisis posterior | Procesar eventos del outbox, consultar reglas/modelo y generar alertas no vinculantes; no modifica saldos ni bloquea cuentas | `src/workers/analisis-riesgo/` |

---

## 4. Relaciones entre componentes

| Origen | Destino | Descripción | Tipo de comunicación |
|---|---|---|---|
| Aplicación web | API REST | Llama a la API | HTTPS/JSON |
| API REST | Módulos de negocio | Invoca los casos de uso | Llamada en memoria |
| Usuarios | Saldos | Valida la cuenta antes de operar | Llamada en memoria (API pública del módulo) |
| Compras | Saldos | Acredita el resultado confirmado mediante el libro | Llamada en memoria |
| Compras | Pagos | Solicita el cobro | Llamada en memoria |
| Transferencias internas | Saldos y libro | Registra atómicamente débito y crédito; rechaza fondos insuficientes | Caso de uso/repository transaccional |
| Operaciones | Saldos | Consulta movimientos para el historial | Llamada en memoria |
| Operaciones | Proveedor custodial | Solicita retiros externos y reconcilia estados | HTTPS/REST |
| Saldos, Compras, Transferencias | Integridad transaccional | Aplica las garantías de concurrencia del almacenamiento del libro | Transacción del repositorio |
| Compras, Transferencias, Operaciones | Notificaciones | Publica cambios de estado | Evento en memoria o mecanismo por definir |
| Usuario | Asistencia conversacional | Formula preguntas en contexto autenticado; el módulo aplica autorización y minimización | HTTPS/JSON vía API |
| Asistencia conversacional | Proveedor de IA | Solicita una respuesta acotada; el backend conserva control sobre las consultas de cuenta | HTTPS/API vía Adapter |
| Transferencias internas | Outbox | Registra un evento durable dentro de la transacción financiera | Misma transacción del almacenamiento |
| Outbox | Worker de análisis de riesgo | Conserva eventos y permite que el worker los reclame, procese y reintente idempotentemente | Protocolo del almacenamiento |
| Worker de análisis de riesgo | Proveedor de IA | Solicita evaluación sobre señales minimizadas, no una decisión automática | HTTPS/API vía Adapter |
| Worker de análisis de riesgo | Repositorio de alertas | Persiste señal, evento de origen, versión del analizador y estado de revisión | Persistencia |

---

## 5. Relaciones con contenedores y sistemas externos

| Componente | Destino | Descripción | Protocolo | Patrón aplicado |
|---|---|---|---|---|
| Módulo Saldos | PostgreSQL (hosting por decidir) | Es propietario del libro de saldos y registra movimientos atómicos y eventos outbox | Protocolo PostgreSQL | Repository |
| Módulos de negocio | PostgreSQL | Persisten sus datos mediante repositorios; no modifican directamente el libro de otro módulo | Protocolo PostgreSQL | Repository |
| Saldos | Caché (tecnología por definir) | Mantiene vistas derivadas para lectura; nunca autoriza fondos ni registra movimientos | Protocolo del servicio seleccionado | Decorator |
| Pagos | Pasarela de pago | Cobra | HTTPS/REST | Adapter |
| Compras | Proveedor custodial | Solicita adquisición/consulta de activos; simulado en la fase académica | HTTPS/REST | Adapter |
| Operaciones | Proveedor custodial | Solicita retiros externos y consulta/reconcilia su estado | HTTPS/REST | Adapter |
| Proveedor custodial | Red blockchain | Liquida retiros externos cuando corresponda | Según proveedor | Integración del proveedor |
| Notificaciones | Servicio de notificaciones | Envía el aviso al usuario | HTTPS/REST | Adapter |
| Módulo Asistencia | Proveedor de IA | Genera respuestas del chat con contexto permitido; salida no ejecutable | HTTPS/API | Adapter |
| Worker de análisis | Proveedor de IA (opcional) | Evalúa señales minimizadas; la salida solo crea una alerta no vinculante | HTTPS/API | Adapter / Strategy |
| Outbox | Worker de análisis | Conserva eventos pendientes; permite reintento y recuperación idempotente | Protocolo del almacenamiento | Transactional Outbox |

---

## 6. Reglas del monolito modular

| # | Regla | Motivo |
|---|---|---|
| 1 | Los módulos síncronos se despliegan juntos en la API; el worker comparte el código y contratos, pero se ejecuta como proceso separado | Aísla el trabajo asíncrono y permite procesarlo independientemente sin convertir los módulos en microservicios |
| 2 | Un módulo usa a otro solo a través de su API pública (`index.ts`) | Evita que un cambio interno en un módulo rompa a los demás |
| 3 | Un módulo no lee ni escribe las tablas de otro módulo | Mantiene la independencia de los datos de cada módulo |
| 4 | Los proveedores externos se acceden mediante puertos/adaptadores controlados; el proveedor de IA puede ser compartido por chat y worker | Centraliza credenciales y permite sustituir proveedores sin acoplar los casos de uso |
| 5 | La consistencia del libro se garantiza mediante el almacenamiento transaccional autoritativo | Ningún evento de IA sustituye la operación atómica ni participa en su autorización |
| 6 | Cada módulo se organiza por dentro con Clean Architecture | Las reglas de negocio no dependen de la tecnología (ver nivel 4) |
| 7 | El análisis asíncrono solo consume eventos y escribe alertas; no modifica el libro ni suspende cuentas | Mantiene mínimo privilegio y evita que una salida probabilística ejecute acciones irreversibles |