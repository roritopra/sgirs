# 🌐 Convenciones de Idioma en el Proyecto

Este proyecto está orientado a la Alcaldía de Cali, por lo tanto se decidió usar una **convención mixta** que equilibra profesionalismo en el código y claridad en el dominio.

---

## 📌 Reglas principales

| Elemento                     | Idioma a usar     | Ejemplo                                 |
|-----------------------------|--------------------|------------------------------------------|
| Funciones y variables        | Inglés             | `getCitizenData()`, `submitForm()`      |
| Hooks personalizados         | Inglés             | `useCitizenForm()`, `useAuth()`         |
| Archivos de lógica (`.ts`, `.tsx`) | Inglés       | `LoginForm.tsx`, `WasteTable.tsx`       |
| Carpetas de rol              | Español            | `/ciudadano/`, `/funcionario/`, `/admin/` |
| Constantes del dominio       | Español            | `tipo_documento`, `razon_social`        |
| Rutas públicas (App Router)  | Español            | `/auth/login`, `/ciudadano/dashboard`   |
| Interfaces y tipos (`.ts`)   | Inglés             | `type Citizen`, `interface WasteReport` |
| Textos visibles (UI)         | Español            | `"Número de identificación"`            |

---

## 🧠 Justificación

- 📦 **Código en inglés:** mejora la compatibilidad con herramientas, comunidad y convenciones de desarrollo internacional.
- 🏛️ **Dominio en español:** mantiene alineación con usuarios reales, diseño en Figma y los términos legales y administrativos del contexto colombiano.

---

## ✨ Buenas prácticas adicionales

- Usa inglés para todo lo que sea lógica, abstracción, estructura o reutilización técnica.
- Usa español para todo lo que sea específico del dominio, visualización, datos del formulario o interacción con el usuario.
- Mantén coherencia en todo el proyecto. Si se crea un tipo `Citizen`, su campo puede ser `razon_social: string`, no `businessName`.

---

## 🔄 Ejemplo mixto

```tsx
// Correcto
function getCitizenFormData(): CitizenForm {
  return {
    tipo_documento: 'CC',
    razon_social: 'Tienda Mi Negocio',
    residuos_generados: [],
  }
}

// Incorrecto
function obtenerDatosDelCiudadano() {
  return {
    documentType: 'CC',
    businessName: 'Mi negocio',
    wastes: [],
  }
}