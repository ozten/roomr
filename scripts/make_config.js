#!/usr/bin/env node

const
crypto = require('crypto'),
fs = require('fs'),
path = require('path');

var secret = crypto.randomBytes(64).toString('base64');
var config = fs.readFileSync(path.join(__dirname, '../server/etc', 'config.js-dist')).toString();
var awsbox_config = path.join(__dirname, '../../config.json');
var public_url = JSON.parse(fs.readFileSync(awsbox_config).toString()).public_url;

config = config.replace(/^exports.audience = .*$/m, 'exports.audience = "'+public_url+'";');
config = config.replace("CHANGE ME TO SOMETHING RANDOM", secret);
config = config.replace('"user"', '"roomr"');
config = config.replace('"password"', 'null');
config = config.replace('"dev_roomr"', '"roomr"');

fs.writeFileSync(path.join(__dirname, '../server/etc', 'config.js'), config, 'ascii');
