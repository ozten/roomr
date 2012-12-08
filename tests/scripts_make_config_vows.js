const
vows = require('vows'),
assert = require('assert'),
makeConfig = require('../scripts/make_config');

vows.describe("scripts/make_config.js")

.addBatch({
  "Generates config with valid": {
    topic: function() {
      return makeConfig("http://12.34.56.78");
    },

    "secret": function(config) {
      assert(! config.match(/CHANGE ME INTO SOMETHING RANDOM/));
      assert(/exports\.secret = '[^-]+';/.test(config));
    },

    "audience": function(config) {
      assert(! config.match(/exports\.audience = "localhost"/));
      assert(/exports\.audience = "http:\/\/12\.34\.56\.78";/.test(config));
    },

    "mysqlUser": function(config) {
      assert(config.match(/exports\.mysqlUser = "roomr";/));
    },

    "mysqlPassword": function(config) {
      // no password on awsbox
      assert(config.match(/exports\.mysqlPassword = null;/));
    },

    "mysqlDBName": function(config) {
      assert(config.match(/exports\.mysqlDBName = "roomr";/));
    }
  }
})

.export(module);
