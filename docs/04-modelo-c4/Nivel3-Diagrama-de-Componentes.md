# Nivel 3 · Diagrama de componentes

> **Proyecto:** Marketplace · **Contenedor detallado:** API Marketplace  
> **Modelo:** C4 · Nivel 3 de 4 · **Versión:** 1.0

---

## 1. Objetivo

Abrir el contenedor **API Marketplace** del nivel 2 y mostrar sus **componentes**: los módulos del monolito modular, la responsabilidad de cada uno y cómo se relacionan entre sí y con la base de datos, la caché y los sistemas externos.

| Aspecto | Descripción |
|---|---|
| Pregunta que responde | ¿Cómo se divide el backend por dentro y qué hace cada parte? |
| Audiencia | Arquitectos y desarrolladores |
| Qué es un componente | Un grupo de funcionalidades con una responsabilidad clara, accesible mediante una interfaz. En este proyecto, cada **módulo** del monolito es un componente |
| Nivel anterior | `Nivel2-DiagramadeContenedores.md` |
| Siguiente nivel | `Nivel4-DiagramadeCodigo.md` |

---

## 2. Diagrama

![Diagrama de componentes de la API Marketplace](../capturas/nivel3-componentes.png)

> Archivo editable: `img/fuentes/nivel3-componentes.drawio`

---

## 3. Componentes

| Componente | Responsabilidad | Funcionalidades principales | Carpeta en el código |
|---|---|---|---|
| **API REST** | Punto de entrada HTTP del contenedor | Rutas `/api/v1`, autenticación JWT, validación de la entrada, manejo de errores | `src/api/` |
| **Usuarios** | Identidad y acceso | Registro, inicio de sesión, roles (cliente, seller, administrador) | `src/modules/usuarios/` |
| **Sellers** | Gestión de vendedores | Alta y validación de tiendas | `src/modules/sellers/` |
| **Catálogo** | Productos disponibles | Productos, categorías, precios y stock | `src/modules/catalogo/` |
| **Carrito** | Selección previa a la compra | Agregar y quitar ítems, calcular totales | `src/modules/carrito/` |
| **Pedidos** | Proceso de compra | Checkout, estados del pedido, sincronización con el ERP | `src/modules/pedidos/` |
| **Pagos** | Cobros | Cobro mediante la pasarela de pago | `src/modules/pagos/` |
| **Envíos** | Despacho de pedidos | Solicitar y consultar envíos con el courier | `src/modules/envios/` |
| **Notificaciones** | Comunicación con el cliente | Avisar el estado del pedido | `src/modules/notificaciones/` |

---

## 4. Relaciones entre componentes

| Origen | Destino | Descripción | Tipo de comunicación |
|---|---|---|---|
| Aplicación web | API REST | Llama a la API | HTTPS/JSON |
| API REST | Módulos de negocio | Invoca los casos de uso | Llamada en memoria |
| Sellers | Usuarios | Valida la cuenta del seller | Llamada en memoria (API pública del módulo) |
| Catálogo | Sellers | Asocia cada producto a su seller | Llamada en memoria |
| Carrito | Catálogo | Consulta precio y stock | Llamada en memoria |
| Pedidos | Carrito | Convierte el carrito en pedido | Llamada en memoria |
| Pedidos | Pagos | Solicita el cobro | Llamada en memoria |
| Pedidos | Envíos | Solicita el despacho | Llamada en memoria |
| Pedidos | Notificaciones | Publica el cambio de estado | Evento en memoria |

---

## 5. Relaciones con contenedores y sistemas externos

| Componente | Destino | Descripción | Protocolo | Patrón aplicado |
|---|---|---|---|---|
| Todos los módulos | Base de datos (PostgreSQL) | Cada módulo lee y escribe **solo sus propias tablas** | SQL | Repository |
| Catálogo | Caché (Redis) | Guarda y lee productos en memoria | TCP | Decorator |
| Pagos | Pasarela de pago | Cobra | HTTPS/REST | Adapter |
| Pedidos | ERP | Sincroniza pedidos | HTTPS/REST | Adapter |
| Envíos | Servicio de envío | Crea envíos | HTTPS/REST | Adapter |

---

## 6. Reglas del monolito modular

| # | Regla | Motivo |
|---|---|---|
| 1 | Todos los componentes se despliegan juntos en el contenedor API Marketplace | Es un monolito: un solo proceso y un solo despliegue |
| 2 | Un módulo usa a otro solo a través de su API pública (`index.js`) | Evita que un cambio interno en un módulo rompa a los demás |
| 3 | Un módulo no lee ni escribe las tablas de otro módulo | Mantiene la independencia de los datos de cada módulo |
| 4 | Cada sistema externo se integra en un único módulo | La integración queda en un solo lugar y es fácil de reemplazar |
| 5 | Cada módulo se organiza por dentro con Clean Architecture | Las reglas de negocio no dependen de la tecnología (ver nivel 4) |

---

