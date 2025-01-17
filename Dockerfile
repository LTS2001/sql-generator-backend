FROM node:18.20.4

WORKDIR /app/sql-generator-backend

COPY . /app/sql-generator-backend

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install

EXPOSE 7001

CMD [ "npm", "run", "dev" ]