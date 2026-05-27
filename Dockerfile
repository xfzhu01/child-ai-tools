FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# postinstall runs prisma generate before schema files exist in this stage
RUN npm ci --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
ARG DEPLOY_TARGET=aliyun
ENV DEPLOY_TARGET=$DEPLOY_TARGET
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_TYPE_CHECK=1
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache wget
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
