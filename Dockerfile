FROM node:20-alpine

WORKDIR /Neon_snake

COPY package.json ./
COPY server.mjs ./
COPY src ./src
COPY index.html ./
COPY styles.css ./

EXPOSE 5173

ENV HOST=0.0.0.0
ENV PORT=5173

CMD ["node", "server.mjs"]
