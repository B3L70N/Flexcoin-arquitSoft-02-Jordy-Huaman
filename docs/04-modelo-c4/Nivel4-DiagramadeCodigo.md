# Nivel 4 · Diagrama de código

> **Proyecto:** QuillaCoin · **Módulo detallado:** Transferencias internas<br>
> **Modelo:** C4 · Nivel 4 de 4 · **Notación:** UML · **Versión:** 1.0

---

## 1. Objetivo

Mostrar una propuesta de organización para el flujo **Transferir internamente activos entre usuarios**. Esta operación solo cambia el libro de saldos de QuillaCoin. Los retiros externos son otro flujo: se registran con estados y se solicitan al proveedor custodial.

El chat y el worker de análisis de riesgo son capacidades separadas, descritas en ADR008 y en el C4 de niveles 2 y 3; no forman parte de esta secuencia de transferencia.

| Aspecto | Descripción |
|---|---|
| Pregunta que responde | ¿Qué clases existen dentro de un módulo y cómo se relacionan? |
| Audiencia | Desarrolladores |
| Notación | UML (diagrama de clases y diagrama de secuencia). El modelo C4 recomienda UML para este nivel |
| Alcance del diagrama | Transferencia interna en una transacción del almacenamiento autoritativo; no incluye llamadas al proveedor ni a la blockchain |
| Nivel anterior | `Nivel3-Diagrama-de-Componentes.md` |

---

## 2. Diagrama de clases

```mermaid
classDiagram
    %% MÓDULO TRANSFERENCIAS
    class TransferenciaController {
        - transferir: TransferirCriptomonedasUseCase
        + transferir(req, res): Promise~void~
    }

    class TransferirCriptomonedasUseCase {
        - transferenciaRepo: TransferenciaRepository
        + ejecutar(cmd): Promise~ResultadoTransferencia~
    }

    class Transferencia {
        - id: string
        - origenId: string
        - destinoId: string
        - monto: MontoTransferencia
        - estado: EstadoTransferencia
        + crear(origenId, destinoId, monto): Transferencia
        + validar(): void
    }

    class MontoTransferencia {
        + unidadesMinimas: bigint
        + activo: string
        + validar(): void
    }

    class EstadoTransferencia {
        <<enumeration>>
        COMPLETADA
        RECHAZADA
    }

    class TransferenciaRepository {
        <<interface>>
        + registrarAtomica(transferencia, usuarioId, claveIdempotencia): Promise~ResultadoTransferencia~
    }

    class ResultadoTransferencia {
        + exitoso: boolean
        + transferenciaId: string
        + motivoRechazo?: string
    }

    class RepositorioTransaccionalLibroAdapter {
        - db: PostgreSQL
        + registrarAtomica(transferencia, usuarioId, claveIdempotencia): Promise~ResultadoTransferencia~
    }

    class CuentaSaldo {
        + usuarioId: string
        + activo: string
        + unidadesDisponibles: bigint
    }

    class ApunteContable {
        + id: string
        + transferenciaId: string
        + cuentaId: string
        + unidades: bigint
    }

    class EventoOutbox {
        + id: string
        + tipo: string
        + referenciaOperacion: string
        + estado: string
    }

    %% RELACIONES
    TransferenciaController --> TransferirCriptomonedasUseCase : usa
    TransferirCriptomonedasUseCase ..> Transferencia : crea
    TransferirCriptomonedasUseCase --> TransferenciaRepository : usa
    Transferencia *-- MontoTransferencia
    Transferencia --> EstadoTransferencia

    RepositorioTransaccionalLibroAdapter ..|> TransferenciaRepository
    TransferenciaRepository ..> ResultadoTransferencia : retorna
    RepositorioTransaccionalLibroAdapter --> CuentaSaldo : actualiza en transacción
    RepositorioTransaccionalLibroAdapter --> ApunteContable : inserta apuntes balanceados
    RepositorioTransaccionalLibroAdapter --> EventoOutbox : inserta en misma transacción
```

### 2.1 Capas de Clean Architecture

| Capa | Contiene | Regla |
|---|---|---|
| **Presentación** | Controladores | Traduce HTTP a llamadas del caso de uso y viceversa |
| **Aplicación** | Casos de uso | Coordina los pasos del proceso; no conoce la tecnología |
| **Dominio** | Entidades, objetos de valor, interfaces | Contiene las reglas del negocio; no importa nada de las otras capas |
| **Infraestructura** | Repositorios y adaptadores | Implementa las interfaces del dominio con una tecnología concreta |

> **Regla de dependencia:** las flechas del código apuntan hacia el dominio. Las clases de infraestructura implementan interfaces del dominio (triángulo hueco); el dominio nunca conoce a la infraestructura.

### 2.2 Clases del módulo Transferencias

| Clase | Tipo | Capa | Responsabilidad |
|---|---|---|---|
| `TransferenciaController` | Controlador | Presentación | Recibe `POST /api/v1/transferencias` y responde al cliente |
| `TransferirCriptomonedasUseCase` | Caso de uso | Aplicación | Valida la solicitud y coordina el registro atómico de los dos movimientos internos |
| `Transferencia` | Entidad | Dominio | Valida origen, destino y monto de la transferencia interna |
| `MontoTransferencia` | Objeto de valor | Dominio | Monto y criptomoneda con validación propia |
| `EstadoTransferencia` | Enumeración | Dominio | COMPLETADA o RECHAZADA; la operación interna se confirma dentro de una transacción |
| `TransferenciaRepository` | Interfaz | Aplicación/Dominio | Contrato para aplicar el débito, crédito, saldos, transferencia y outbox en una transacción, con idempotencia |
| `RepositorioTransaccionalLibroAdapter` | Repositorio | Infraestructura | Implementa el contrato con PostgreSQL; el hosting queda por decidir |
| `CuentaSaldo` | Proyección | Dominio/Persistencia | Mantiene unidades disponibles por usuario/activo; se actualiza junto con los apuntes inmutables |
| `ApunteContable` | Registro contable | Dominio/Persistencia | Registra los dos lados de cada transferencia, balanceados por activo |
| `EventoOutbox` | Evento durable | Persistencia | Conserva en la misma transacción el evento requerido para análisis asíncrono |

