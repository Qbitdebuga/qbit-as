FROM node:20.18.1-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn build

FROM node:20.18.1-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3007

CMD ["yarn", "start:prod"] 