# =========================================================================================
# PRIMERA ETAPA: Construcción (Builder)
# - Instala dependencias y construye la aplicación de producción.
# =========================================================================================
FROM node:20-alpine AS builder

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia el package.json y el package-lock.json (o yarn.lock) para instalar las dependencias.
COPY package*.json ./

# Instala las dependencias del proyecto.
RUN npm install

# Copia el resto de los archivos de tu aplicación.
COPY . .

# Construye la aplicación para producción.
RUN npm run build

# =========================================================================================
# SEGUNDA ETAPA: Producción (Production)
# - Configura el entorno final para ejecutar la aplicación construida.
# =========================================================================================
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia solo los archivos necesarios de la etapa de construcción.
# Esto incluye la carpeta .next (la aplicación construida) y las dependencias de producción.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expone el puerto en el que se ejecutará la aplicación Next.js (por defecto el 3000).
EXPOSE 3000

# El comando para iniciar la aplicación en modo de producción.
CMD ["npm", "start"]