La garantía de concurrencia proviene de una transacción PostgreSQL con actualización condicional/bloqueo de filas en orden determinista, más restricciones únicas de idempotencia; no depende de un bloqueo en memoria. Se validará con pruebas de concurrencia.

### 2.4 Notación UML utilizada

| Símbolo | Significado | Ejemplo |
|---|---|---|
| Línea continua con flecha abierta | Asociación: la clase tiene una referencia a la otra | `TransferirCriptomonedasUseCase` → `TransferenciaRepository` |
| Línea discontinua con flecha abierta | Dependencia: la usa o la crea | `TransferirCriptomonedasUseCase` «crea» `Transferencia` |
| Línea discontinua con triángulo hueco | Realización: implementa una interfaz | `RepositorioTransaccionalLibroAdapter` ▷ `TransferenciaRepository` |
| Rombo relleno | Composición: la parte no existe sin el todo | `Transferencia` ◆ `MontoTransferencia` |
| Nombre en cursiva con «interface» | Interfaz | `TransferenciaRepository` |
| `-` y `+` | Atributo o método privado y público | `- estado`, `+ validar()` |

---

## 3. Diagrama de secuencia: transferencia interna

```mermaid
sequenceDiagram
    autonumber
    participant CW as Cliente web
    participant TC as TransferenciaController
    participant UC as TransferirCriptomonedasUseCase
    participant T as Transferencia
    participant TR as TransferenciaRepository
    participant DB as Almacenamiento transaccional

    CW->>TC: POST /api/v1/transferencias {destinoId, activo, montoUnidades} + Bearer JWT + Idempotency-Key
    TC->>UC: ejecutar(cmd)
    UC->>T: crear(origenId, destinoId, monto)
    T-->>UC: transferencia validada
    UC->>TR: registrarAtomica(transferencia, usuarioId, clave)
    TR->>DB: BEGIN
    TR->>DB: Resolver clave idempotente (única por usuario/operación)
    TR->>DB: Bloquear origen y destino en orden determinista
    TR->>DB: Comprobar saldo y debitar/acreditar proyecciones
    TR->>DB: Insertar transferencia, apuntes balanceados y evento outbox
    alt fondos suficientes y solicitud nueva
        TR->>DB: COMMIT
        DB-->>TR: confirmado
        TR-->>UC: transferencia completada
        UC-->>TC: transferenciaId
        TC-->>CW: 201 Created
    else misma clave y mismo cuerpo ya procesado
        TR->>DB: Recuperar respuesta original; no insertar nuevos apuntes
        TR-->>UC: resultado idempotente original
        UC-->>TC: respuesta original
        TC-->>CW: respuesta original
    else misma clave con cuerpo diferente
        TR->>DB: ROLLBACK
        TR-->>UC: conflicto de idempotencia
        UC-->>TC: error
        TC-->>CW: 409 Conflict
    else fondos insuficientes
        TR->>DB: ROLLBACK; sin movimiento parcial
        TR-->>UC: rechazo de fondos
        UC-->>TC: error
        TC-->>CW: 409 Conflict
    end
```

| Paso | Origen a destino | Acción |
|---|---|---|
| 1 | Cliente web a `TransferenciaController` | Envía destino, activo y `montoUnidades` (entero decimal como cadena), Bearer JWT y encabezado `Idempotency-Key` |
| 2 | `TransferenciaController` a `TransferirCriptomonedasUseCase` | Ejecuta el caso de uso con la identidad tomada de la sesión autenticada |
| 3 | Caso de uso a `Transferencia` | Valida origen, destino y monto |
| 4 | Caso de uso a `TransferenciaRepository` | Solicita el débito, el crédito y el registro como una operación atómica |
| 5 | Repositorio a PostgreSQL | Resuelve idempotencia; bloquea cuentas en orden determinista; aplica débitos/créditos, saldos, apuntes balanceados y outbox en una transacción |
| 6 | Alternativa | Fondos insuficientes o clave reutilizada con datos distintos revierte sin movimiento parcial; una repetición idéntica devuelve la respuesta original |
| 7 | Caso de uso a `TransferenciaController` | Devuelve el resultado confirmado o el rechazo de fondos |
| 8 | `TransferenciaController` a cliente web | Responde `201 Created` con el identificador, estado, activo y monto; reintentos idénticos retornan el resultado original |

El proveedor custodial y la blockchain **no participan** en esta secuencia. Un retiro externo es un caso de uso distinto, inicialmente simulado, que guarda su estado antes de consultar al proveedor y reconcilia respuestas posteriores.

---

## 4. Patrones y principios que se ven en este nivel

| Elemento del diagrama | Patrón o principio |
|---|---|
| `TransferenciaRepository` y `RepositorioTransaccionalLibroAdapter` | Patrones **Repository** y **Adapter** |
| El caso de uso recibe interfaces, no clases concretas | Principio de **inversión de dependencias** (SOLID) |
| Una clase por responsabilidad (controlador, caso de uso, entidad, repositorio) | Principio de **responsabilidad única** (SOLID) |
| El repositorio persiste ambos lados del movimiento en una transacción | Consistencia del libro y prevención de transferencias parciales |

> Detalle completo en `03-diseño-de-software/diseño-interno/patrones-de-diseño.md` y `principios-de-diseño.md`.