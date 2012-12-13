#!/usr/bin/env node

/**
 * Take the config.js-dist file and write a config.js for awsbox
 * 
 * Since this does string replacement on the config.js-dist file, and depends on files
 * being in certain directories, it is a bit fragile.  The scripts_make_config_vows.js
 * test is there to make sure it doesn't fly apart.
 */

const
crypto = require('crypto'),
fs = require('fs'),
path = require('path'),
SERVER_ETC = '../server/etc';

function makeConfig(public_url) {
  var secret = crypto.randomBytes(64).toString('base64');
  var config = fs.readFileSync(path.join(__dirname, SERVER_ETC, 'config.js-dist')).toString();

  config = config.replace(/^exports.audience = .*$/m, 'exports.audience = "'+public_url+'";');
  config = config.replace("CHANGE ME TO SOMETHING RANDOM", secret);
  config = config.replace('"user"', '"roomr"');
  config = config.replace('"password"', 'null');
  config = config.replace('"dev_roomr"', '"roomr"');

  return config;
}

if (module.parent) {
  module.exports = makeConfig
} else {
  // this will exist on an awsbox deployment
  var awsbox_config = path.join(__dirname, '../../config.json');
  var public_url = '127.0.0.1';
  if (fs.existsSync(awsbox_config)) {
    public_url = JSON.parse(fs.readFileSync(awsbox_config).toString()).public_url;
  } 
  fs.writeFileSync(path.join(__dirname, SERVER_ETC, 'config.js'), makeConfig(public_url), 'ascii');
}
