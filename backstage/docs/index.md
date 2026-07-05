# CloudCart Platform Engineering Portal

This is the internal developer portal for the CloudCart platform, built on
[Backstage](https://backstage.io). It runs on Google Kubernetes Engine (GKE) and is the
single place to find what services exist, who owns them, how they're deployed, and how to
spin up a new one.

## What's here

| Section | What it covers |
| --- | --- |
| [Architecture](architecture.md) | How this Backstage instance itself is deployed -- GKE, Cloud SQL, TLS, auth |
| [CI/CD Pipeline](cicd.md) | How a change gets from a pushed commit to a running pod |
| [Software Catalog](catalog.md) | How CloudCart's services, systems, and templates are organized |
| [TechDocs](techdocs.md) | How this docs system itself is configured, and how to add docs to your own component |

## Quick links

- **Catalog**: browse `cloudcart-backend`, `cloudcart-frontend`, and the systems/resources
  they depend on from the sidebar.
- **Create**: scaffold a new FastAPI service from the `cloudcart-fastapi` template.
- **Sign in**: GitHub OAuth only -- there is no guest login.
