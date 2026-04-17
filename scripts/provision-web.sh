#!/usr/bin/env bash
# =============================================================================
# provision-web.sh — One-time provisioning of web Container App resources.
#
# Uso: ejecutar UNA SOLA VEZ antes del primer deploy.
#   bash scripts/provision-web.sh
#
# Prerequisitos:
#   - Azure CLI instalado y autenticado (az login)
#   - Docker Desktop corriendo
#   - Acceso al ACR crsentinelhe.azurecr.io
#   - Resource Group y Container App Environment ya existentes
#     (fueron creados para el backend)
#
# Qué hace este script:
#   1. Hace login al ACR
#   2. Buildea y pushea una imagen placeholder mínima (Nginx con HTML estático)
#   3. Crea el Container App web-service con ingress externo en puerto 80
#   4. Muestra la URL pública asignada por Azure
#
# Design decisions:
#   - Imagen placeholder: Azure Container Apps requiere una imagen válida para
#     crear el recurso. En lugar de usar una imagen pública de Docker Hub
#     (que podría no estar disponible o cambiar), construimos una imagen
#     mínima en nuestro propio ACR. Esto garantiza que el ACR tiene permisos
#     configurados correctamente antes del primer deploy real.
#   - min-replicas 1: garantiza que siempre hay al menos una instancia activa
#     (cold start = 0 para el frontend no es deseable en producción).
#   - max-replicas 2: límite conservador para el proyecto académico; ajustar
#     según carga esperada en producción.
#   - ingress external: el frontend debe ser accesible públicamente desde
#     internet, a diferencia de servicios internos del backend.
#
# Después de correr este script:
#   bash scripts/deploy-web.sh
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuración de la infraestructura Azure
# ---------------------------------------------------------------------------
RG="rg-sentinel-health-engine"
ACR="crsentinelhe"
CONTAINER_ENV="cae-sentinel-he"
API_URL="https://user-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io"

echo "============================================================"
echo "  Provisioning web-service Container App (one-time setup)"
echo "  Resource Group  : ${RG}"
echo "  ACR             : ${ACR}.azurecr.io"
echo "  Environment     : ${CONTAINER_ENV}"
echo "============================================================"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Login al ACR
# ---------------------------------------------------------------------------
echo ">>> [1/3] Logging into ACR..."
az acr login --name "$ACR"
echo ""

# ---------------------------------------------------------------------------
# Step 2: Construir y pushear una imagen placeholder mínima
# El Container App requiere una imagen válida en el ACR para ser creado.
# Usamos un directorio temporal para no contaminar el workspace.
# ---------------------------------------------------------------------------
echo ">>> [2/3] Building and pushing placeholder image..."

TMPDIR=$(mktemp -d)
trap "rm -rf ${TMPDIR}" EXIT  # limpiar al terminar

# HTML mínimo de placeholder
cat > "${TMPDIR}/index.html" <<'HTML'
<!doctype html>
<html lang="es">
  <head><meta charset="UTF-8"><title>Sentinel Health Engine</title></head>
  <body>
    <h1>Sentinel Health Engine</h1>
    <p>Deploying application, please wait...</p>
  </body>
</html>
HTML

# Dockerfile mínimo para el placeholder
cat > "${TMPDIR}/Dockerfile.placeholder" <<'DOCKEREOF'
FROM nginx:1.27-alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
DOCKEREOF

PLACEHOLDER_IMAGE="${ACR}.azurecr.io/web-service:init"

docker build \
  -t "${PLACEHOLDER_IMAGE}" \
  -f "${TMPDIR}/Dockerfile.placeholder" \
  "${TMPDIR}"

docker push "${PLACEHOLDER_IMAGE}"

echo "    Placeholder image pushed: ${PLACEHOLDER_IMAGE}"
echo ""

# ---------------------------------------------------------------------------
# Step 3: Crear el Container App
# ---------------------------------------------------------------------------
echo ">>> [3/3] Creating web-service Container App..."

az containerapp create \
  --name web-service \
  --resource-group "$RG" \
  --environment "$CONTAINER_ENV" \
  --image "${PLACEHOLDER_IMAGE}" \
  --registry-server "${ACR}.azurecr.io" \
  --min-replicas 1 \
  --max-replicas 2 \
  --ingress external \
  --target-port 80 \
  --env-vars \
    "RUNTIME_API_URL=${API_URL}"

echo ""

# ---------------------------------------------------------------------------
# Obtener y mostrar la URL asignada por Azure
# ---------------------------------------------------------------------------
WEB_FQDN=$(az containerapp show \
  --name web-service \
  --resource-group "$RG" \
  --query "properties.configuration.ingress.fqdn" \
  -o tsv)

WEB_URL="https://${WEB_FQDN}"

echo "============================================================"
echo "  Provisioning complete!"
echo ""
echo "  web-service URL: ${WEB_URL}"
echo "  (Showing placeholder page until first real deploy)"
echo ""
echo "  Next step — run the first real deploy:"
echo "    bash scripts/deploy-web.sh"
echo "============================================================"
