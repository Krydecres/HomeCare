# Static build of the web (SV16) served by nginx, same-origin proxy to api-gateway (R-08).
FROM node:24-alpine AS build
WORKDIR /src
RUN npm install -g pnpm@10.34.9
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
