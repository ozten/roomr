var clientSessions = require('client-sessions'),
    config = require('../etc/config'),
    middleware = clientSessions({
        cookieName: config.cookie_name,
        duration: config.duration,
        secret: config.secret,
    });

/**
 * This cookie reader simulate an express app using client sessions
 * middleware. It then gets the decrypted session and returns it
 * to the caller.
 */

module.exports = function (cookie, cb) {
  // Fake an http request, response
  var req = {
    headers: {
      cookie: cookie
    },
    connection: {
      proxySecure: false
    }
  }

  var res = {
    on: function (eventName, cb) {},
    socket: {
      encrypted: false
    }
  };

  middleware(req, res, function () {
    cb(null, req.session);
  });
};