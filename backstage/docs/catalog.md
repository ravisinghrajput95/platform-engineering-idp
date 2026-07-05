# Software Catalog

How CloudCart's services are modeled in Backstage, and how to onboard a new one.

## Current entities

All catalog YAML lives under
[`catalog/`](https://github.com/ravisinghrajput95/platform-engineering-idp/tree/main/backstage/catalog)
in this repo, and is loaded via `file` locations in `app-config.production.yaml` (paths
relative to `/app` in the built image) and `app-config.yaml` for local dev (paths relative to
`packages/backend`).

- **System**: `cloudcart-platform` -- the umbrella for the whole product.
- **Components**:
  - `cloudcart-backend` (Python/FastAPI) -- depends on the `cloudcart-postgres` resource.
  - `cloudcart-frontend` (React/Vite) -- depends on `cloudcart-backend`.
- **Resource**: `cloudcart-postgres` -- the shared Postgres database.
- **Group/User**: `platform-team`, owning everything above.

Both components carry a `github.com/project-slug` annotation. This Backstage instance's own
entity ([`catalog-info.yaml`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/catalog-info.yaml)
at the repo root) additionally carries a `backstage.io/techdocs-ref` annotation -- see
[TechDocs](techdocs.md) for what that does and why `cloudcart-backend`/`cloudcart-frontend`
don't have one yet.

Note that `cloudcart-backend` and `cloudcart-frontend` are catalog *entries* here, but their
actual source code lives in separate GitHub repos
(`ravisinghrajput95/cloudcart-backend`, `ravisinghrajput95/cloudcart-frontend`). This repo only
holds the catalog metadata and the Backstage instance that renders it.

## Onboarding a new service

The `cloudcart-fastapi` scaffolder template
([`templates/cloudcart-fastapi/`](https://github.com/ravisinghrajput95/platform-engineering-idp/tree/main/backstage/templates/cloudcart-fastapi))
is the fast path: pick **Create** in the sidebar, fill in the service name/owner/lifecycle,
and it generates a new repo with a FastAPI skeleton, Dockerfile, Kubernetes manifests, a
`catalog-info.yaml` already pointed at the new repo, and (as of this pass) a working
`mkdocs.yml`/`docs/` so the new service shows up with TechDocs from day one.

If a service didn't come from the template, add its `catalog-info.yaml` by hand (following the
existing components as a model) and register it as a new `file` location in both
`app-config.yaml` and `app-config.production.yaml`.

## API docs

`@backstage/plugin-api-docs` (already installed) renders `kind: API` entities as interactive
OpenAPI docs on the APIS tab. `catalog/apis/cloudcart-backend-api.yaml` defines
`cloudcart-backend-api`, linked via `providesApis` on `cloudcart-backend` and `consumesApis` on
`cloudcart-frontend`.

The spec itself isn't inline -- it's fetched from
`backend/openapi.yaml` in the `AI-Powered-DevSecOps-CI-CD-Pipeline` repo via `definition.$text`,
using the **raw.githubusercontent.com URL, not a `github.com` blob URL**. That's deliberate: a
`github.com` URL would resolve through this app's GitHub integration/`GITHUB_TOKEN` (the same
path that 401'd for the TechDocs `url:` refs earlier), while the raw URL is a plain
unauthenticated HTTPS fetch against a public repo -- no dependency on that token's health at
all. If the backend repo ever goes private, this needs to switch to a `github.com` blob URL and
will then depend on `GITHUB_TOKEN` being valid.

The spec was hand-written (Flask has no auto-generated OpenAPI/Swagger here, unlike a FastAPI
service) by reading through `backend/routes/*.py` and `backend/models/*.py` directly, and
validated with `openapi-spec-validator`. It's intentionally complete -- including the `Admin`
and `Vulnerable` tags -- since this is a deliberately-insecure DevSecOps training app and the
spec documents that surface accurately, VULN notes included.

## GitHub Actions tab

Components with a `github.com/project-slug` annotation get a GitHub Actions tab
(`@backstage-community/plugin-github-actions`), showing workflow runs, job steps, and logs. It
authenticates as the signed-in user's own GitHub OAuth token (the same sign-in provider already
configured) rather than a service account -- expect an incremental consent prompt the first time
someone opens the tab.

`cloudcart-backend` and `cloudcart-frontend`'s actual source lives in the
[`AI-Powered-DevSecOps-CI-CD-Pipeline`](https://github.com/ravisinghrajput95/AI-Powered-DevSecOps-CI-CD-Pipeline)
monorepo (`backend/`/`frontend/` subdirectories), not standalone repos -- both entities'
`project-slug` points at that same repo. The plugin has no per-path or per-workflow filtering
annotation, so both components' tabs show *all* of that repo's workflow runs (`backend-ci`,
`frontend-ci`, `deploy-backend`, `deploy-frontend`, `codeql`, `dast`, etc.) -- use the tab's own
search/filter to narrow to the relevant one.
