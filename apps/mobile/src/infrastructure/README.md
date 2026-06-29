# Infrastructure

Objetivo: aislar proveedores externos y detalles técnicos de persistencia.

Dependencias: SDKs externos como Supabase y AsyncStorage. No debe contener lógica visual.

Responsabilidades:

- Crear y exponer el cliente Supabase móvil.
- Mapear filas remotas a modelos de dominio.
- Persistir estado offline en almacenamiento local.
- Encapsular operaciones de storage y tablas Supabase utilizadas por sincronización.

Puntos de extensión:

- Reemplazar Supabase por otro backend manteniendo contratos de aplicación.
- Incorporar cache, índices locales o repositorios offline especializados.
- Agregar observabilidad y trazabilidad de errores sin tocar pantallas.
