# =============================================================================
# Dockerfile — sentinel-health-engine-fe
# Multi-stage build: Node (build) → Nginx (serve)
#
# Design decisions:
#   - Stage 1 (builder): compila el proyecto con Vite. La URL del backend se
#     inyecta como ARG en build time via VITE_API_URL. Si no se provee, el
#     valor por defecto es el placeholder __VITE_API_URL_PLACEHOLDER__ que
#     el docker-entrypoint.sh reemplaza en runtime usando RUNTIME_API_URL.
#     Esto permite reutilizar la misma imagen en distintos entornos sin
#     necesidad de rebuild.
#   - Stage 2 (runner): Nginx sirve los archivos estáticos. La configuración
#     personalizada (nginx.conf) habilita SPA routing, gzip, cache headers y
#     un health-check endpoint requerido por Azure Container Apps.
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Build
# ---------------------------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero para aprovechar la cache de capas de Docker.
# Si package*.json no cambia, npm ci no se vuelve a ejecutar.
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# ARG para la URL del API en build time.
# Valor por defecto: placeholder especial que docker-entrypoint.sh
# reemplazará en runtime con el valor de RUNTIME_API_URL.
# Si se provee VITE_API_URL al hacer docker build --build-arg, ese valor
# queda embebido en el bundle JS y el placeholder NO es necesario.
ARG VITE_API_URL=__VITE_API_URL_PLACEHOLDER__
ARG VITE_ANALYTICS_URL=__VITE_ANALYTICS_URL_PLACEHOLDER__
ARG VITE_CALENDAR_URL=__VITE_CALENDAR_URL_PLACEHOLDER__
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ANALYTICS_URL=$VITE_ANALYTICS_URL
ENV VITE_CALENDAR_URL=$VITE_CALENDAR_URL

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Serve with Nginx
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Copiar el build de Vite al directorio raíz de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script de entrypoint para reemplazar env vars en runtime.
# Permite cambiar VITE_API_URL sin necesidad de rebuild de imagen.
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
