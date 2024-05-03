#!/bin/sh
set -e
curl https://lov.linkeddata.es/lov.nq.gz -o lov.nq.gz
gunzip -f lov.nq.gz
node dist/tools/load-lov/load.js