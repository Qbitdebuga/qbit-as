FROM node:20.18.1-alpine AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn build

FROM node:20.18.1-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --production

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"] 