ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /work
COPY package*.json ./
RUN npm ci
COPY . .

ENTRYPOINT [ "bash" ]
