var config = require('../etc/config'),
    crypto = require('crypto'),
    libravatar = require('libravatar'),
    mysql = require('mysql'),
    Step = require('step');

var withConn = function (cb) {
  var conn = mysql.createConnection({
    host     : config.mysqlHost,
    port     : config.mysqlPort,
    user     : config.mysqlUser,
    password : config.mysqlPassword,
    database : config.mysqlDBName
  });
  console.log('opening conn');
  conn.connect(function (err) {
    if (err) {
      var msg = 'Unable to connect to database!!!';
      console.error(msg + ':' + err);
      cb(msg, null, function () {});
      conn.end();
    } else {
      cb(null, conn, function () {
        console.log('closing conn');
        conn.end();
      });

    }
  });
};

exports.createRoom = function (email, roomName, cb) {
    withConn(function (err, conn, finCb) {
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
              finCb();
              return cb (err);
             }
             exports.addMemberToRoom(email, id, function (err) {
                if (err) {
                    return cb(err);
                }
                return cb(null, id);
             }, conn, finCb);

           });
      });
};

exports.addMemberToRoom = function (email, roomId, cb, conn, finCb) {
    var ins = 'INSERT INTO rooms_members (rooms_id, member_email) ' +
              'VALUES (?, ?)';
    var doQuery = function (_conn, _finCb) {
      _conn.query(ins, [roomId, email], function (err, res) {
            if (err) {
                console.error('Error adding member to room' + err);
                _finCb();
                return cb(err);
            }
            _finCb();
            cb(null);
        });
    };
    if (! conn) {
      withConn(function (err, conn2, finCb2) {
        doQuery(conn2, finCb2);
      });
    } else {
      doQuery(conn, finCb);
    }
};

const SEL_MEMBERS_BY_ROOM = 'SELECT members.email, members.name ' +
    'FROM members ' +
    'JOIN rooms_members ON members.email = rooms_members.member_email ' +
    'WHERE rooms_members.rooms_id = ?';

exports.getRoom = function (roomId, cb) {
    withConn(function (err, conn, finCb) {
        if (err) {
          return cb(err);
        }
        conn.query('SELECT id, name FROM rooms WHERE id = ?',
                   [roomId],
                   function (err, res) {

            if (err) {
                finCb();
                return cb (err);
            }
            var room = {};
            if (1 <= res.length) room = res[0];
            conn.query(SEL_MEMBERS_BY_ROOM, [roomId], function (err, res) {
                if (err) {
                    console.log('Unable to load members in room' + err);
                    finCb();
                    return cb(err);
                }
                var members = [];
                for (var i=0; i < res.length; i++) {
                  members.push(res[i]);
                }
                finCb();
                console.log('BEG retrieving images');
                Step(function () {
                  var group = this.group();
                  members.forEach (function (member) {
                    console.log('Going for ' + member.email);
                    libravatar.url({
                      email: member.email,
                      size: 96
                    }, group());
                  });
                }, function (err, urls) {
                  console.log('Step 2 err=' + err);
                  console.log(urls);
                  for (var i=0; i < members.length; i++) {
                    if (i < urls.length) {
                      members[i].avatar = urls[i];
                    } else {
                      console.error('out of range');
                    }
                  }
                  console.log(members);
                console.log('FIN retrieving images');
                cb(null, {
                    room: room,
                    members: members
                });
                });

            });
        });
    });
};

exports.getProfile = function (email, cb) {
    withConn(function (err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('SELECT email, name FROM members ' +
                   'WHERE email = ? ', [email],
           function (err, res) {
             if (err) {
              console.error('Error getting profile:' + err);
              finCb();
              return cb (err);
             }
             if (1 <= res.length) {
                finCb();
                return cb(null, res[0]);
             } else {
                finCb();
                cb(null, {});
             }

          });
       });
};

var updateInstead = function (email, name, cb) {
    withConn(function (err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('UPDATE members SET name = ? ' +
                   'WHERE email = ?', [name, email],
                   function (err, res) {
                    if (err) {
                        finCb();
                        console.error('Error updating profile:' + err);
                        return cb (err);
                    } else {
                        finCb();
                        return cb(null);
                    }

                    });
    });
};

exports.updateProfile = function (email, name, cb) {
    withConn(function (err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('INSERT INTO members (email, name) ' +
                   'VALUES (?, ?)', [email, name],
           function (err, res) {
             if (err) {
                console.error(err);
                finCb();
                return updateInstead(email, name, cb);
             } else {
                finCb();
                return cb(null);
             }
           });
      });
};