# Architecture

This page covers how the Backstage instance itself runs -- not the CloudCart product
services it catalogs.

## Where it runs

Backstage runs as a 2-replica `Deployment` in the `backstage` namespace on the
`cloudcart-dev` GKE cluster (project `<GCP_PROJECT_ID>`, `us-central1`). The
manifests live in [`backstage/deploy/`](https://github.com/ravisinghrajput95/platform-engineering-idp/tree/main/backstage/deploy)
and are applied by ArgoCD -- see [CI/CD Pipeline](cicd.md) for how a change gets there.

A soft pod anti-affinity rule prefers scheduling the two replicas on different nodes (not
required, so a busy cluster can still place both if it has to), and a `PodDisruptionBudget`
with `minAvailable: 1` keeps voluntary disruptions -- node drains, cluster upgrades -- from
taking both down at once. Note that `techdocs.publisher.type: 'local'` (see [TechDocs](techdocs.md))
means each replica caches generated docs independently -- whichever replica a request lands on
that hasn't built a given service's docs yet will do a cold rebuild, not read a stale/missing
cache from its sibling. Not incorrect, just an inconsistent first-load experience across
replicas; switching the publisher to `googleGcs` would make the cache shared instead.

Each pod has two containers:

- **`backstage`** -- the Node backend (which also serves the built frontend), listening on
  `7007`.
- **`cloud-sql-proxy`** -- the Cloud SQL Auth Proxy sidecar, listening on `127.0.0.1:5432`,
  so the backend talks to Postgres over a plain local TCP connection while the proxy handles
  the encrypted, IAM-authenticated connection to Cloud SQL.

## Identity and database access

The pod's Kubernetes ServiceAccount (`backstage`) is bound via Workload Identity to the GCP
service account `backstage-sql-client@<GCP_PROJECT_ID>.iam.gserviceaccount.com`.
Neither container carries a JSON key -- both the Cloud SQL proxy and any other GCP API calls
the backend makes use this identity's ambient credentials.

Postgres itself is a Cloud SQL instance (`cloudcart-internal-developer-portal`), reached only
over its private IP via the proxy sidecar. `pluginDivisionMode: schema` puts every Backstage
plugin's tables in its own schema within one database, rather than requiring `CREATEDB` on
the Postgres user.

## Networking and TLS

The `backstage` Service is a `LoadBalancer` bound to a reserved static IP (`<LB_IP>`) on
port 443. There's no domain or CA-issued certificate yet, so:

- The pod is configured with `backend.https.certificate`, pointing at a **persistent**
  self-signed cert (mounted from the `backstage-tls` secret, with the LB IP as a SAN). This
  replaces Backstage's `https: true` shorthand, which regenerates a fresh in-memory cert on
  every restart -- that broke the backend's own internal calls to itself (e.g. the auth
  resolver's catalog lookup) with "self-signed certificate" errors, since a freshly-generated
  cert isn't in Node's trusted CA list.
- `NODE_EXTRA_CA_CERTS` points at that same cert, so Node trusts it for the backend's own
  outbound calls to itself -- without disabling TLS validation process-wide.
- HSTS and the CSP `upgrade-insecure-requests` directive are both disabled: with only a
  self-signed cert in front, forcing HTTPS upgrades or caching HSTS could hard-lock visitors
  out if TLS ever broke. Revisit once a real domain + CA-issued cert (or a Google-managed
  cert) is in place.
- `auth.environment` is kept as `development` rather than `production`, because Backstage
  marks session cookies `secure` under `production`, which requires HTTPS trusted by the
  browser without warnings. Flip this once there's a real cert.

## Kubernetes plugin

The catalog's Kubernetes tab reads live pod/deployment status directly from the `cloudcart-dev`
cluster. `app-config.production.yaml`'s `kubernetes.clusterLocatorMethods` uses
`authProvider: 'googleServiceAccount'` (not `'google'` -- that's a different strategy meant for
end-user OAuth sign-in, and 404s with "Unknown auth provider 'google'" unless a `google` sign-in
provider is also configured under `auth.providers`, which this app doesn't have).
`googleServiceAccount` authenticates server-side via Application Default Credentials, so it
reuses the same Workload Identity binding already in place for the Cloud SQL Auth Proxy
(`backstage-sql-client`) rather than a separate credential -- that
service account additionally has `roles/container.viewer` (GCP IAM, lets it authenticate to the
cluster's control plane) and is bound to the built-in `view` ClusterRole in-cluster via
`deploy/kubernetes-plugin-rbac.yaml` (Kubernetes RBAC, read-only, governs what it can actually
see once authenticated).

A component only shows up on this tab if its `catalog-info.yaml` has a
`backstage.io/kubernetes-id: <id>` annotation *and* its actual Kubernetes objects (Deployment,
Service, ...) carry a matching `backstage.io/kubernetes-id: <id>` **label** -- the annotation
alone isn't enough. `backstage/catalog-info.yaml` and `deploy/deployment.yaml`/`service.yaml`
are wired up this way for the portal's own pod; the `cloudcart-fastapi` scaffolder template
carries the same pattern (using `${{ values.serviceName }}` for both) so services created from
it get this for free.

## Sign-in

GitHub OAuth is the only sign-in path -- the guest login provider was removed once Backstage
became reachable on a public IP. Sign-in resolves to catalog `User` entities by matching
GitHub username (`usernameMatchingUserEntityName`), so a person must exist as a `User` entity
(see [`catalog/groups/platform-team.yaml`](https://github.com/ravisinghrajput95/platform-engineering-idp/blob/main/backstage/catalog/groups/platform-team.yaml))
to sign in successfully.
