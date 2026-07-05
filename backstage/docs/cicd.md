# CI/CD Pipeline

How a commit becomes a running pod, end to end. Workflow definitions live in
[`.github/workflows/`](https://github.com/ravisinghrajput95/platform-engineering-idp/tree/main/.github/workflows).

## On every pull request: `backstage-ci.yml`

Triggered on PRs touching `backstage/**`. Runs, in order: `yarn tsc`, `yarn lint:all`,
`yarn test:all`, `yarn build:backend`, then a `docker build` of
[`packages/backend/Dockerfile`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/packages/backend/Dockerfile)
with `push: false` -- just to catch a broken Dockerfile before merge. Nothing here touches
GCP.

## On push to `main`: `backstage-deploy.yml`

Triggered on pushes to `main` touching `backstage/**`. This is a **GitOps** pipeline -- CI
never talks to the Kubernetes cluster directly:

1. Build the backend (`yarn build:backend`), producing the `skeleton.tar.gz`/`bundle.tar.gz`
   the Dockerfile expects.
2. Authenticate to Google Cloud via **Workload Identity Federation** (no stored keys): GitHub's
   OIDC token is exchanged for short-lived credentials as the `backstage-ci-sa` service
   account, scoped only to `roles/artifactregistry.writer` on the `backstage` Artifact
   Registry repository -- not project-wide, and not the same service account any other
   repo's CI uses.
3. Build and push the image to
   `us-central1-docker.pkg.dev/project-0c628a24-2e5e-4878-861/backstage/backstage`, tagged
   both `:latest` and `:<commit-sha>`.
4. Rewrite the image tag in
   [`deploy/deployment.yaml`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/deploy/deployment.yaml)
   to the new SHA, and commit that change back to `main` with `[skip ci]` in the message (so
   it doesn't retrigger the workflow).

## ArgoCD takes it from there

[`deploy/argocd-application.yaml`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/deploy/argocd-application.yaml)
defines an `Application` that watches `backstage/deploy` on `main`, with `automated: {prune:
true, selfHeal: true}`. Once the deploy workflow's commit lands on `main`, ArgoCD picks up the
new image tag on its next sync and rolls it out -- no `kubectl` access from GitHub Actions was
ever required.

## Why this shape

Two deliberate choices worth calling out for anyone extending this pipeline:

- **Tag-and-commit instead of `kubectl set image`.** Since ArgoCD already owns this
  Application with `selfHeal: true`, having CI push images directly to the cluster would fight
  ArgoCD for control and require granting GitHub Actions cluster credentials it doesn't
  otherwise need. Committing the tag change keeps `main` as the single source of truth.
- **A dedicated CI service account, not a shared one.** `backstage-ci-sa` exists solely for
  this pipeline. An org-wide `github-actions-sa` already existed for a different repo's
  pipeline with broader roles (`container.developer`); reusing it would have coupled two
  unrelated pipelines' blast radius together.
