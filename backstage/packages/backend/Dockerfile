# This dockerfile builds an image for the backend package.
# It should be executed with the root of the repo as docker context.
#
# Before building this image, be sure to have run the following commands in the repo root:
#
# yarn install --immutable
# yarn tsc
# yarn build:backend
#
# Once the commands have been run, you can build the image using `yarn build-image`
#
# Multi-stage build: the `build` stage carries the compiler toolchain needed to install
# native Node addons (better-sqlite3, isolate-vm) and the mkdocs/TechDocs Python deps; none
# of that (g++, build-essential, pip, dev headers) is needed to actually run the backend, so
# the `runtime` stage starts fresh from the same base image and only copies over the
# already-built artifacts. This is what keeps the shipped image small.

FROM node:24-trixie-slim AS build

# Set Python interpreter for `node-gyp` to use
ENV PYTHON=/usr/bin/python3

# Install isolate-vm dependencies (needed by @backstage/plugin-scaffolder-backend) and
# sqlite3 dependencies (needed by better-sqlite3) -- all build-time only. python3-venv +
# python3-pip build the TechDocs mkdocs venv further down; neither the compiler toolchain
# nor pip itself needs to exist in the final image.
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-venv python3-pip g++ build-essential libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# TechDocs generator.runIn: 'local' builds docs in-process (no Docker socket available in
# the running pod), which needs mkdocs + the TechDocs mkdocs plugins on PATH. Built as a
# self-contained venv (--copies, not symlinks) so only this directory -- not the interpreter
# used to build it -- needs to be copied into the runtime stage.
RUN python3 -m venv --copies /opt/techdocs-venv && \
    /opt/techdocs-venv/bin/pip install --no-cache-dir mkdocs-techdocs-core

# From here on we use the least-privileged `node` user to run the backend.
USER node

# This should create the app dir as `node`.
# If it is instead created as `root` then the `tar` command below will fail: `can't create directory 'packages/': Permission denied`.
# If this occurs, then ensure BuildKit is enabled (`DOCKER_BUILDKIT=1`) so the app dir is correctly created as `node`.
WORKDIR /app

# Copy files needed by Yarn
COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .yarnrc.yml ./
COPY --chown=node:node backstage.json ./

# This switches many Node.js dependencies to production mode.
ENV NODE_ENV=production

# This disables node snapshot for Node 20 to work with the Scaffolder
ENV NODE_OPTIONS="--no-node-snapshot"

# Copy repo skeleton first, to avoid unnecessary docker cache invalidation.
# The skeleton contains the package.json of each package in the monorepo,
# and along with yarn.lock and the root package.json, that's enough to run yarn install.
COPY --chown=node:node yarn.lock package.json packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    yarn workspaces focus --all --production && rm -rf "$(yarn cache clean)"

# This will include the examples, if you don't need these simply remove this line
COPY --chown=node:node examples ./examples

# CloudCart catalog entities and scaffolder templates referenced by app-config.production.yaml
COPY --chown=node:node catalog ./catalog
COPY --chown=node:node templates ./templates

# This app's own catalog entity + TechDocs source, generated on-demand at ./ (dir:. techdocs-ref)
COPY --chown=node:node catalog-info.yaml mkdocs.yml ./
COPY --chown=node:node docs ./docs

# Then copy the rest of the backend bundle, along with any other files we might want.
COPY --chown=node:node packages/backend/dist/bundle.tar.gz app-config*.yaml ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

# --- runtime stage: fresh base image, only what's needed to actually run the backend ---
FROM node:24-trixie-slim AS runtime

# Runtime-only counterparts of the build stage's toolchain: a Python interpreter to run the
# copied mkdocs venv (not pip, not the venv module), and the sqlite3 shared runtime library
# for better-sqlite3's compiled addon to load (not the -dev headers/static lib used to build
# it). No g++/build-essential here at all.
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 libsqlite3-0 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /opt/techdocs-venv /opt/techdocs-venv
ENV PATH="/opt/techdocs-venv/bin:${PATH}"

USER node
WORKDIR /app
COPY --from=build --chown=node:node /app /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--no-node-snapshot"

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]
