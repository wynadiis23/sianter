# Deployment Setup Template (Docker + GitHub Actions)

A ready-to-paste prompt for an AI agent to replicate this project's deployment
pattern in a **different** repository or technology stack.

The agent should adapt the implementation to the target repository while keeping
the deployment architecture, Docker topology, and CI/CD workflow identical.

---

# Reference Topology

- Monorepo:
  - `backend/`
  - `frontend/`
- Multi-stage Docker builds
- Images published to **GitHub Container Registry (GHCR)**
- Two deployment environments:
  - **staging** → deployed from the staging branch
  - **production** → deployed from `main`
- GitHub-hosted runner builds and pushes Docker images
- Self-hosted runner on the server pulls and deploys containers
- Containers join a shared **external Docker network**
- Frontend (Nginx) is the only public entry point and proxies `/api/` to the backend

---

# Configuration

Fill these values before using this prompt.

| Key | Value |
|------|-------|
| OWNER / GHCR namespace | `<your-org>` |
| IMAGE_BASE | `ghcr.io/<OWNER>/<IMAGE_BASE>-backend` and `ghcr.io/<OWNER>/<IMAGE_BASE>-frontend` |
| STAGING branch | `<dev>` |
| PRODUCTION branch | `<main>` |
| EXTERNAL DOCKER NETWORK | `<infra-network>` |
| SELF_HOSTED RUNNER LABEL | `<runner-label>` |
| BACKEND PORT | `<5000>` |
| FRONTEND PORT | `80` |

---

# Task Prompt

```text
You are setting up a Docker + GitHub Actions deployment for THIS repository.

The deployment architecture must match a reference project, but all implementation
details must be adapted to THIS repository's technology stack.

Do NOT blindly copy framework-specific code (Flask, Gunicorn, Alembic, Vite, etc.).
Instead, generate the equivalent implementation for the target framework.

--------------------------------------------------------------------
1. backend/Dockerfile
--------------------------------------------------------------------

Requirements:

- Use an official production-ready base image.
- Install dependencies before copying application code for Docker layer caching.
- Copy backend/entrypoint.sh.
- entrypoint.sh must:
  - run database migrations (if applicable)
  - start the production server
  - bind to 0.0.0.0:<BACKEND_PORT>
- Make the script executable.
- Expose <BACKEND_PORT>.
- Use:

    CMD ["./entrypoint.sh"]

--------------------------------------------------------------------
2. frontend/Dockerfile
--------------------------------------------------------------------

Use a multi-stage build.

Build stage:

- Install dependencies.
- Copy source code.
- Accept runtime configuration through Docker build arguments.
- Build the production assets.

Runtime stage:

- Use nginx:alpine.
- Copy build output into:

    /usr/share/nginx/html

- Copy nginx.conf into:

    /etc/nginx/conf.d/default.conf

- Expose port 80.
- Start nginx with:

    CMD ["nginx","-g","daemon off;"]

--------------------------------------------------------------------
3. frontend/nginx.conf
--------------------------------------------------------------------

Configure Nginx to:

- listen on port 80
- serve the frontend
- proxy:

    /api/

to

    http://backend:<BACKEND_PORT>/api/

Include:

- Host
- X-Real-IP
- X-Forwarded-For
- X-Forwarded-Proto

Set:

    client_max_body_size 16m;

SPA fallback:

    try_files $uri $uri/ /index.html;

--------------------------------------------------------------------
4. .dockerignore
--------------------------------------------------------------------

Create one for both backend and frontend.

Ignore:

- node_modules/
- venv/
- dist/
- build/
- __pycache__/
- *.pyc
- .env*
- .git
- .gitignore
- .idea/
- .vscode/
- *.log
- *.db
- *.sqlite
- example/
- samples/

Frontend configuration must be supplied through Docker build arguments,
not .env files.

--------------------------------------------------------------------
5. Docker Compose
--------------------------------------------------------------------

Create:

- deploy/docker-compose.staging.yml
- deploy/docker-compose.prod.yml

Backend:

- image:

    ghcr.io/<OWNER>/<IMAGE_BASE>-backend:{staging|prod}

- restart: unless-stopped
- env_file: .env.{staging|prod}
- join the external Docker network

Frontend:

- image:

    ghcr.io/<OWNER>/<IMAGE_BASE>-frontend:{staging|prod}

- restart: unless-stopped
- depends_on backend
- join the external Docker network

Networks:

    external: true

Keep container naming consistent across both environments.

--------------------------------------------------------------------
6. GitHub Actions
--------------------------------------------------------------------

Create:

    .github/workflows/deploy.yml

Trigger:

- staging branch
- production branch

Environment variables:

- REGISTRY=ghcr.io
- BACKEND_IMAGE
- FRONTEND_IMAGE

Jobs

A. build-and-deploy

- runs-on: ubuntu-latest
- permissions:
    - contents: read
    - packages: write
- checkout
- login to GHCR
- build backend
- push backend
- build frontend
- push frontend
- compute deployment target:
    - production when branch == main
    - otherwise staging

B. deploy

- runs-on: <SELF_HOSTED_RUNNER_LABEL>
- needs: build-and-deploy
- checkout
- generate deploy/.env.<environment>
- populate secrets from GitHub Secrets
- populate non-secret values from GitHub Variables
- print masked preview
- login to GHCR
- docker compose pull
- docker compose up -d --remove-orphans
- docker image prune -f

--------------------------------------------------------------------
Verification
--------------------------------------------------------------------

Before finishing, verify:

- no <placeholders> remain
- frontend build arguments match the target framework
- backend/entrypoint.sh has:
    - shebang
    - set -e
- nginx proxies to:

    backend:<BACKEND_PORT>

- GitHub Environments exist:
    - staging
    - production
- self-hosted runner is registered
- Docker and Compose v2 are installed
- external Docker network exists

Prefer adding:

- healthchecks
- depends_on.condition: service_healthy

--------------------------------------------------------------------
Final Output
--------------------------------------------------------------------

Provide:

1. All files created
2. GitHub Secrets required
3. GitHub Variables required
4. Any deviations required by the target stack
```

---

# Server Prerequisites

- [ ] Self-hosted GitHub Actions runner installed and labeled
- [ ] Docker installed
- [ ] Docker Compose v2 installed
- [ ] External Docker network created

```bash
docker network create <EXTERNAL_DOCKER_NETWORK>
```

- [ ] Reverse proxy connected to the same external network
- [ ] GitHub Environments:
  - `staging`
  - `production`
- [ ] All required GitHub Secrets and Variables configured