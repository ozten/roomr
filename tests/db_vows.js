/**
 * Before importing the db module, modify the environment to signal 
 * that it should use an ephemeral test db, not our regular db.
 */
process.env['ROOMR_TEST'] = 1;
process.env['ROOMR_TEST_DB_NAME'] = 'test_roomr';

const
vows = require('vows'),
assert = require('assert'),
db = require('../server/lib/db'),
fs = require('fs'),
path = require('path'),
child_process = require('child_process'),
TEST_EMAIL = "oxfordcommagirl@roomr.gov",
TEST_NAME = "OCG",
TEST_ROOM = "Our Terrible Ideas";

var mysqlExec = "mysql -u roomr -proomr";
if (process.env['TRAVIS']) {
  // travis does not like passwords on mysql
  mysqlExec = "mysql -u roomr";
}

/**
 * If the person running the test doesn't have a config yet, create
 * a default config.
 */
var configPath = path.join(__dirname, '../server/etc/config.js');
if (!fs.existsSync(configPath)) {
  console.log("Creating your initial " + configPath + ".  You can edit this.");

  var makeConfig = require('../scripts/make_config');
  makeConfig('127.0.0.1');
}

var suite = vows.describe("DB");

suite.addBatch({
  "Maybe destroy test db": {

    // In case last test didn't clean up properly, try to destroy the database
    topic: function() {
      var cb = this.callback;
      child_process.exec("echo 'drop database test_roomr' | " + mysqlExec, function(err) {
        if (!err || /database doesn't exist/.test(err.message)) {
          return cb(null);
        } 
        return cb(err);
      });
    },

    "before starting": function(err) {
      assert(!err);
    }
  }
});

suite.addBatch({
  "Create test db": {
    topic: function() {
      var schemas = fs.readdirSync(path.join(__dirname, '../server/db'))
        .filter(function(name) { return /\.sql$/.test(name) })
        .sort();

      var count = schemas.length;
      var i = 0;
      var cb = this.callback;

      function applyNextSchema() {
        var schema = schemas[i];
        var schemaPath = path.join(__dirname, '../server/db', schema);
        child_process.exec(mysqlExec + " test_roomr < " + schemaPath, function(err) {
          assert(err === null);
          i += 1;

          if (i < count) {
            applyNextSchema();
          } else {
            cb(null);
          }
        });
      } 

      child_process.exec("echo 'create database test_roomr' | " + mysqlExec, applyNextSchema);
    },

    "ok": function(err) {
      assert(!err);
    }
  }
});

suite.addBatch({
  "We can create": {
    topic: function() {
      db.updateProfile(TEST_EMAIL, TEST_NAME, this.callback);
    },

    "a new user": function(err, other) {
      assert(err === null);
    },

    "and get": {
      topic: function() {
        db.getProfile(TEST_EMAIL, this.callback);
      },

      "her profile": function(err, profile) {
        assert(err === null);
        assert(profile.email === TEST_EMAIL);
        assert(profile.name === TEST_NAME);
      }
    }
  }
});

suite.addBatch({
  "Drop test database": {
    topic: function() {
      child_process.exec("echo 'drop database test_roomr' | " + mysqlExec, this.callback);
    },

    "ok": function(err) {
      assert(!err);
    }
  }
});

suite.export(module);
