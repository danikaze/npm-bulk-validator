#!/usr/bin/env bash

TEMP_DIR=__temp
ORIGINAL_DIR=`pwd`
SCRIPT_DIR=$( cd $( dirname "${BASH_SOURCE[0]}" ) && pwd )

mkdir -p ${TEMP_DIR}
cp src/* ${TEMP_DIR}
cp README.md ${TEMP_DIR}
grep -v "private" package.json > ${TEMP_DIR}/package.json

cd ${TEMP_DIR}
npm publish
cd ..
rm -rf ${TEMP_DIR}

cd ${ORIGINAL_DIR}
