# build stage
FROM node:lts-alpine as build-stage
ARG VUE_APP_GRAPHQL_HTTP
ARG VUE_APP_GRAPHQL_WS
ARG FONT_AWESOME_TOKEN
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
