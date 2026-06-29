# Domain

Objetivo: concentrar reglas puras del negocio móvil NorthAcoustics sin depender de React, Expo, Supabase ni almacenamiento local.

Dependencias: solo modelos compartidos desde `@northacoustics/shared`.

Responsabilidades:

- Construir entidades de campo con defaults consistentes.
- Mantener el contrato del estado offline.
- Resolver consultas puras como agregados de proyecto.
- Definir inputs tipados para operaciones de cliente, proyecto, punto, medición y reporte.

Puntos de extensión:

- Agregar validadores de dominio antes de persistir.
- Separar subdominios si crece la lógica de clientes, mediciones, reportes o equipos.
- Incorporar reglas de versionado/conflictos en Sprint 3 sin acoplarlas a UI.
