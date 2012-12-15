#!/usr/bin/env node

/**
 * Post-update script to upload schema changes and apply them in order.
 *
 * This will get your awsbox server set up, but it's not a good migration
 * system, because it won't do anything for subsequent updates that need
 * to be applied to an existing server; you will need to install those by
 * hand.  This gets awsbox up and running, but it should not bee seen as 
 * part of a long-term strategy.  Replace as necessary.
 */

const
fs = require('fs'),
path = require('path'),
child_process = require('child_process');

var host = process.env.AWS_IP_ADDRESS;
var user = 'app@'+host;
var schema_path = path.join(__dirname, '../../server/db');
var schemas = fs.readdirSync(schema_path);

// apply schema updates in order

schemas = schemas
  .filter(function(name) { return /\.sql$/.test(name) })
  .sort();

console.log("will apply schemas: " + schemas);

var i = 0;
var count = schemas.length;

function applyNextSchema(callback) {
  var schema_name = schemas[i];
  var schema = path.join(schema_path, schema_name);
  var cmd;
  i += 1;

  console.log(user + " applying " + schema);

  cmd = 'scp ' + schema + ' ' + user + ':/tmp';
  console.log("will execute: " + cmd);
  child_process.exec(cmd, function(err) {
    if (err) return callback(err);

    cmd = 'ssh ' + user + ' "mysql -u roomr roomr < /tmp/' + schema_name + '"';
    child_process.exec(cmd , function(err) {
      if (err) {
        if (/Duplicate column name/.test(err.message)) {
          // This error is ignoreable
        } else {
          return callback(err);
        }
      }

      if (i < count) {
        return applyNextSchema(callback);
      }
      return callback(null);
    });
  }); 
}

applyNextSchema(function(err) {
  if (err) throw(err);
  console.log("Database schemas applied");
});

