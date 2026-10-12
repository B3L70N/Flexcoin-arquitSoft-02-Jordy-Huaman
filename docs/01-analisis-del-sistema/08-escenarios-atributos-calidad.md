# Escenarios de atributos de calidad de Flexcoin

## EQ-01. Consistencia: transferencias concurrentes

| Elemento | Descripción |
|---|---|
| **Atributo de calidad** | Consistencia |
| **Fuente** | Usuario |
| **Estímulo** | Varias transferencias intentan modificar simultáneamente un mismo saldo. |
| **Condición** | El sistema opera normalmente con datos representativos. |
| **Respuesta esperada** | El sistema controla las operaciones y evita saldos incorrectos o transferencias que excedan los fondos disponibles. |
| **Medida** | El 100 % de las operaciones concurrentes sobre un mismo saldo mantiene la consistencia, sin sobregiros ni duplicaciones. |
| **Verificación** | Ejecutar pruebas de concurrencia sobre un mismo saldo y revisar el resultado final. |
| **Estado** | Pendiente de definir el número de operaciones concurrentes de la prueba. |

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
| **Estímulo** | Aumenta la cantidad de usuarios que utilizan Flexcoin simultáneamente. |
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