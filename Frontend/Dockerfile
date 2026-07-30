# check=skip=SecretsUsedInArgOrEnv
FROM cgr.dev/chainguard/node:latest-dev AS development-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM cgr.dev/chainguard/node:latest-dev AS production-dependencies-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM cgr.dev/chainguard/node:latest-dev AS build-env
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URI
# VITE_DEMO_EMAIL/PASSWORD are read via import.meta.env in
# Frontend/app/routes/login.tsx and inlined into the public JS bundle by
# design (autofills a demo login for portfolio visitors) — already fully
# visible to anyone loading the page regardless of how they enter the build,
# so SecretsUsedInArgOrEnv's actual concern (a secret persisting invisibly in
# `docker history`) doesn't apply. Left unset in real prod builds — see
# Frontend/.env.production.example.
ARG VITE_DEMO_EMAIL=""
ARG VITE_DEMO_PASSWORD=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI \
    VITE_DEMO_EMAIL=$VITE_DEMO_EMAIL \
    VITE_DEMO_PASSWORD=$VITE_DEMO_PASSWORD
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN npm run build

# --- runtime stage: minimal image, no shell/npm/apk ---
FROM cgr.dev/chainguard/node:latest

WORKDIR /app

COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build

# Chainguard's :latest images default to nonroot (uid 65532) already, but
# pin it explicitly so a future base-image change can't silently grant root.
USER 65532

EXPOSE 3000

# No shell/npm in the minimal runtime image, so `npm run start` can't work
# here — invoke sirv's script directly with node instead (exec form, no
# shell needed). sirv-cli reads a PORT env var itself if set, overriding
# --port, so the port stays configurable without any shell interpolation.
# `serve` was tried first but its clipboardy dependency shells out to
# `getconf` at import time to detect CPU arch, which crashes immediately
# in this shell-less image — sirv-cli has no such dependency.
ENTRYPOINT ["node", "node_modules/.bin/sirv", "build/client", "--single", "--host", "0.0.0.0", "--port", "3000"]
