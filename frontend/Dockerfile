# --- Build stage: compile the React app ---
FROM node:20-slim AS build
WORKDIR /app
# Trust the corporate (Zscaler) TLS-intercepting proxy CA so npm can reach the registry.
COPY zscaler-root-ca.crt /usr/local/share/ca-certificates/zscaler-root-ca.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/zscaler-root-ca.crt
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# --- Serve stage: static files via nginx (also proxies /api to backend) ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
