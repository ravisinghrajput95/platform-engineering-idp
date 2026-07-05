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
