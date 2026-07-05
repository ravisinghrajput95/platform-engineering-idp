# CloudCart Backend

Backend microservice for the CloudCart platform, built with Python and FastAPI.

!!! note
    The `ravisinghrajput95/cloudcart-backend` repository doesn't exist yet. This page is
    placeholder documentation hosted alongside the catalog entry so the component has a
    working TechDocs tab; once the real repo exists, move this content there and switch its
    `backstage.io/techdocs-ref` annotation from `dir:../../techdocs/cloudcart-backend` back to
    `url:https://github.com/ravisinghrajput95/cloudcart-backend/tree/main/`.

## Stack

- **Language/framework**: Python, FastAPI
- **Runtime**: containerized, deployed to the `cloudcart-dev` GKE cluster
- **Data**: depends on the `cloudcart-postgres` resource (see the catalog entry's
  `dependsOn`)

## Scaffolding

New services with this same shape can be created from the `cloudcart-fastapi` template in
this portal's **Create** page -- it generates a FastAPI skeleton, Dockerfile, Kubernetes
manifests, and a working TechDocs setup out of the box.

## API

- `GET /` -- service metadata
- `GET /healthz` -- health check

(Endpoint list is illustrative, matching the `cloudcart-fastapi` scaffolder template's default
skeleton -- update once the real service's routes are documented.)
