#!/usr/bin/env bash
# Generates a persistent self-signed cert for the local docker-compose setup, mirroring
# the backstage-tls secret mounted in the GKE deployment (see docs/architecture.md).
# Regenerating Backstage's own `https: true` cert on every restart breaks the backend's
# internal calls to itself, so we mount a fixed cert/key pair instead, same as prod.
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p certs

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout certs/tls.key -out certs/tls.crt \
  -days 825 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Wrote certs/tls.crt and certs/tls.key"
