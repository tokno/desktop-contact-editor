#!/bin/bash -e

APPNAME='editor-prototype'

rm -rf dist

node_modules/.bin/electron-packager . "$APPNAME" \
    --out=dist \
    --ignore='^/dist$' \
    --ignore='^/node_modules/electron-packager$' \
    --ignore='^/node_modules/electron-prebuilt$' \
    --ignore='^/node_modules/bower$' \
    --ignore='^/node_modules/xo$' \
    --version=0.35.0 \
    --platform=all \
    --arch=x64

