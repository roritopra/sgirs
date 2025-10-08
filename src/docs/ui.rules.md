# 🧩 UI Hero UI y Shadcn — Reglas de Uso de Componentes

Se utiliza **Hero UI** como sistema de diseño y biblioteca de componentes principal en todo el proyecto. Se debe priorizar la **consistencia visual**, la **accesibilidad** y la **alineación con el sistema de diseño** de Figma.  
**Shadcn UI** se usará únicamente para gráficos (`charts`) u otros componentes aprobados.  

---

## 📦 Uso de Componentes

- ✅ Usa **Hero UI antes** de crear elementos personalizados.
- ✅ Composición recomendada con componentes base de Hero UI (`<Card>`, `<CardContent />`, etc.).
- ✅ Si necesitas extender funcionalidad, hazlo de forma controlada (usando wrappers).
- ⚠️ Se puede mezclar Hero UI con otras bibliotecas como Shadcn, solo si está **justificado y documentado** en `status.md`.
- ❌ No utilices HTML plano con clases (`<div className="btn">`) en lugar de los componentes Hero UI.

---

## 🎨 Convenciones de Estilo

- ✅ Usa `variant`, `size`, `intent`, etc., antes de aplicar `className`.
- ✅ Tailwind solo para layout o espaciado: `p-4`, `gap-6`, `flex`, `grid-cols-3`, etc.
- ⚠️ Si necesitas sobrescribir estilos internos, centralízalo en `components/ui/overrides.ts`.
- 🎯 Los estilos deben alinearse con **tokens de Figma**: colores, bordes, padding, etc.
- 🧩 Cuando un diseño específico no esté en Figma, busca el componente más cercano o consúltalo con el equipo.

---

## 🧩 Personalización y Extensión

- ✅ Guarda componentes extendidos en: `components/ui/Custom/`
- ✅ Prefija los nombres con `Hero`:  
  `HeroDialogWrapper.tsx`, `HeroTooltip.tsx`, etc.
- ✅ Centraliza modificaciones globales en `overrides.ts`.

---

## ♿ Accesibilidad (a11y)

- ✅ Usa siempre componentes accesibles: `Dialog`, `Tooltip`, `Switch`, `Popover`, etc.
- ✅ No elimines estilos de foco (`focus:outline-none`) sin reemplazo visible.
- ✅ Usa `aria-*` según corresponda.
- ✅ Verifica accesibilidad con Lighthouse o `axe-core`.

---

## 🧱 Estructura y Nombres

- ✅ Usa **PascalCase**: `HeroButton.tsx`, `PieChart.tsx`
- ✅ Para componentes extendidos, usa sufijos: `Wrapper`, `WithFeature`, etc.
- ✅ Sigue esta estructura:

/src/components/
├── shared/
├── ciudadano/
├── oficial/
├── admin/
└── ui/
    ├── card.tsx()
    ├── chart.tsx
    ├── overrides.ts
    └── Custom/

---

## 🧪 Pruebas de UI

- ✅ Usa `@testing-library/react` para probar **comportamiento**, no implementación.
- ✅ Simula eventos del usuario (`click`, `type`, etc.).
- ❌ Evita pruebas visuales (snapshots) en componentes sin personalización.
- ✅ Si personalizas lógica, prueba accesibilidad e interacción.

---

## 🛑 En caso de duda

> ❓ “Este componente no tiene una regla clara. Por favor consulta la [documentación de Hero UI](https://www.heroui.com/docs/guide/introduction) o enlaza el diseño correspondiente en Figma.”

- ✅ Sugiere un equivalente similar.
- ✅ Documenta cualquier excepción en `status.md`.

---

## 📘 Prácticas esperadas

- 🔄 Alinea todos los componentes al sistema de diseño (Figma).
- 📚 Usa Hero UI en **todos los elementos interactivos**.
- 📝 Documenta modificaciones o decisiones en `status.md`.
- 💤 Usa `<Suspense />` y `next/dynamic` para componentes solo del cliente.

---

## ✅ Ejemplo correcto

```tsx
// ✅ Correcto
import { Button } from "@heroui/react";

<Button variant="outline" onPress={handleCancel}>Cancelar</Button>

// ❌ Incorrecto
<button className="border px-4 py-2" onClick={handleCancel}>Cancelar</button>
