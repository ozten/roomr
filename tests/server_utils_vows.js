const
vows = require('vows'),
assert = require('assert'),
utils = require('../server/lib/utils');

vows.describe("Server utils")

.addBatch({
  "IDs can be converted to unique strings": function() {
    var ids = [0, 1, 2, 3, 10, 100, 1000, 10000, 1000000, 10000000];
    var seen = {};
    ids.forEach(function(id) {
      var url = utils.roomIdToUrl(id);
      assert(typeof url === 'string');
      assert(seen[url] === undefined);
      seen[url] = true;
    });
  },

  "URLs can be converted to unique integers": function() {
    var urls = ['0', '1', '2', '3', 'a', '1C', 'g8', '2Bi', '4c92', 'FXsk'];
    var id = 0;
    var seen = {};
    urls.forEach(function(url) {
      var id = utils.roomUrlToId(url);
      assert(typeof id === 'number');
      assert(seen[id] === undefined);
      seen[id] = true;
    });
  },

  "IDs to URLs to IDs round trip": function() {
    var ids = [0, 1, 2, 3, 10, 100, 1000, 10000, 1000000, 10000000];
    var urls = [];
    ids.forEach(function(id) {
      urls.push(utils.roomIdToUrl(id));
    });
    assert(ids.length === urls.length);

    urls.forEach(function(url, i) {
      assert(ids[i] === utils.roomUrlToId(url));
    });
  }
})

.export(module);
