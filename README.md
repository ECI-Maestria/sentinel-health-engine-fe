# Sentinel Health Engine — Frontend

Aplicación web de monitoreo de salud en tiempo real. Construida con React 18, TypeScript y Vite. Se conecta al backend de microservicios Go desplegado en Azure.

---

## Tabla de contenidos

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Correr en local](#3-correr-en-local)
4. [Conectar con el backend](#4-conectar-con-el-backend)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Build para producción](#6-build-para-producción)
7. [Testing](#7-testing)
8. [CI/CD](#8-cicd)
9. [Desplegar en Azure](#9-desplegar-en-azure)

---

## 1. Estructura del proyecto

```
sentinel-health-engine-fe/
├── src/
│   ├── core/
│   │   └── domain/                  # Entidades y tipos de negocio puro
│   │       ├── auth/                # User, Role, AuthToken, credenciales
│   │       ├── alert/               # AlertRecord, AlertStats
│   │       ├── appointment/         # Citas médicas
│   │       ├── vital/               # VitalReading, VitalSummary
│   │       ├── patient/             # Patient
│   │       ├── medication/          # Medication
│   │       ├── caretaker/           # Caretaker
│   │       ├── doctor/              # Doctor
│   │       └── shared/              # Tipos compartidos
│   ├── application/                 # Casos de uso (React Query hooks)
│   │   ├── auth/                    # useLogin, useLogout, useForgotPassword
│   │   ├── alert/                   # useAlerts, useAlertStats, useAcknowledgeAlert
│   │   ├── appointment/             # useAppointments, useCreateAppointment
│   │   ├── vital/                   # useVitals, useVitalSummary
│   │   ├── patient/                 # usePatients, useCreatePatient
│   │   ├── medication/              # useMedications
│   │   ├── caretaker/               # useCaretakers
│   │   └── doctor/                  # useDoctors
│   ├── infrastructure/
│   │   ├── http/                    # Clientes Axios y repositorios API
│   │   │   ├── client.ts            # Axios con interceptor de token refresh
│   │   │   ├── AuthApiRepository.ts
│   │   │   ├── AlertsApiRepository.ts
│   │   │   ├── AppointmentApiRepository.ts
│   │   │   ├── VitalApiRepository.ts
│   │   │   ├── PatientApiRepository.ts
│   │   │   ├── MedicationApiRepository.ts
│   │   │   ├── CaretakerApiRepository.ts
│   │   │   └── DoctorApiRepository.ts
│   │   └── storage/
│   │       └── TokenStorage.ts      # Persistencia del refresh token en localStorage
│   ├── store/
│   │   └── auth.store.ts            # Estado de autenticación (Zustand)
│   ├── presentation/                # Componentes UI (Atomic Design)
│   │   ├── atoms/                   # Button, Input, Badge, Spinner…
│   │   ├── molecules/               # FormField, OtpInput, AlertCard…
│   │   ├── organisms/               # LoginForm, PatientList, VitalChart…
│   │   ├── templates/               # DashboardLayout, AuthLayout…
│   │   └── pages/                   # Login, Dashboard, Patients, Alerts…
│   ├── lib/
│   │   └── utils.ts                 # cn() helper + env config
│   └── test/
│       └── setup.ts                 # Configuración global de tests
├── public/
│   └── favicon.svg                  # Logo SH verde
├── .github/
│   └── workflows/
│       └── pipeline.yml             # CI/CD: Build → Test → Sonar → Deploy
├── docker-compose.yml               # Frontend local → backend local
├── docker-compose.azure.yml         # Frontend local → backend en Azure
├── docker-compose.local.yml         # Alias de docker-compose.yml
├── Dockerfile                       # Multi-stage: Node build → Nginx serve
├── nginx.conf                       # SPA routing + gzip + health check
├── docker-entrypoint.sh             # Reemplaza env vars en runtime
├── sonar-project.properties         # Configuración SonarCloud
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

La arquitectura sigue **Clean Architecture / Hexagonal**:
- `core/domain` — sin dependencias externas (interfaces y tipos puros)
- `application` — casos de uso implementados como React Query hooks
- `infrastructure` — adaptadores HTTP (Axios), persistencia (localStorage)
- `presentation` — componentes React organizados en Atomic Design

---

## 2. Stack tecnológico

| Categoría | Librería | Versión |
|-----------|----------|:-------:|
| Framework | React | 18.3 |
| Lenguaje | TypeScript | 5.5 |
| Build | Vite | 5.4 |
| Routing | React Router | 6.26 |
| Estado global | Zustand | 4.5 |
| Data fetching | TanStack React Query | 5.56 |
| HTTP | Axios | 1.7 |
| Formularios | React Hook Form + Zod | 7.53 / 3.23 |
| UI | Radix UI + Tailwind CSS | — |
| Testing | Vitest + Testing Library | 2.0 / 16.0 |

---

## 3. Correr en local

### Prerrequisitos

- [Node.js](https://nodejs.org/) 20+ y npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (opcional, para correr con Docker)

### Opción A — Con npm (recomendado para desarrollo)

```bash
cd sentinel-health-engine-fe

# Instalar dependencias
npm install

# Crear archivo de entorno local
cp .env.azure .env.local
# Edita .env.local con las URLs que necesites (ver sección 4)

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Opción B — Con Docker

```bash
# Frontend local → backend local
docker compose up --build

# Frontend local → backend en Azure
docker compose -f docker-compose.azure.yml up --build
```

La app estará disponible en `http://localhost:3000`.

---

## 4. Conectar con el backend

### Backend corriendo en local

```bash
# sentinel-health-engine-fe/.env.local
VITE_API_URL=http://localhost:8080
VITE_ANALYTICS_URL=http://localhost:8084
VITE_CALENDAR_URL=http://localhost:8085
```

Asegúrate de tener el backend levantado:
```bash
# En el directorio del backend
docker compose up --build
```

### Backend en Azure

```bash
# sentinel-health-engine-fe/.env.local
VITE_API_URL=https://user-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io
VITE_ANALYTICS_URL=https://analytics-service.<hash>.centralus.azurecontainerapps.io
VITE_CALENDAR_URL=https://calendar-service.<hash>.centralus.azurecontainerapps.io
```

O usa el archivo preconfigurado:
```bash
docker compose -f docker-compose.azure.yml up --build
```

---

## 5. Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de `user-service` (auth, pacientes, médicos) | `http://localhost:8080` |
| `VITE_ANALYTICS_URL` | URL base de `analytics-service` (historial, alertas) | `http://localhost:8084` |
| `VITE_CALENDAR_URL` | URL base de `calendar-service` (citas) | `http://localhost:8085` |

> Las variables `VITE_*` se embeben en el bundle JS en tiempo de build. Para cambiarlas sin reconstruir la imagen Docker, el `docker-entrypoint.sh` las puede sobrescribir en runtime con `RUNTIME_API_URL`.

---

## 6. Build para producción

```bash
# Verificación TypeScript + build Vite
npm run build

# Vista previa del build
npm run preview
```

El output se genera en `dist/`. La imagen Docker usa multi-stage build:
1. **Stage builder** — `npm ci` + `npm run build`
2. **Stage runner** — Nginx sirve `dist/` con SPA routing, gzip y health check en `/health`

```bash
# Build de la imagen Docker manualmente
docker build \
  --build-arg VITE_API_URL=https://tu-backend.azurecontainerapps.io \
  -t crsentinelhe.azurecr.io/sentinel-fe:latest \
  .
```

---

## 7. Testing

### Correr los tests

```bash
# Tests en modo watch (desarrollo)
npm run test

# Tests una sola vez con reporte de cobertura
npm run test:coverage

# UI visual de Vitest
npm run test:ui
```

### Estructura de tests

Los tests siguen la misma arquitectura que el código fuente:

| Archivo | Qué prueba |
|---------|------------|
| `src/presentation/atoms/Button/Button.test.tsx` | Variantes, estados loading/disabled, onClick |
| `src/presentation/molecules/FormField/FormField.test.tsx` | Renderizado de label, input y error |
| `src/presentation/molecules/OtpInput/OtpInput.test.tsx` | Entrada de dígitos y navegación entre campos |
| `src/presentation/organisms/LoginForm/LoginForm.test.tsx` | Validación Zod, submit, errores de servidor |
| `src/infrastructure/storage/TokenStorage.test.ts` | get / set / clear en localStorage |
| `src/store/auth.store.test.ts` | setTokenPair, setUser, clearAuth, setInitialized |
| `src/lib/cn.test.ts` | Merge de clases Tailwind, valores falsy, conflictos |
| `src/application/alert/useAlerts.test.ts` | Query deshabilitada, fetch con filtro, error state |
| `src/core/domain/auth/User.test.ts` | Role enum y RoleLabels en español |

### Añadir un nuevo test

Crea el archivo junto al componente o hook que prueba:
```
src/presentation/atoms/MiComponente/MiComponente.test.tsx
src/application/patient/usePatients.test.ts
```

Usa el patrón establecido: `vi.mock()` para dependencias externas, `renderHook()` con `QueryClientProvider` para hooks de React Query.

---

## 8. CI/CD

El pipeline está en [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml).

### Etapas

```
🏗️ Build ──► 🧪 Test ──► 🔍 SonarCloud ──► 🚀 Deploy
```

| Etapa | Qué hace | Cuándo corre |
|-------|----------|--------------|
| 🏗️ **Build** | `tsc` + `vite build` | PRs + push a `main` |
| 🧪 **Test** | `vitest run --coverage` | Solo si Build pasa |
| 🔍 **SonarCloud** | Análisis estático + cobertura | Solo si Test pasa |
| 🚀 **Deploy** | Build imagen Docker → push ACR → `az containerapp update` | Solo si Sonar pasa **y** es push a `main` |

Si cualquier etapa falla, las siguientes se cancelan (`fail-fast: true`).

### Secretos requeridos en GitHub

| Secret | Descripción |
|--------|-------------|
| `AZURE_CREDENTIALS` | JSON del service principal (mismo que el backend) |
| `SONAR_TOKEN` | Token de SonarCloud |
| `VITE_API_URL` | URL del user-service en Azure |
| `VITE_ANALYTICS_URL` | URL del analytics-service en Azure |
| `VITE_CALENDAR_URL` | URL del calendar-service en Azure |

### Configurar SonarCloud

1. Ve a [sonarcloud.io](https://sonarcloud.io) → **"Analyze new project"**
2. Importa `ECI-Maestria/sentinel-health-engine-fe`
3. Desactiva **"Automatic Analysis"** → Administration → Analysis Method
4. Copia el **Project Key** y **Organization Key** y verifica que coincidan con [`sonar-project.properties`](sonar-project.properties)
5. Añade el `SONAR_TOKEN` como secreto en GitHub

---

## 9. Desplegar en Azure

### Primera vez — crear el Container App del frontend

```bash
ACR="crsentinelhe"
RG="rg-sentinel-health-engine"
CAE="cae-sentinel-he"
IMAGE="${ACR}.azurecr.io/sentinel-fe:latest"

# Login y build
az acr login --name "$ACR"
docker build \
  --build-arg VITE_API_URL=https://user-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io \
  --build-arg VITE_ANALYTICS_URL=https://analytics-service.<hash>.centralus.azurecontainerapps.io \
  --build-arg VITE_CALENDAR_URL=https://calendar-service.<hash>.centralus.azurecontainerapps.io \
  -t "$IMAGE" .
docker push "$IMAGE"

# Crear Container App
az containerapp create \
  --name sentinel-fe \
  --resource-group "$RG" \
  --environment "$CAE" \
  --image "$IMAGE" \
  --registry-server "${ACR}.azurecr.io" \
  --registry-username "$ACR" \
  --registry-password "$(az acr credential show --name $ACR --query passwords[0].value -o tsv)" \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 --max-replicas 2 \
  --cpu 0.25 --memory 0.5Gi
```

### Actualización manual

```bash
TAG=$(git rev-parse --short HEAD)
IMAGE="crsentinelhe.azurecr.io/sentinel-fe:${TAG}"

az acr login --name crsentinelhe
docker build -t "$IMAGE" .
docker push "$IMAGE"

az containerapp update \
  --name sentinel-fe \
  --resource-group rg-sentinel-health-engine \
  --image "$IMAGE"
```

### Obtener la URL pública

```bash
az containerapp show \
  --name sentinel-fe \
  --resource-group rg-sentinel-health-engine \
  --query properties.configuration.ingress.fqdn -o tsv
```

---

## Prerrequisitos generales

| Herramienta | Versión mínima | Verificar |
|-------------|:--------------:|-----------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Docker Desktop | 4.x | `docker --version` |
| Azure CLI | 2.55+ | `az --version` |
