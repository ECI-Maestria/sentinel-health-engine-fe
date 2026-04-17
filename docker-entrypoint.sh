#!/bin/sh
# =============================================================================
# docker-entrypoint.sh — sentinel-health-engine-fe
#
# Propósito: permitir la inyección de variables de entorno en runtime,
# sin necesidad de rebuilding la imagen Docker.
#
# Problema que resuelve:
#   Vite compila las variables de entorno (VITE_*) en el bundle JS en build
#   time. Normalmente, cambiar la URL del backend requeriría rebuilding la
#   imagen. Este script evita ese costo reemplazando un placeholder en los
#   archivos JS ya compilados antes de que Nginx empiece a servir.
#
# Cómo funciona:
#   1. En build time (Dockerfile), si no se provee VITE_API_URL, el valor
#      por defecto es el string literal "__VITE_API_URL_PLACEHOLDER__".
#      Este string queda embebido en los archivos .js del bundle.
#   2. En runtime (al iniciar el contenedor), si la variable RUNTIME_API_URL
#      está definida, este script la sustituye en todos los archivos .js.
#   3. Finalmente se ejecuta el CMD original: nginx -g "daemon off;"
#
# Uso:
#   - Definir RUNTIME_API_URL en docker-compose o en el Container App de Azure.
#   - Si RUNTIME_API_URL NO está definida, el bundle usa el valor que tenía
#     VITE_API_URL al momento del build (comportamiento estándar de Vite).
#
# Prerequisito en vite.config.ts (o en el código fuente):
#   El código que consume la URL del API debe leer import.meta.env.VITE_API_URL.
#   Ejemplo en src/infrastructure/http/apiClient.ts:
#     const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
#   Si VITE_API_URL no fue seteada al buildear (usa el default del Dockerfile),
#   el bundle contendrá "__VITE_API_URL_PLACEHOLDER__" como string, y este
#   script lo reemplazará por RUNTIME_API_URL.
#
# Limitaciones:
#   - Solo funciona si el placeholder exacto está en el bundle JS.
#   - No funciona con import.meta.env en archivos CSS (Vite no los procesa igual).
#   - El reemplazo es en texto plano con sed; URLs con caracteres especiales
#     pueden necesitar escape. Las URLs http/https estándar funcionan sin problema.
# =============================================================================
set -e

# Si se provee RUNTIME_API_URL, reemplaza el placeholder en el JS compilado.
# El find busca en todos los subdirectorios de /usr/share/nginx/html
# para cubrir el caso en que Vite genere assets en subdirectorios.
if [ -n "$RUNTIME_API_URL" ]; then
  echo "[entrypoint] Injecting RUNTIME_API_URL: ${RUNTIME_API_URL}"
  find /usr/share/nginx/html -name "*.js" -exec \
    sed -i "s|__VITE_API_URL_PLACEHOLDER__|${RUNTIME_API_URL}|g" {} \;
  echo "[entrypoint] RUNTIME_API_URL injection complete."
else
  echo "[entrypoint] RUNTIME_API_URL not set, using build-time VITE_API_URL."
fi

if [ -n "$RUNTIME_ANALYTICS_URL" ]; then
  echo "[entrypoint] Injecting RUNTIME_ANALYTICS_URL: ${RUNTIME_ANALYTICS_URL}"
  find /usr/share/nginx/html -name "*.js" -exec \
    sed -i "s|__VITE_ANALYTICS_URL_PLACEHOLDER__|${RUNTIME_ANALYTICS_URL}|g" {} \;
  echo "[entrypoint] RUNTIME_ANALYTICS_URL injection complete."
else
  echo "[entrypoint] RUNTIME_ANALYTICS_URL not set, using build-time VITE_ANALYTICS_URL."
fi

if [ -n "$RUNTIME_CALENDAR_URL" ]; then
  echo "[entrypoint] Injecting RUNTIME_CALENDAR_URL: ${RUNTIME_CALENDAR_URL}"
  find /usr/share/nginx/html -name "*.js" -exec \
    sed -i "s|__VITE_CALENDAR_URL_PLACEHOLDER__|${RUNTIME_CALENDAR_URL}|g" {} \;
  echo "[entrypoint] RUNTIME_CALENDAR_URL injection complete."
else
  echo "[entrypoint] RUNTIME_CALENDAR_URL not set, using build-time VITE_CALENDAR_URL."
fi

# Ejecutar el CMD del Dockerfile: nginx -g "daemon off;"
exec "$@"
