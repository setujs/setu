#!/bin/bash

grep '[^a-zA-Z_0-9]G[A-Z]' $1 | sed 's/^.*[^a-zA-Z_0-9]\(G[A-Z][a-zA-Z]*\).*$/\1/g' | sort | uniq
