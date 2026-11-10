# Escenarios de atributos de calidad de QuillaCoin

## EQ-01. Consistencia: transferencias concurrentes

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Consistencia |
| **Fuente** | Usuario |
| **Estímulo** | Varias transferencias intentan modificar simultáneamente un mismo saldo. |
| **Condición** | El sistema opera normalmente con datos representativos. |
| **Respuesta esperada** | El libro registra atómicamente el débito y el crédito de cada transferencia interna, rechaza operaciones sin fondos suficientes y evita duplicaciones. El proveedor no participa en este flujo. |
| **Medida** | El 100 % de las solicitudes concurrentes de prueba mantiene el libro balanceado, sin sobregiros, movimientos duplicados ni transferencias parcialmente registradas. |
| **Verificación** | Ejecutar pruebas concurrentes en el entorno simulado; comprobar el balance del libro, la unicidad de solicitudes y los saldos resultantes. |
| **Estado** | Pendiente de definir el número de operaciones concurrentes de la prueba. |

En contraste, los retiros externos son operaciones separadas: se registran con estados y solo se concilian con el proveedor cuando este informa su resultado.

## EQ-02. Rendimiento: consulta de saldos y transferencias

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Rendimiento |
| **Fuente** | Usuario |
| **Estímulo** | El usuario consulta sus saldos o realiza una transferencia. |
| **Condición** | El sistema funciona normalmente con datos representativos. |
| **Respuesta esperada** | El sistema responde dentro de tiempos aceptables sin errores inesperados. |
| **Medida** | **Propuesta por validar:** el 95 % de las consultas responde en 2 segundos o menos, con menos del 1 % de errores técnicos, durante una prueba con 200 usuarios simultáneos. |
| **Verificación** | Ejecutar pruebas de rendimiento y registrar tiempos, errores y usuarios simultáneos. |
| **Estado** | Pendiente de aprobación de las medidas y definición del entorno de prueba. |

## EQ-03. Disponibilidad: continuidad del servicio

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Disponibilidad |
| **Fuente** | Usuario |
| **Estímulo** | El usuario intenta consultar saldos o realizar una operación cuando un servicio necesario no responde. |
| **Condición** | El sistema está publicado y cuenta con monitoreo. |
| **Respuesta esperada** | El sistema mantiene disponibles las operaciones que puede atender y comunica los errores de forma controlada. |
| **Medida** | **Propuesta por validar:** disponibilidad mensual de 99,5 % para las operaciones críticas. |
| **Verificación** | Revisar los registros de monitoreo y calcular periodos de disponibilidad e interrupción. |
| **Estado** | Pendiente de aprobar la meta y definir las operaciones críticas. |

## EQ-04. Escalabilidad: aumento de usuarios

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Escalabilidad |
| **Fuente** | Incremento de solicitudes de los usuarios |
| **Estímulo** | Aumenta la cantidad de usuarios que utilizan QuillaCoin simultáneamente. |
| **Condición** | Se realiza una prueba con datos, configuración y solicitudes documentadas. |
| **Respuesta esperada** | El sistema soporta el aumento de usuarios sin superar los límites acordados de tiempo de respuesta y errores. |
| **Medida** | **Propuesta por validar:** soportar hasta 200 usuarios simultáneos, con el 95 % de las respuestas por debajo de 3 segundos y menos del 1 % de errores técnicos. |
| **Verificación** | Aumentar progresivamente la carga y comparar tiempos, errores y uso de recursos. |
| **Estado** | Pendiente de confirmar la cantidad esperada de usuarios y la infraestructura de prueba. |

## EQ-05. Seguridad: acceso a operaciones protegidas

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Seguridad |
| **Fuente** | Usuario sin sesión, con credenciales inválidas o sin permisos suficientes |
| **Estímulo** | El usuario intenta acceder a una función protegida o realizar una operación no autorizada. |
| **Condición** | Se realizan pruebas sobre las funciones protegidas del sistema. |
| **Respuesta esperada** | El sistema rechaza la operación, no ejecuta el cambio solicitado y no expone información sensible. |
| **Medida** | Rechazar el 100 % de los intentos no autorizados incluidos en las pruebas, sin exposición de datos sensibles. |
| **Verificación** | Ejecutar pruebas de acceso autorizado y no autorizado, revisar las respuestas y verificar que no se expongan datos sensibles. |
| **Estado** | Pendiente de definir los permisos por tipo de usuario y las operaciones protegidas. |

## EQ-06. Mantenibilidad: cambios sin afectar otras funciones

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Mantenibilidad |
| **Fuente** | Equipo de desarrollo |
| **Estímulo** | Se modifica una regla de negocio o se necesita sustituir el proveedor de criptomonedas. |
| **Condición** | El sistema está organizado en módulos y dispone de pruebas para las funciones afectadas. |
| **Respuesta esperada** | El cambio se concentra en el módulo responsable sin afectar funciones no relacionadas. |
| **Medida** | Las pruebas del módulo modificado y las pruebas de regresión acordadas deben aprobarse. Las dependencias entre módulos deben respetar las reglas de arquitectura establecidas. |
| **Verificación** | Revisar los cambios de código, ejecutar las pruebas e inspeccionar las dependencias entre módulos. |
| **Estado** | Pendiente de definir las reglas de dependencias y las pruebas obligatorias. |

