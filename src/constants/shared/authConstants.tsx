// Constantes para tipos de vía
export const TIPOS_VIA = [
  "Anillo Vial",
  "Autopista",
  "Avenida",
  "Avenida calle",
  "Avenida carrera",
  "Calle",
  "Callejón",
  "Carrera",
  "Circular",
  "Diagonal",
  "Transversal"
];

// Constantes para orientación
export const ORIENTACIONES = ["Este", "Norte", "Oeste", "Sur"];

// Constantes para sectores
export const SECTORES = [
  "La Fortuna",
  "Residencial",
  "Comercial",
  "Industrial",
  "Institucional",
  "Servicios",
  "Grandes Generadores de Residuos Sólidos Orgánicos",
  "Eventos Masivos"
];

// Constantes para barrios
export const BARRIOS = [
  "Ciudad 2000",
  "El Poblado",
  "San Antonio",
  "Granada",
  "Juanambú",
  "Santa Mónica"
];

// Función para generar letras del abecedario
export function generarLetrasAbecedario() {
  return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
}

// Función para generar comunas
export function generarComunas() {
  return Array.from({ length: 22 }, (_, i) => `Comuna ${i + 1}`);
}