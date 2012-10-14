var config = require('../etc/config'),
    crypto = require('crypto'),
    mysql = require('mysql');

var withConn = function (cb) {
  var conn = mysql.createConnection({
    host     : config.mysqlHost,
    port     : config.mysqlPort,
    user     : config.mysqlUser,
    password : config.mysqlPassword,
    database : config.mysqlDBName
  });
  conn.connect(function (err) {
    if (err) {
      var msg = 'Unable to connect to database!!!';
      console.error(msg + ':' + err);
      cb(msg, null);
    } else {
      cb(null, conn);
      conn.end();
    }
  });
};

exports.createRoom = function (email, roomName, cb) {

    withConn(function (err, conn) {
        if (err) {
          return cb(err);
        }

        hash = crypto.createHash('sha256');
        hash.update(email);
        hash.update(roomName);
        var id = hash.digest('hex');

        conn.query('INSERT INTO rooms (id, name) ' +
                   'VALUES (?, ?)', [id, roomName],
           function (err, res) {
             if (err) {
              console.error('Error createing account:' + err);
              return cb (err);
             }
             cb(null, id);
           });
      });
};

exports.getProfile = function (email, cb) {
    withConn(function (err, conn) {
        if (err) {
          return cb(err);
        }

        conn.query('SELECT email, name FROM members ' +
                   'WHERE email = ? ', [email],
           function (err, res) {
             if (err) {
              console.error('Error getting profile:' + err);
              return cb (err);
             }
             if (1 <= res.length) return cb(null, res[0]);
             else
                cb(null, {});
              });
           });
};

var updateInstead = function (email, name, cb) {
    withConn(function (err, conn) {
        if (err) {
          return cb(err);
        }

        conn.query('UPDATE members SET name = ? ' +
                   'WHERE email = ?', [name, email],
                   function (err, res) {
                    if (err) {
                        console.error('Error updating profile:' + err);
                        return cb (err);
                    } else {
                        return cb(null);
                    }

                    });
    });
};

exports.updateProfile = function (email, name, cb) {
    withConn(function (err, conn) {
        if (err) {
          return cb(err);
        }

        conn.query('INSERT INTO members (email, name) ' +
                   'VALUES (?, ?)', [email, name],
           function (err, res) {
             if (err) {
                console.error(err);
                return updateInstead(email, name, cb);
             } else {
                return cb(null);
             }
           });
      });
};