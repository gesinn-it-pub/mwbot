ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /work
COPY package*.json ./
RUN ls -lah
RUN npm ci
COPY . .

ENTRYPOINT [ "bash" ]
