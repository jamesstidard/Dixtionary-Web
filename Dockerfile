# build stage
FROM node:lts-alpine as build-stage

ARG VUE_APP_GRAPHQL_HTTP=https://dixtionary.stidard.com/api/graphql
ENV VUE_APP_GRAPHQL_HTTP=$VUE_APP_GRAPHQL_HTTP

ARG VUE_APP_GRAPHQL_WS=wss://dixtionary.stidard.com/api/subscriptions
ENV VUE_APP_GRAPHQL_WS=$VUE_APP_GRAPHQL_WS

ARG FONT_AWESOME_TOKEN
ENV FONT_AWESOME_TOKEN=$FONT_AWESOME_TOKEN

WORKDIR /app
COPY package*.json ./
# COPY .npmrc ./
RUN apk update && apk add bash
RUN npm install
COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
