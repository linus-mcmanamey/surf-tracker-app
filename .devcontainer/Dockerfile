FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g @railway/cli

# Create workspace directory
WORKDIR /workspace

# Copy repository files
COPY ../ /workspace/

# Set correct ownership
RUN chown -R node:node /workspace

USER node
