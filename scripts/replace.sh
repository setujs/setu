#!/bin/bash

orig=$1
mod=$2

for f in `find . -name '*.js'`
do
  sed "s/[[:<:]]$orig[[:>:]]/$mod/g" $f > /tmp/x
  mv /tmp/x $f
done
