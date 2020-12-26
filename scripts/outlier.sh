#!/bin/bash

f=$1
prefix=$2

grep ^function $f | grep -v " _\?_\?$prefix"
