# Local Development

`yarn start` (SQLite, plain HTTP, hot reload) is the fast path for day-to-day frontend/backend
work. [`docker-compose.yaml`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/docker-compose.yaml)
is the other path: it runs the same backend image and config layering as the GKE deployment
(see [Architecture](architecture.md)), for when you need to reproduce something that only shows
up under prod-like conditions -- a Postgres-specific query, an HTTPS/cookie issue, a config
regression in `app-config.production.yaml` itself.

## What's identical to prod, what's swapped

| Piece | GKE | docker-compose |
|---|---|---|
| Backend image | `packages/backend/Dockerfile` | same Dockerfile |
| Config | `app-config.yaml` + `app-config.production.yaml` | same two files, plus `app-config.local-container.yaml` layered on top |
| Database | Cloud SQL via the `cloud-sql-proxy` sidecar | plain `postgres:16-alpine` container -- same `pg` client, same `pluginDivisionMode: schema` |
| HTTPS | persistent self-signed cert from the `backstage-tls` secret | persistent self-signed cert from `./certs/`, generated once by `scripts/gen-local-tls.sh` |
| `app`/`backend` baseUrl | `https://34.55.255.110` | `https://localhost:7007` (the only thing `app-config.local-container.yaml` overrides) |
| Secrets (`GITHUB_TOKEN`, `AUTH_GITHUB_CLIENT_*`, `POSTGRES_PASSWORD`) | `backstage-secrets` k8s Secret | `.env` (copy `.env.example`) |

Everything else -- `kubernetes.clusterLocatorMethods`, `argocd.appLocatorMethods`, TechDocs'
local generator -- is the exact same config as prod, unmodified.

## First-time setup

```bash
yarn install --immutable && yarn tsc && yarn build:backend  # if packages/backend/dist isn't already built
./scripts/gen-local-tls.sh                                  # once -- writes certs/tls.{crt,key}
cp .env.example .env                                         # fill in GITHUB_TOKEN, AUTH_GITHUB_CLIENT_ID/SECRET, POSTGRES_PASSWORD
docker compose up --build
```

Then open `https://localhost:7007` -- click through the self-signed cert warning (expected;
there's no CA-issued cert for `localhost`) and sign in with GitHub, same as prod.

## Known gaps

- **Kubernetes tab won't show pod data.** The container can reach the real `cloudcart-dev`
  control plane over the network (it's a public IP), but `authProvider: googleServiceAccount`
  needs Application Default Credentials, which don't exist in a plain container -- only on the
  GKE pod via Workload Identity. It'll fail at query time with a credentials error, not at boot.
- **ArgoCD tab won't connect at all.** `argocd-server.argocd.svc.cluster.local` is
  cluster-internal DNS; nothing outside the cluster can resolve it. `ARGOCD_AUTH_TOKEN` can be
  left blank in `.env` -- `docker-compose.yaml` substitutes a placeholder, since the plugin's
  config schema rejects an empty string outright (that's a hard crash at boot, not a graceful
  per-request failure).
- **Scaffolder's `publish:github` step is real.** It'll create an actual GitHub repo under
  `GITHUB_TOKEN`'s account if you run a template through to completion -- there's no dry-run
  mode wired up here.

## Common commands

```bash
docker compose logs backstage -f     # follow backend logs
docker compose down                  # stop and remove containers (Postgres data persists in the postgres-data volume)
docker compose down -v                # also wipe Postgres data, for a clean slate
docker compose up --build backstage  # rebuild after a Dockerfile or dist/ change
```
