# TechDocs

You're reading this in TechDocs right now -- this page documents how *this instance* of it is
configured.

## Generation: on-demand, in-process

`app-config.production.yaml` sets `techdocs.generator.runIn: 'local'`. Backstage's default
`runIn: 'docker'` mode shells out to run a container per doc build, which needs a Docker socket
-- not available in this pod (it isn't privileged and has no Docker-in-Docker sidecar). `local`
mode instead runs `mkdocs` directly in the backend process, using
[`mkdocs-techdocs-core`](https://pypi.org/project/mkdocs-techdocs-core/), which is `pip`
installed straight into the backend image in
[`packages/backend/Dockerfile`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/packages/backend/Dockerfile)
(`--break-system-packages` is required there because Debian trixie's system Python is
externally-managed per PEP 668).

Docs are built the first time a component's TechDocs tab is opened, not ahead of time in CI.

## Publishing: local disk

`techdocs.publisher.type` is `'local'` -- generated sites are written to disk in the running
pod, not to cloud storage. That means a pod restart drops the cache and the next viewer
triggers a rebuild; there's no correctness issue, just a cold first load after a restart. If
this ever needs to survive restarts or scale past one replica, the publisher can be switched to
`googleGcs` without changing anything about how docs are generated.

## Adding docs to a component

1. Add a `backstage.io/techdocs-ref` annotation to the component's `catalog-info.yaml`:
   - `dir:.` if the docs live in the same repo as the catalog entry (as this Backstage
     instance's own entity does).
   - `url:https://github.com/<owner>/<repo>/tree/main/` if the docs live in a different repo
     from wherever the catalog entry is registered.
2. Add an `mkdocs.yml` and a `docs/` folder at that location, e.g.:
   ```yaml
   site_name: 'My Service'
   nav:
     - Home: index.md
   plugins:
     - techdocs-core
   ```
3. Open the component's TechDocs tab -- it builds on first request.

`cloudcart-backend` and `cloudcart-frontend` don't have real repos yet, so they carry no
`techdocs-ref` annotation for now -- add one (`url:...`, per above) once each service has a
real repo with its own `mkdocs.yml`/`docs/`.

## CI build-check

Serving is always on-demand by the IDP itself (no external publish step) -- but a broken
`mkdocs.yml` or a dangling nav reference would otherwise only surface as a runtime error on
someone's TechDocs tab. `.github/workflows/techdocs-build-check.yml` is a reusable
`workflow_call` workflow that runs `mkdocs build --strict` against a given directory, using the
same `mkdocs-techdocs-core` toolchain the backend itself uses to generate docs. It never touches
application code, so any repo -- regardless of language -- can adopt it:

```yaml
jobs:
  docs-check:
    uses: ravisinghrajput95/platform-engineering-idp/.github/workflows/techdocs-build-check.yml@main
    with:
      working-directory: .
```

`.github/workflows/techdocs-build-check-demo.yml` demonstrates it against this portal's own
docs as a PR check; add another job there against a different working-directory as soon as a
second real doc set exists to validate.
