FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Rollup ships platform-specific binaries as optional deps. If package-lock.json
# was generated on a different OS (e.g. darwin) than the build host (alpine),
# `npm ci` — and even `npm install` against the existing lockfile — fails with
# `Cannot find module @rollup/rollup-linux-x64-musl` (npm/cli#4828).
# Dropping the lockfile forces npm to resolve the correct native binary for
# the current platform. We accept the cost of non-deterministic resolution
# here because the build runs in a clean layer on every deploy.
RUN rm -f package-lock.json && npm install --no-audit --no-fund
COPY . .
ARG VITE_API_URL
ARG VITE_GRAPHQL_URL
ARG VITE_HEDERA_NETWORK
ARG VITE_HEDERA_TOKEN_ID
ARG VITE_TREASURY_ACCOUNT_ID
ARG VITE_WALLETCONNECT_PROJECT_ID
ARG VITE_WORLDID_APP_ID
ARG VITE_WORLDID_ACTION
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
ENV VITE_HEDERA_NETWORK=$VITE_HEDERA_NETWORK
ENV VITE_HEDERA_TOKEN_ID=$VITE_HEDERA_TOKEN_ID
ENV VITE_TREASURY_ACCOUNT_ID=$VITE_TREASURY_ACCOUNT_ID
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID
ENV VITE_WORLDID_APP_ID=$VITE_WORLDID_APP_ID
ENV VITE_WORLDID_ACTION=$VITE_WORLDID_ACTION
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
