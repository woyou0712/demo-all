FROM node:latest

RUN mkdir -p /start

COPY . /start

WORKDIR /start

RUN tar xzf redis-6.2.5.tar.gz && \
  cd redis-6.2.5 && make && make install && \
  cd /start && \
  rm -rf redis-6.2.5.tar.gz && \
  npm install -g pm2 nrm axios express body-parser cors ioredis sequelize sqlite3 && \
  chmod +x start-redis.sh

EXPOSE 3000 5050 6379

CMD ["npm","start"]
