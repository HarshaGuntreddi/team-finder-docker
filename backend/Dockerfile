FROM node:20-slim
WORKDIR /app

# Trust the corporate (Zscaler) TLS-intercepting proxy CA so npm can reach the registry.
COPY zscaler-root-ca.crt /usr/local/share/ca-certificates/zscaler-root-ca.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zscaler-root-ca.crt

# Install production dependencies first (better layer caching).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# App source.
COPY src ./src

ENV PORT=4000
EXPOSE 4000
CMD ["node", "src/index.js"]
