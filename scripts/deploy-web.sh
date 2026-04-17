#!/usr/bin/env bash
# =============================================================================
# deploy-web.sh — Build, push and deploy the web frontend to Azure Container Apps.
#
# Uso: ejecutar desde el directorio raíz de sentinel-health-engine-fe
#   bash scripts/deploy-web.sh
#
# Prerequisitos:
#   - Azure CLI instalado y autenticado (az login)
#   - Docker Desktop corriendo
#   - Acceso al ACR crsentinelhe.azurecr.io
#   - El Container App web-service debe existir (correr provision-web.sh primero)
#
# Qué hace este script:
#   1. Buildea la imagen Docker con VITE_API_URL del backend en Azure (build time)
#   2. Hace push de la imagen al ACR con tag timestamp (YYYYMMDDHHMMSS)
#   3. Actualiza el Container App si ya existe, o lo crea si es la primera vez
#   4. Actualiza el CORS del user-service para incluir la URL del web-service
#
# Design decisions:
#   - Tag con timestamp: evita colisiones y facilita rollback (az containerapp
#     update --image <tag-anterior> para revertir).
#   - VITE_API_URL en build time: el bundle JS lleva la URL embebida, lo que
#     mejora performance (no hay lookup en runtime para la URL base).
#   - RUNTIME_API_URL también se pasa: permite cambiar la URL del backend
#     sin rebuild en caso de emergencia usando docker-entrypoint.sh.
#   - Actualización de CORS automática: garantiza que el backend siempre
#     permita el origen del frontend recién desplegado.
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuración de la infraestructura Azure
# ---------------------------------------------------------------------------
RG="rg-sentinel-health-engine"
ACR="crsentinelhe"
CONTAINER_ENV="cae-sentinel-he"
APP_NAME="web-service"
API_URL="https://user-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io"
ANALYTICS_URL="https://analytics-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io"
CALENDAR_URL="https://calendar-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io"

# Tag con timestamp para identificar unívocamente cada deploy y facilitar rollback
TAG=$(date +%Y%m%d%H%M%S)
IMAGE="${ACR}.azurecr.io/${APP_NAME}:${TAG}"

echo "============================================================"
echo "  Deploying ${APP_NAME} to Azure Container Apps"
echo "  Image: ${IMAGE}"
echo "  API URL:      ${API_URL}"
echo "  Analytics URL: ${ANALYTICS_URL}"
echo "  Calendar URL:  ${CALENDAR_URL}"
echo "============================================================"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Login al ACR y build de la imagen
# ---------------------------------------------------------------------------
echo ">>> [1/4] Logging into ACR and building image..."
az acr login --name "$ACR"

docker build \
  --build-arg VITE_API_URL="${API_URL}" \
  --build-arg VITE_ANALYTICS_URL="${ANALYTICS_URL}" \
  --build-arg VITE_CALENDAR_URL="${CALENDAR_URL}" \
  -t "$IMAGE" \
  -f Dockerfile \
  .

echo ""

# ---------------------------------------------------------------------------
# Step 2: Push al ACR
# ---------------------------------------------------------------------------
echo ">>> [2/4] Pushing image to ACR..."
docker push "$IMAGE"
echo ""

# ---------------------------------------------------------------------------
# Step 3: Deploy del Container App
# Si el Container App ya existe → update
# Si no existe → create (útil como alternativa a provision-web.sh)
# ---------------------------------------------------------------------------
echo ">>> [3/4] Deploying ${APP_NAME} to Container Apps..."

if az containerapp show --name "$APP_NAME" --resource-group "$RG" &>/dev/null; then
  echo "    Container App exists, updating..."
  az containerapp update \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --image "$IMAGE" \
    --replace-env-vars \
      "RUNTIME_API_URL=${API_URL}" \
      "RUNTIME_ANALYTICS_URL=${ANALYTICS_URL}" \
      "RUNTIME_CALENDAR_URL=${CALENDAR_URL}"
else
  echo "    Container App not found, creating..."
  az containerapp create \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --environment "$CONTAINER_ENV" \
    --image "$IMAGE" \
    --registry-server "${ACR}.azurecr.io" \
    --min-replicas 1 \
    --max-replicas 2 \
    --ingress external \
    --target-port 80 \
    --env-vars \
      "RUNTIME_API_URL=${API_URL}" \
      "RUNTIME_ANALYTICS_URL=${ANALYTICS_URL}" \
      "RUNTIME_CALENDAR_URL=${CALENDAR_URL}"
fi

echo ""

# ---------------------------------------------------------------------------
# Step 4: Obtener la URL del web-service y actualizar CORS del user-service
# ---------------------------------------------------------------------------
echo ">>> [4/4] Retrieving web-service URL and updating user-service CORS..."

WEB_FQDN=$(az containerapp show \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --query "properties.configuration.ingress.fqdn" \
  -o tsv)

WEB_URL="https://${WEB_FQDN}"

# Actualizar SOLO la variable ALLOWED_ORIGINS en el user-service sin tocar las demás.
# IMPORTANTE: usar --set-env-vars (no --replace-env-vars).
#   --replace-env-vars reemplaza TODAS las variables del contenedor, borrando
#   DATABASE_URL, JWT_SECRET, etc. y dejando el servicio sin base de datos.
#   --set-env-vars solo añade o actualiza las variables indicadas.
ALLOWED_ORIGINS="${WEB_URL},http://localhost:3000,http://localhost:5173"

az containerapp update \
  --name user-service \
  --resource-group "$RG" \
  --set-env-vars \
    "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

echo ">>> Updating CORS for analytics-service..."
az containerapp update \
  --name analytics-service \
  --resource-group "$RG" \
  --set-env-vars \
    "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

echo ">>> Updating CORS for calendar-service..."
az containerapp update \
  --name calendar-service \
  --resource-group "$RG" \
  --set-env-vars \
    "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

echo ""
echo "============================================================"
echo "  Deployment complete!"
echo ""
echo "  web-service URL : ${WEB_URL}"
echo "  Image tag       : ${TAG}"
echo ""
echo "  Rollback command:"
echo "    az containerapp update \\"
echo "      --name ${APP_NAME} \\"
echo "      --resource-group ${RG} \\"
echo "      --image ${ACR}.azurecr.io/${APP_NAME}:<previous-tag>"
echo "============================================================"
