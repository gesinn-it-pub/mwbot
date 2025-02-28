ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /work
COPY package*.json ./
RUN ls -lah
RUN npm install
COPY . .

ENTRYPOINT [ "bash" ]
