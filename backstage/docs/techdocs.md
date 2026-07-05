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
     from wherever the catalog entry is registered (this is how `cloudcart-backend` and
     `cloudcart-frontend` are set up -- their catalog entries live here, but their code and
     docs live in their own repos).
2. Add an `mkdocs.yml` and a `docs/` folder at that location, e.g.:
   ```yaml
   site_name: 'My Service'
   nav:
     - Home: index.md
   plugins:
     - techdocs-core
   ```
3. Open the component's TechDocs tab -- it builds on first request.

`cloudcart-backend` and `cloudcart-frontend` have the annotation already but no `mkdocs.yml`
yet in their own repos, so their TechDocs tabs currently show "no docs found" rather than an
error. New services scaffolded from `cloudcart-fastapi` get a working `mkdocs.yml`/`docs/` out
of the box, so this only applies to those two pre-existing repos.
