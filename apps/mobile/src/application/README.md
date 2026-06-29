# Application

Objetivo: orquestar casos de uso de la app móvil sin mezclar UI con persistencia, red o APIs nativas.

Dependencias: dominio, repositorios de infraestructura y servicios nativos encapsulados.

Responsabilidades:

- Autenticación y carga de sesión de campo.
- Refresh de estado remoto autenticado.
- Sincronización de la cola offline.
- Captura de GPS y fotografía mediante servicios dedicados.

Puntos de extensión:

- Agregar reintentos, backoff, versionado y auditoría de sincronización en Sprint 3.
- Incorporar telemetría por caso de uso.
- Sustituir la implementación de repositorios sin cambiar pantallas ni hooks.
