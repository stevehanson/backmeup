#!/bin/bash

BASEDIR=$(dirname $0)

if [ ! -d "./node_modules" ]; then
  yarn --cwd $BASEDIR install
fi

node $BASEDIR/index.js $@
