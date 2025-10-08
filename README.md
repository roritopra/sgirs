# SGIRS Frontend - Sistema de Gestión Integral de Residuos Sólidos

## 📋 Descripción del Proyecto

SGIRS Frontend es una aplicación web desarrollada con Next.js 15 que forma parte del Sistema de Gestión Integral de Residuos Sólidos. La aplicación proporciona interfaces específicas para diferentes tipos de usuarios (administradores, funcionarios y ciudadanos/sectores estratégicos) para la gestión y reporte de residuos sólidos en la ciudad de Cali.

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
sgirs_frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── admin/             # Rutas para administradores
│   │   ├── auth/              # Autenticación (login, registro, etc.)
│   │   ├── ciudadano/         # Rutas para ciudadanos/sectores estratégicos
│   │   ├── funcionario/       # Rutas para funcionarios
│   │   └── perfil/            # Gestión de perfil de usuario
│   ├── components/            # Componentes reutilizables
│   │   ├── admin/             # Componentes específicos de admin
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── ciudadano/         # Componentes para ciudadanos
│   │   ├── funcionario/       # Componentes para funcionarios
│   │   ├── shared/            # Componentes compartidos
│   │   └── ui/                # Componentes de UI base
│   ├── config/                # Configuraciones de la aplicación
│   ├── constants/             # Constantes y enums
│   ├── context/               # Contextos de React
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades y helpers
│   ├── services/              # Servicios de API
│   ├── store/                 # Redux store y slices
│   ├── types/                 # Definiciones de TypeScript
│   └── utils/                 # Funciones utilitarias
├── public/                    # Archivos estáticos
├── dev/                       # Archivos de desarrollo
└── docs/                      # Documentación del proyecto
```

### Tecnologías Utilizadas

- **Framework**: Next.js 15.3.4 con App Router
- **Lenguaje**: TypeScript 5
- **UI Library**: HeroUI (NextUI) 2.8.0-beta.11
- **Styling**: Tailwind CSS 4.1.11
- **State Management**: Redux Toolkit 2.8.2
- **Forms**: React Hook Form 7.59.0 con Zod 3.25.71
- **Charts**: Recharts 3.1.0, Nivo 0.99.0
- **Maps**: Leaflet 1.9.4
- **HTTP Client**: Axios 1.11.0
- **Animations**: Framer Motion 12.23.0

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20 o superior
- npm, yarn o pnpm
- Docker (opcional)

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd sgirs_frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con los valores correctos
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Comandos Disponibles

```bash
# Desarrollo con Turbopack (más rápido)
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint
```

## 🐳 Ejecución con Docker

### Construcción de la Imagen

```bash
# Construir la imagen
docker build -t sgirs-frontend .

# Construir con tag específico
docker build -t sgirs-frontend:latest .
```

### Ejecución del Contenedor

```bash
docker run -p 3000:3000 -d --name sgirs_frontend_container sgirs-frontend
```

### Docker Compose (Recomendado)

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'
services:
  sgirs-frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

Ejecutar con:
```bash
docker-compose up
```

## 👥 Roles y Permisos

El sistema maneja tres tipos de usuarios con diferentes niveles de acceso:

### 1. **Administrador** (`/admin`)
- Gestión de usuarios estratégicos
- Análisis de sentimientos
- Preguntas frecuentes
- Dashboard administrativo

### 2. **Funcionario** (`/funcionario`)
- Indicadores de residuos orgánicos
- Gestión de RAEE, RESPEL y RCD
- Residuos voluminosos
- Condiciones UAR
- Búsqueda de establecimientos

### 3. **Ciudadano/Sector Estratégico** (`/ciudadano`)
- Formularios de reporte de residuos
- Visualización de reportes
- Gestión de perfil

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

- **Login**: `/auth/login`
- **Registro**: `/auth/register`
- **Recuperación de contraseña**: `/auth/forgot-password`
- **Verificación de email**: `/auth/verify-email`
- **Reset de contraseña**: `/reset-password`

El middleware de Next.js (`middleware.ts`) maneja automáticamente:
- Redirección basada en roles
- Protección de rutas
- Validación de tokens JWT

## 📊 Características Principales

### Para Administradores
- Dashboard con métricas generales
- Análisis de sentimientos de conversaciones
- Gestión de usuarios estratégicos
- Preguntas frecuentes

### Para Funcionarios
- Indicadores de residuos orgánicos (RSO)
- Gestión de residuos peligrosos (RAEE, RESPEL, RCD)
- Residuos voluminosos
- Condiciones de UAR (Unidades de Aprovechamiento de Residuos)
- Búsqueda y análisis de establecimientos

### Para Ciudadanos/Sectores Estratégicos
- Formularios dinámicos de reporte
- Visualización de reportes por período
- Gestión de perfil personal

## 🗺️ Mapas y Visualizaciones

- **Mapas interactivos**: Utilizando Leaflet para visualización geográfica
- **Gráficos**: Recharts y Nivo para visualización de datos
- **Choropleth maps**: Para distribución geográfica de datos
- **Datos GeoJSON**: Integración con datos de comunas de Cali

## 🎨 UI/UX

- **Design System**: HeroUI (NextUI) como base
- **Styling**: Tailwind CSS para estilos personalizados
- **Responsive**: Diseño adaptativo para móviles y desktop
- **Animations**: Framer Motion para transiciones suaves
- **Icons**: Lucide React e Iconify

## 📱 PWA Ready

La aplicación está configurada como PWA (Progressive Web App) con:
- Manifest.json configurado
- Iconos para diferentes dispositivos
- Soporte para instalación en dispositivos móviles

## 🔧 Desarrollo

### Estructura de Componentes

Los componentes están organizados por funcionalidad:
- `components/admin/`: Componentes específicos para administradores
- `components/ciudadano/`: Componentes para ciudadanos
- `components/funcionario/`: Componentes para funcionarios
- `components/shared/`: Componentes reutilizables
- `components/ui/`: Componentes base de UI

### Servicios de API

Los servicios están organizados por módulo:
- `services/authService.ts`: Autenticación
- `services/ciudadano/`: Servicios para ciudadanos
- `services/funcionario/`: Servicios para funcionarios
- `services/admin/`: Servicios para administradores

### Estado Global

Utiliza Redux Toolkit para el manejo del estado:
- `store/slices/authSlice.ts`: Estado de autenticación
- `store/slices/activePeriodSlice.ts`: Período activo de encuestas

## 🚀 Despliegue

### Producción

1. **Construir la aplicación**:
   ```bash
   npm run build
   ```

2. **Iniciar servidor de producción**:
   ```bash
   npm run start
   ```

### Docker en Producción

```bash
# Construir imagen optimizada
docker build -t sgirs_frontend:prod .

# Ejecutar en producción
docker run -d \
  --name sgirs_frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.sgirs.com \
  sgirs_frontend:prod
```

## 📝 Scripts Útiles

```bash
# Desarrollo con hot reload
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting del código
npm run lint

# Instalar dependencias
npm install

# Actualizar dependencias
npm update
```#   s g i r s  
 