## 🎯 Descripción

<!-- Brief description of what this PR does -->

## 📋 Tipo de Cambio

- [ ] 🐛 Bug fix (cambio no-breaking que soluciona un issue)
- [ ] ✨ New feature (cambio no-breaking que agrega funcionalidad)
- [ ] 💥 Breaking change (fix o feature que cambia comportamiento)
- [ ] 📚 Documentation (cambio solo en docs)
- [ ] ♻️ Refactoring (mejora de código sin cambiar funcionalidad)

## 🔗 Issue Relacionado

Closes #(issue number)

## 🧪 Cómo Testé Esto

Describe los pasos para probar el cambio:

1. Abre la app en...
2. Navega a...
3. Verifica que...

## 📸 Screenshots (si aplica)

Antes:
[Screenshot or N/A]

Después:
[Screenshot or N/A]

## ✅ Checklist Técnico

### Código
- [ ] Mi código sigue las convenciones de estilo del proyecto
- [ ] He ejecutado `npm run format:fix` sin errores
- [ ] He ejecutado `npm run typecheck` sin errores
- [ ] He ejecutado `npm run lint` sin errores
- [ ] La build (`npm run build`) es exitosa

### Seguridad
- [ ] NO hay `.env` files commiteados
- [ ] NO hay API keys, tokens o passwords en código
- [ ] NO hay `console.log()` o debug code
- [ ] Validación de inputs en lugar apropiado

### Base de Datos
- [ ] Sin cambios en schema Supabase (coordinar si necesario)
- [ ] Sin cambios en RLS policies (coordinar si necesario)
- [ ] Sin queries N+1
- [ ] Índices creados si necesario

### Mobile (si aplica)
- [ ] Probado en iOS simulator/device
- [ ] Probado en Android emulator/device
- [ ] Sin crashes
- [ ] Offlinecapabilities preservadas

### Web (si aplica)
- [ ] Probado en Chrome/Safari/Firefox
- [ ] Responsive design funciona
- [ ] Accessibility checkeado (keyboard navigation, alt text)
- [ ] Loading states implementados

### Documentación
- [ ] README actualizado si hay cambios mayores
- [ ] Documentación de API/funciones incluida
- [ ] Comentarios en código para lógica compleja
- [ ] TypeScript types exportados si aplicable

### Testing
- [ ] Unit tests agregados/actualizados
- [ ] Tests pasan localmente
- [ ] Test coverage no disminuyó

## 📝 Notas Adicionales

Algo importante que los reviewers deben saber.

### Performance Impact
- [ ] ✅ No impact / Mejora de performance
- [ ] ⚠️ Ligera degradación (explicar)
- [ ] 🔴 Significante degradación (re-evaluar)

### Migration Requirements
- [ ] No migration needed
- [ ] Migration script incluido en PR
- [ ] Database backup recomendado

---

## 🔍 Para Reviewers

**Prioridad**: [ ] Critical | [ ] High | [ ] Medium | [ ] Low

**Esfuerzo estimado**: [ ] < 5 min | [ ] < 15 min | [ ] < 30 min | [ ] 30+ min

Checklist del revisor:
- [ ] Código sigue convenciones del proyecto
- [ ] TypeScript types son correctos
- [ ] Lógica es correcta y eficiente
- [ ] No hay security issues
- [ ] Tests tienen buena cobertura
- [ ] Documentación es clara
- [ ] No hay variables de entorno expuestas
- [ ] Breaking changes bien documentados

---

**Gracias por revisar!** 🙏
