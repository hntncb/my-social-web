#!/bin/sh

echo "--> Đang thực thi Database Migration (db:up)..."
npm run db:up

echo "--> Khởi động ứng dụng..."
exec "$@"