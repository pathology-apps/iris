FROM node:21.2-bullseye-slim

RUN npm install -g pnpm@9.1.4

WORKDIR /usr/src/app

EXPOSE 3000

COPY docker/node/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ARG ENV
ARG NODE_ENV

ENV ENV=${ENV}
ENV NODE_ENV=${NODE_ENV}

ENTRYPOINT ["entrypoint.sh"]
