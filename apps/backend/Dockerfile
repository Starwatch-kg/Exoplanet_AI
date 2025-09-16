FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
# Install deps; if no lockfile, use npm install
RUN --mount=type=cache,target=/root/.npm sh -lc 'if [ -f package-lock.json ]; then npm ci --ignore-scripts --no-audit --no-fund; else npm i --ignore-scripts --no-audit --no-fund; fi'

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json package.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
EXPOSE 8080
CMD ["node", "dist/main.js"]


