#!/bin/bash

set -e

APP_DIR="/var/www/ers-test.constromat.com/public_html"

cd $APP_DIR

pm2 startOrReload ecosystem.config.js

pm2 save

sudo systemctl reload nginx