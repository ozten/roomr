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
Step = require('step'),
child_process = require('child_process'),
TEST_EMAIL = "oxfordcommagirl@roomr.gov",
TEST_FIRST_NAME = "OCG",
TEST_SECOND_NAME = "Juanita",
TEST_ROOM = "Our Terrible Ideas",
TEST_OTHER_EMAIL = "biggles@spanishinquisition.org",
TEST_OTHER_NAME = "Cardinal Biggles";

// Fallback MySQL credentials
var mysqlExec = "mysql -u roomr -proomr";

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
      if (process.env['TRAVIS']) {
        // travis does not like passwords on mysql
        mysqlExec = "mysql -u roomr";
        console.log('TRAVIS');
        cb();
      } else {
        // Use credentials from config
        try {
          var config = require('../server/etc/config'),
              mysql = require('mysql'),
              conn = mysql.createConnection({
                host     : config.mysqlHost,
                port     : config.mysqlPort,
                user     : config.mysqlUser,
                password : config.mysqlPassword
              });

          Step(function () {
            conn.connect(this);
          }, function (err) {
            if (! err) {
              console.log('Using developer settings for tests');
              mysqlExec = ['mysql -u ', config.mysqlUser,
                           ' -p', config.mysqlPassword].join('');
            }
            this();
          },function () {
            child_process.exec("echo 'drop database test_roomr' | " + mysqlExec, function(err) {
              if (!err || /database doesn\'t exist/.test(err.message)) {
                return cb(null);
              } 
              return cb(err);
            });
          });
        } catch (e) {
          // We're under Travis or another no config env...
          cb(null);
        }
      }      
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
      db.updateProfile(TEST_EMAIL, TEST_FIRST_NAME, this.callback);
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
        assert(profile.name === TEST_FIRST_NAME);
      }
    }
  }
});

suite.addBatch({
  "Our user can update": {
    topic: function() {
      db.updateProfile(TEST_EMAIL, TEST_SECOND_NAME, this.callback);
    },

    "her profile": function(err) {
      assert(!err);
    },

    "which we see": {
      topic: function() {
        db.getProfile(TEST_EMAIL, this.callback);
      },

      "when we retrive it": function(err, profile) {
        assert(err === null);
        assert(profile.email === TEST_EMAIL);
        assert(profile.name === TEST_SECOND_NAME);
      }
    }
  }
});

var newRoomId;
suite.addBatch({
  "Our user can create": {
    topic: function() {
      db.createRoom("oxfordcommagirl@roomr.gov", "Our Terrible Mistakes", this.callback);
    }, 

    "a new room": function(err, roomId) {
      assert(err === null);
      assert(typeof roomId === 'number');
      newRoomId = roomId;
    },
    "if she joins it, sockets.js would add her": {
      topic: function() {
        db.addMemberToRoom("oxfordcommagirl@roomr.gov", newRoomId, this.callback);
      }, 
      "Gets created": function(err, created) {
	assert(!err);
	assert(created);
      }
    },
    "which has": {
      topic: function() {
        db.getRoom(newRoomId, this.callback);
      },

      "the name she set for it": function(err, details) {
        assert(!err);
        assert(details.room.name === "Our Terrible Mistakes");
      }, 

      "her as the only member": function(err, details) {
        assert(!err);
        assert(details.members.length === 1);
        assert(details.members[0].email === "oxfordcommagirl@roomr.gov");
      }
    }
  }
});

suite.addBatch({
  "We can create": {
    topic: function() {
      db.updateProfile(TEST_OTHER_EMAIL, TEST_OTHER_NAME, this.callback);
    },

    "another user": function(err, other) {
      assert(err === null);
    },

    "and add him to the room": {
      topic: function() {
        // We know the roomid is 1 because it's the only room
        db.addMemberToRoom(TEST_OTHER_EMAIL, 1, this.callback);
      },

      "without error": function(err, added) {
        assert(!err);
      },

      "after which": {
        topic: function() {
          db.getRoom(1, this.callback);
        },

        "they are both members": function(err, details) {
          assert(!err);
          assert(details.members.length === 2);

          // make sure both emails got recorded
          var emails = [];
          details.members.forEach(function(member) {
            emails.push(member.email);
          });
          assert(emails.indexOf(TEST_EMAIL) > -1);
          assert(emails.indexOf(TEST_OTHER_EMAIL) > -1);
        }
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
