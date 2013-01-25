var crypto = require('crypto');

module.exports = function(email, size) {
  var hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  // want to use https://seccdn.libravatar.org/ but it's failing on me
  return "http://cdn.libravatar.org/avatar/" + hash + "?s=40";
};