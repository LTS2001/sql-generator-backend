FROM node:22.19.0

WORKDIR /app/sql-generator-backend

COPY . /app/sql-generator-backend

RUN npm i -g pnpm
RUN pnpm i

EXPOSE 7001

CMD [ "pnpm", "run", "start" ]