## EQ-07. Resiliencia: análisis de riesgo asíncrono

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Resiliencia asíncrona y consistencia |
| **Fuente** | Usuario que realiza una transferencia; cola, worker o proveedor de IA indisponible |
| **Estímulo** | Se confirma una transferencia mientras el transporte de eventos o el proveedor de IA está lento o no disponible. |
| **Condición** | El almacenamiento autoritativo está operativo; el análisis externo puede fallar. |
| **Respuesta esperada** | El débito y crédito se confirman atómicamente y el evento queda en el outbox dentro de la misma transacción. El análisis se reintenta después sin duplicar movimientos ni resultados; nunca se espera al modelo para responder la transferencia. |
| **Medida** | 100 % de transferencias confirmadas en la prueba tienen un evento persistido; el 100 % de eventos reintentados conserva un único resultado lógico. **Objetivo de demora de procesamiento por definir y validar.** |
| **Verificación** | Inducir fallos y demoras en publicación, worker y proveedor; comparar transferencias, outbox, reintentos y alertas. |
| **Estado** | Requisitos de entrega y pruebas identificados; tecnología y objetivo de demora pendientes. |

## EQ-08. Privacidad y disponibilidad: chat de asistencia

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Seguridad, privacidad y disponibilidad |
| **Fuente** | Usuario autenticado o proveedor de IA indisponible |
| **Estímulo** | El usuario pregunta por operaciones propias, intenta obtener datos ajenos o el modelo no responde. |
| **Condición** | Se aplican autenticación, autorización y políticas de minimización del contexto. |
| **Respuesta esperada** | El servidor limita las consultas a datos autorizados del usuario, no revela datos de terceros ni ejecuta operaciones. Si la IA falla, el chat informa que no está disponible sin afectar las funciones financieras. |
| **Medida** | Rechazar el 100 % de los casos no autorizados cubiertos por pruebas; cero credenciales o secretos en solicitudes al modelo; las transferencias continúan operativas durante pruebas de indisponibilidad del chat. **Meta de latencia del chat pendiente.** |
| **Verificación** | Probar acceso cruzado entre cuentas, entradas adversariales, registro de datos y caída/timeout del proveedor. |
| **Estado** | Controles definidos; proveedor, retención y metas de servicio por seleccionar. |

## EQ-09. Gobernanza: alertas y decisiones de riesgo

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Trazabilidad y supervisión humana |
| **Fuente** | Worker de análisis y administrador autorizado |
| **Estímulo** | El análisis encuentra una señal de posible anomalía. |
| **Condición** | El modelo puede producir resultados imprecisos y el evento contiene solo datos minimizados. |
| **Respuesta esperada** | Se crea una alerta no vinculante con referencia al evento, señales/motivo, versión de reglas/modelo y estado de revisión. Solo personal autorizado puede registrar una resolución; una restricción se ejecuta por el flujo administrativo auditado, nunca por el modelo. |
| **Medida** | El 100 % de alertas de prueba conserva evento, versión del analizador y resolución; cero bloqueos automáticos realizados por IA. |
| **Verificación** | Revisar registros de auditoría, permisos y pruebas de salida del modelo que soliciten una acción no autorizada. |
| **Estado** | Política de supervisión definida; taxonomía de alertas y retención por acordar. |

## EQ-10. Efectividad: evaluación del análisis de riesgo

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Efectividad evaluable |
| **Fuente** | Equipo responsable del análisis y conjunto de operaciones etiquetadas |
| **Estímulo** | Se incorpora o cambia una regla, modelo, proveedor o versión de configuración. |
| **Condición** | Existe un conjunto de evaluación representativo, separado de los datos de entrenamiento cuando corresponda. |
| **Respuesta esperada** | Antes de usar el resultado como señal operativa se reportan precisión, recall y tasas de falsos positivos/negativos; los umbrales de aceptación se acuerdan con el equipo y las alertas siguen siendo no vinculantes. |
| **Medida** | Cada versión evaluada tiene métricas reproducibles y aprobación documentada frente a umbrales acordados; los valores numéricos quedan pendientes de definición y no se presume que el modelo detecte fraude con certeza. |
| **Verificación** | Ejecutar pruebas offline sobre datos etiquetados, comparar versiones y conservar modelo/reglas, conjunto y resultados de cada evaluación. |
| **Estado** | Pendiente de disponer datos representativos, acordar umbrales y seleccionar el enfoque de análisis. |

---

## Resumen de escenarios

| Código | Atributo de calidad | Qué se busca comprobar |
|---|---|---|
| EQ-01 | Consistencia | Que las transferencias concurrentes no generen saldos incorrectos. |
| EQ-02 | Rendimiento | Que las consultas y transferencias respondan dentro del tiempo establecido. |
| EQ-03 | Disponibilidad | Que las operaciones críticas estén disponibles cuando se necesiten. |
| EQ-04 | Escalabilidad | Que el sistema soporte un aumento de usuarios dentro de los límites definidos. |
| EQ-05 | Seguridad | Que las operaciones protegidas no puedan ejecutarse sin autorización. |
| EQ-06 | Mantenibilidad | Que los cambios puedan realizarse sin afectar innecesariamente otras funciones. |
| EQ-07 | Resiliencia asíncrona | Que transferencias y eventos sigan siendo consistentes ante fallos del análisis. |
| EQ-08 | Privacidad y disponibilidad | Que el chat limite los datos y su caída no afecte operaciones financieras. |
| EQ-09 | Trazabilidad y supervisión | Que las alertas sean explicables/auditables y ninguna acción se automatice por decisión del modelo. |
| EQ-10 | Efectividad evaluable | Que los resultados se contrasten con datos etiquetados antes de considerarlos señales operativas. |