#!/bin/sh

echo "I am a post deploy script"
echo -n "pwd: "
echo `pwd`

node scripts/make_config.js
