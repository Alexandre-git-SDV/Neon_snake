FROM node:20-alpine

WORKDIR /Neon_snake

COPY package.json ./
COPY src ./src
COPY . .

EXPOSE 5173

RUN node server.mjs

ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["node", "server.mjs"]
