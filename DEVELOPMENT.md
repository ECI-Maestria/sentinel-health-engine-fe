# Sentinel Health Engine — Frontend Development Guide

Guía completa para desarrollar, correr y desplegar el frontend de Sentinel Health Engine.

---

## 1. Prerrequisitos

| Herramienta | Versión requerida | Instalación |
|---|---|---|
| Node.js | v24.14.0 | [nodejs.org](https://nodejs.org) o `nvm install 24` |
| Docker Desktop | >= 4.x | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| Azure CLI | >= 2.60 | `winget install Microsoft.AzureCLI` o [docs.microsoft.com](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) |
| Git | >= 2.x | [git-scm.com](https://git-scm.com) |

Verificar instalaciones:

```bash
node --version      # v24.x.x
docker --version    # Docker version 4.x.x
az --version        # azure-cli 2.x.x
```

Acceso al ACR de Azure (necesario solo para deploy):

```bash
az login
az acr login --name crsentinelhe
```

---

## 2. Instalación local

```bash
cd sentinel-health-engine-fe
npm install
```

Crear el archivo de variables de entorno para desarrollo local:

```bash
# .env.local — NO commitear, ya está en .gitignore
echo "VITE_API_URL=http://localhost:8080" > .env.local
```

---

## 3. Entornos de desarrollo

El proyecto soporta cinco modos de desarrollo. Elige el que mejor se adapte a tu flujo de trabajo.

### 3.1 Desarrollo puro — Vite dev server + backend local (Go nativo)

El modo más rápido para desarrollo activo. Hot Module Replacement (HMR) instantáneo.

```bash
# Terminal 1: Backend Go
cd sentinel-health-engine-be/services/user-service
go run ./cmd/server/...
# Backend escucha en http://localhost:8080

# Terminal 2: Frontend (desde sentinel-health-engine-fe)
npm run dev
# Vite dev server en http://localhost:5173
```

Abre: [http://localhost:5173](http://localhost:5173)

La variable `VITE_API_URL` se lee desde `.env.local`. Asegúrate de tener:

```bash
# .env.local
VITE_API_URL=http://localhost:8080
```

### 3.2 Frontend en Docker + Backend local (Go nativo)

Útil para probar que la imagen Docker del frontend funciona correctamente
antes de hacer push al ACR.

```bash
# Terminal 1: Backend Go
cd sentinel-health-engine-be/services/user-service
go run ./cmd/server/...

# Terminal 2: Frontend Docker (desde sentinel-health-engine-fe)
docker compose -f docker-compose.local.yml up --build
```

Abre: [http://localhost:3000](http://localhost:3000)

`host.docker.internal` resuelve a la IP del host desde dentro del contenedor,
permitiendo que el frontend en Docker alcance el backend Go que corre en el host.

### 3.3 Frontend en Docker + Backend en Docker

Simula el entorno de producción de forma más fiel. Requiere que ambos
servicios estén corriendo en Docker.

```bash
# Terminal 1: Backend en Docker
cd sentinel-health-engine-be
docker compose up --build user-service
# Backend expone el puerto 8080 en el host

# Terminal 2: Frontend en Docker (desde sentinel-health-engine-fe)
cd sentinel-health-engine-fe
docker compose up --build
```

Abre: [http://localhost:3000](http://localhost:3000)

### 3.4 Frontend en Docker apuntando a Azure (backend en la nube)

Prueba el frontend con el backend de producción en Azure. No requiere
correr el backend localmente.

```bash
# Desde sentinel-health-engine-fe
docker compose -f docker-compose.azure.yml up --build
```

Abre: [http://localhost:3000](http://localhost:3000)

> **Nota sobre CORS:** El backend en Azure debe permitir el origen
> `http://localhost:3000`. Esto está configurado en `ALLOWED_ORIGINS` del
> `user-service`. El script `deploy-web.sh` actualiza esto automáticamente.

### 3.5 Vite dev server apuntando a Azure (backend en la nube)

El modo más ligero para probar contra el backend de Azure sin Docker.

```bash
# Crear un archivo temporal de entorno apuntando a Azure
echo "VITE_API_URL=https://user-service.yellowmeadow-4dfba13a.centralus.azurecontainerapps.io" > .env.local

npm run dev
```

Abre: [http://localhost:5173](http://localhost:5173)

> **Importante:** Recuerda restaurar `.env.local` con `http://localhost:8080`
> cuando vuelvas a desarrollo local.

---

## 4. Despliegue en Azure

El frontend se despliega como un Azure Container App llamado `web-service`,
sirviendo la SPA compilada a través de Nginx.

### 4.1 Primera vez — Provisioning

Ejecutar solo una vez para crear el Container App en Azure:

```bash
# Autenticarse con Azure
az login

# Desde sentinel-health-engine-fe
bash scripts/provision-web.sh
```

El script:
1. Hace login al ACR `crsentinelhe.azurecr.io`
2. Construye y pushea una imagen placeholder mínima
3. Crea el Container App `web-service` con ingress externo en puerto 80
4. Muestra la URL pública asignada por Azure

### 4.2 Deploys posteriores

Para cada nuevo deploy (después de cambios en el código):

```bash
# Desde sentinel-health-engine-fe
bash scripts/deploy-web.sh
```

El script hace las siguientes acciones en orden:

1. **Login al ACR** — `az acr login --name crsentinelhe`
2. **Build de imagen** — Con `VITE_API_URL` del backend en Azure embebida en el bundle JS
3. **Push al ACR** — Tag con timestamp `YYYYMMDDHHMMSS` para identificar el deploy
4. **Update del Container App** — Actualiza la imagen en `web-service`
5. **Update de CORS** — Actualiza solo `ALLOWED_ORIGINS` en `user-service` (con `--set-env-vars`, no `--replace-env-vars`) para no borrar `DATABASE_URL` ni otras variables

#### Rollback

Si un deploy introduce un bug, hacer rollback a un tag anterior:

```bash
# Listar tags disponibles en el ACR
az acr repository show-tags \
  --name crsentinelhe \
  --repository web-service \
  --orderby time_desc \
  --output table

# Revertir a un tag específico
az containerapp update \
  --name web-service \
  --resource-group rg-sentinel-health-engine \
  --image crsentinelhe.azurecr.io/web-service:<tag-anterior>
```

---

## 5. Tests

El proyecto usa [Vitest](https://vitest.dev/) con `@testing-library/react`.

```bash
# Modo watch (desarrollo activo)
npm run test

# UI interactiva de Vitest en el browser
npm run test:ui

# Reporte de cobertura (genera ./coverage/)
npm run test:coverage
```

Los archivos de test siguen la convención `*.test.ts` o `*.test.tsx` y
se ubican junto a los archivos que testean (co-location) o en `src/test/`.

Setup global de tests: `src/test/setup.ts`

---

## 6. Variables de entorno

### Build time (Vite)

Las variables `VITE_*` son reemplazadas por sus valores en el bundle JS
durante `npm run build`. Solo están disponibles en el código del cliente.

| Variable | Descripción | Valor local | Valor Azure (build) |
|---|---|---|---|
| `VITE_API_URL` | URL base del `user-service` | `http://localhost:8080` | URL del Container App en Azure |

Archivos de entorno (Vite los carga en orden de prioridad):
- `.env.local` — variables locales, no commitear (en `.gitignore`)
- `.env` — valores por defecto para todos los entornos, se puede commitear
- `.env.docker` — valores para builds de Docker, se puede commitear

### Runtime (Docker)

Las variables de runtime se inyectan en el contenedor y `docker-entrypoint.sh`
las procesa antes de iniciar Nginx.

| Variable | Descripción | Cuándo usarla |
|---|---|---|
| `RUNTIME_API_URL` | Sobreescribe `VITE_API_URL` en el bundle JS sin rebuild | Para cambiar el backend sin rebuild de imagen |

#### Cómo funciona el override en runtime

Cuando la imagen se buildea sin `VITE_API_URL` (usando el valor por defecto
del Dockerfile), el bundle JS contiene el placeholder literal:

```
__VITE_API_URL_PLACEHOLDER__
```

Al iniciar el contenedor, `docker-entrypoint.sh` reemplaza ese placeholder
con el valor de `RUNTIME_API_URL` usando `sed`. Esto permite usar la misma
imagen en múltiples entornos (staging, producción) sin rebuild.

Si la imagen se buildea con `VITE_API_URL` explícito (como hace `deploy-web.sh`),
el placeholder no existe en el bundle y `RUNTIME_API_URL` no tiene efecto.

---

## 7. Arquitectura del proyecto

### Clean Architecture

El código fuente en `src/` sigue los principios de Clean Architecture,
separando responsabilidades en capas con dependencias unidireccionales
(las capas externas dependen de las internas, nunca al revés):

```
src/
├── core/           # Entidades y casos de uso — sin dependencias externas
│   ├── domain/     # Tipos, interfaces, entidades de negocio (User, etc.)
│   └── usecases/   # Lógica de aplicación pura (sin framework)
│
├── application/    # Orquestación: conecta casos de uso con la UI
│   ├── hooks/      # Custom React hooks (useAuth, usePatients, etc.)
│   └── services/   # Servicios de aplicación
│
├── infrastructure/ # Implementaciones concretas: HTTP, storage, etc.
│   └── http/       # Clientes Axios, repositorios HTTP
│
├── presentation/   # UI: componentes, páginas, estilos
│   ├── pages/      # Páginas (una por ruta)
│   └── components/ # Componentes reutilizables (Atomic Design)
│
├── store/          # Estado global con Zustand
├── app/            # Router, providers, configuración de la app
└── test/           # Setup de tests y utilidades compartidas
```

**Regla de dependencias:** `presentation` → `application` → `core` ← `infrastructure`

La capa `core` define interfaces (puertos) que `infrastructure` implementa
(adaptadores), siguiendo el patrón Ports & Adapters (Hexagonal Architecture).

### Atomic Design

Los componentes en `src/presentation/components/` siguen Atomic Design:

```
components/
├── atoms/      # Elementos básicos: Button, Input, Label, Badge
├── molecules/  # Combinaciones de átomos: FormField, Card, Modal
├── organisms/  # Secciones completas: LoginForm, PatientTable, Navbar
└── ui/         # Componentes de shadcn/ui (generados, no modificar)
```

Este sistema de componentes facilita la reutilización y el testing unitario
de cada nivel de abstracción de forma independiente.

### Stack tecnológico

| Categoría | Tecnología | Propósito |
|---|---|---|
| Framework | React 18 + TypeScript | UI declarativa con tipado estático |
| Build tool | Vite 5 | Dev server con HMR y build optimizado |
| Routing | React Router DOM v6 | Navegación SPA del lado del cliente |
| State server | TanStack Query v5 | Cache y sincronización de datos del servidor |
| State client | Zustand | Estado global ligero (auth, UI) |
| HTTP | Axios | Cliente HTTP con interceptors para auth |
| Forms | React Hook Form + Zod | Formularios con validación tipada |
| Styling | Tailwind CSS v3 | Utility-first CSS |
| Components | shadcn/ui + Radix UI | Componentes accesibles sin estilos forzados |
| Testing | Vitest + Testing Library | Tests unitarios e integración de componentes |
| Servidor | Nginx 1.27 Alpine | Servidor de archivos estáticos en producción |
| Container | Docker multi-stage | Imagen optimizada para producción |
| Cloud | Azure Container Apps | Hosting serverless con auto-scaling |

---

## 8. Troubleshooting

### Los campos del formulario muestran "Required" aunque estén llenos

**Causa:** Los componentes `Input` y `Button` no usaban `React.forwardRef`.
React Hook Form registra cada campo mediante un `ref` que adjunta al elemento
`<input>` del DOM real. Sin `forwardRef`, ese `ref` nunca llega al DOM, por lo
que RHF no puede leer el valor del campo en el momento del submit y trata todos
los campos como vacíos.

**Fix aplicado (v0.1.1):**
- `src/presentation/atoms/Input/Input.tsx` — convertido a `forwardRef<HTMLInputElement, InputProps>`
- `src/presentation/atoms/Button/Button.tsx` — convertido a `forwardRef<HTMLButtonElement, ButtonProps>` (necesario para el patrón `asChild` con Radix Slot)

**Regla general:** Todo componente que envuelva un elemento nativo (`<input>`,
`<button>`, `<textarea>`) y que pueda recibir un `ref` externo **debe** usar
`React.forwardRef` y pasarlo al elemento subyacente.

### El backend responde con CORS error

El frontend en Azure genera un origen como `https://web-service.<hash>.centralus.azurecontainerapps.io`.
Ese origen debe estar en `ALLOWED_ORIGINS` del `user-service`. El script
`deploy-web.sh` lo actualiza automáticamente en el paso 4. Si el error persiste:

```bash
# Verificar el valor actual de ALLOWED_ORIGINS
az containerapp show \
  --name user-service \
  --resource-group rg-sentinel-health-engine \
  --query "properties.template.containers[0].env[?name=='ALLOWED_ORIGINS'].value" \
  -o tsv

# Actualizarlo manualmente si es necesario
az containerapp update \
  --name user-service \
  --resource-group rg-sentinel-health-engine \
  --replace-env-vars "ALLOWED_ORIGINS=https://web-service.<tu-hash>.centralus.azurecontainerapps.io,http://localhost:3000,http://localhost:5173"
```

### El `user-service` arranca con error `DATABASE_URL env var is required`

**Causa:** El script `deploy-web.sh` usaba `--replace-env-vars` al actualizar
`ALLOWED_ORIGINS` en el `user-service`. La flag `--replace-env-vars` reemplaza
**todas** las variables del contenedor, borrando `DATABASE_URL`, `JWT_SECRET`,
`INTERNAL_API_KEY`, etc.

**Fix aplicado (v0.1.1):** Cambiado a `--set-env-vars`, que solo actualiza las
variables indicadas sin tocar las demás.

**Regla:** Nunca usar `--replace-env-vars` para actualizar una sola variable.
Solo usarlo cuando se quiere especificar el set completo de variables (como en
`deploy-user-service.sh`, donde sí se leen y pasan todas las variables desde
Key Vault).

**Recuperación manual** si el `user-service` queda sin variables (volver a
desplegar el backend completo):

```bash
cd sentinel-health-engine-be
bash scripts/deploy-user-service.sh
```

Esto releerá todos los secretos desde Key Vault y los volverá a pasar al
Container App correctamente.

---

### El token de sesión no persiste al refrescar la página

Comportamiento esperado: el `accessToken` vive solo en memoria (Zustand).
Al refrescar, `AuthInitializer` en `providers.tsx` llama automáticamente al
endpoint `/v1/auth/refresh` usando el `refreshToken` guardado en `localStorage`.
Si la sesión se pierde tras un refresh, verificar que `localStorage` no esté
bloqueado (modo privado) y que el `refreshToken` no haya expirado (7 días).
