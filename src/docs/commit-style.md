# 📦 Convención de Commits

Este proyecto usa la convención **Conventional Commits**, con mensajes en **inglés**, estructurados y claros. Esto ayuda a mantener un historial ordenado, entendible por herramientas automatizadas y por otros desarrolladores.

---

## 📐 Estructura general

---

## 🔑 Tipos permitidos

| Tipo        | Descripción                                      |
|-------------|--------------------------------------------------|
| `feat`      | Nueva funcionalidad                              |
| `fix`       | Corrección de errores                            |
| `docs`      | Cambios en documentación                         |
| `style`     | Cambios de formato, sin lógica (espacios, etc.)  |
| `refactor`  | Refactorización sin cambio funcional             |
| `test`      | Agrega o corrige pruebas                         |
| `chore`     | Tareas menores, sin cambios funcionales visibles |
| `perf`      | Mejoras de rendimiento                           |
| `ci`        | Configuración de CI/CD                           |
| `build`     | Cambios que afectan el sistema de build          |

---

## 🧪 Ejemplos

```bash
feat(auth): add login page with form validation
fix(dashboard): correct chart not updating on filter
docs(ui-rules): update component usage instructions
refactor(form): extract shared input to component
chore: clean unused imports and files

