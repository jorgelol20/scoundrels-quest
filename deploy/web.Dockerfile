# Contexto de build: raíz del repo
FROM node:22-alpine AS front
WORKDIR /app
RUN npm install -g pnpm@10
COPY front/package.json front/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY front/ ./
# Si el front lee la URL de la API en build (import.meta.env.VITE_*), llega por aquí
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

FROM caddy:2-alpine
COPY deploy/Caddyfile.web /etc/caddy/Caddyfile
COPY --from=front /app/dist /srv/frontend
COPY back/src/public /var/www/public
# /var/www/storage es el volumen compartido con php (ficheros subidos)
RUN ln -sfn /var/www/storage/app/public /var/www/public/storage
