#!/bin/bash

for f in `grep -r '^function ' lib/ | awk -F ':' '{print $2}' | awk '{print $2}' | awk -F \( '{print $1}' | sort | uniq`
do
  count=`grep -r "^function $f[ ]*(" lib/ | wc -l | awk '{print $1}'`
  if [ "$count" != "1" ]
  then
    echo "$f $count"
  fi
done
