FROM node:lts-alpine

RUN npm config set unsafe-perm true
RUN npm install -g npm@latest

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
COPY .npmrc ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# build app for production with minification
RUN npm run build

ARG VUE_APP_GRAPHQL_HTTP
ARG VUE_APP_GRAPHQL_WS
EXPOSE 8080
CMD [ "http-server", "dist" ]
