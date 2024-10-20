#!/bin/sh

# 启动 Redis 服务器
redis-server /start/redis-6.2.5/redis.conf &

# 等待 Redis 服务器启动
sleep 5

# 查看 Redis 服务器状态
redis-cli ping
