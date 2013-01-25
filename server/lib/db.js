var avatar = require('./avatar'),
    config = require('../etc/config'),
    utils = require('./utils'),
    libravatar = require('libravatar'),
    mysql = require('mysql'),
    Step = require('step');

/**
 * When running tests, the db_vows.js test will use the database test_roomr,
 * Which it will create and destroy each time tests are run.
 *
 * The testing state is written into the process environment by db_vows.js
 * before including this module.  I'm not sure this is the "right" way to
 * do this sort of thing, but it's cheap and it works.
 */
var mysqlDBName = config.mysqlDBName;
var mysqlPassword = config.mysqlPassword;
if (process.env['ROOMR_TEST']) {
  mysqlDBName = process.env['ROOMR_TEST_DB_NAME'];
  console.log("Notice: ROOMR_TEST mode; will use database:", mysqlDBName);
}

/**
 * When running with travis-ci, no passwords
 */
if (process.env['TRAVIS']) {
  mysqlPassword = null;
  console.log(
    "Notice: TRAVIS doesn't like passwords; setting db password to null");
}

var withConn = function(cb) {
  var conn = mysql.createConnection({
    host     : config.mysqlHost,
    port     : config.mysqlPort,
    user     : config.mysqlUser,
    password : mysqlPassword,
    database : mysqlDBName
  });

  conn.connect(function(err) {
    if (err) {
      var msg = 'Unable to connect to database!!!';
      console.error(msg + ':' + err);
      cb(msg, null, function() {});
      conn.end();
    } else {
      cb(null, conn, function() {
        conn.end();
      });

    }
  });
};

exports.createRoom = function(email, roomName, cb) {
    withConn(function(err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('INSERT INTO rooms (name) ' +
                   'VALUES (?)', [roomName],
           function(err, res) {
             var roomId = res.insertId;
             if (err) {
              console.error('Error creating account:' + err);
              finCb();
              return cb (err);
             }
             finCb();
             return cb(null, roomId);


           });
      });
};

exports.addMemberToRoom = function(email, roomId, cb, conn, finCb) {
    var ins = 'INSERT INTO rooms_members (rooms_id, member_email) ' +
              'VALUES (?, ?)';
    var doQuery = function(_conn, _finCb) {
      _conn.query(ins, [roomId, email], function(err, res) {
            if (err) {
                console.error('Error adding member to room' + err);
                _finCb();
                return cb(err, false);
            }
            _finCb();
            cb(null, res.affectedRows > 0);
        });
    };
    if (! conn) {
      withConn(function(err, conn2, finCb2) {
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

exports.getRoom = function(roomId, cb) {
    withConn(function(err, conn, finCb) {
        if (err) {
          return cb(err);
        }
        conn.query('SELECT id, name FROM rooms WHERE id = ?',
                   [roomId],
                   function(err, res) {

            if (err) {
                finCb();
                return cb (err);
            }
            var room = {};
            if (1 <= res.length) room = res[0];
            conn.query(SEL_MEMBERS_BY_ROOM, [roomId], function(err, res) {
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
                Step(function() {
                  var group = this.group();
                  members.forEach (function(member) {
                    libravatar.url({
                      email: member.email,
                      size: 96
                    }, group());
                  });
                }, function(err, urls) {
                  for (var i=0; i < members.length; i++) {
                    if (i < urls.length) {
                      members[i].avatar = urls[i];
                    } else {
                      console.error('out of range');
                    }
                  }
                cb(null, {
                    room: room,
                    members: members
                });
                });

            });
        });
    });
};

exports.getProfile = function(email, cb) {
    withConn(function(err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('SELECT email, name FROM members ' +
                   'WHERE email = ? ', [email],
           function(err, res) {
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

var updateInstead = function(email, name, cb) {
    withConn(function(err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('UPDATE members SET name = ? ' +
                   'WHERE email = ?', [name, email],
                   function(err, res) {
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

exports.updateProfile = function(email, name, cb) {
    withConn(function(err, conn, finCb) {
        if (err) {
          return cb(err);
        }

        conn.query('INSERT INTO members (email, name) ' +
                   'VALUES (?, ?)', [email, name],
           function(err, res) {
             finCb();
             if (err) {
                if (/Duplicate entry .*? for key 'PRIMARY'/.test(err.message)) {
                    return updateInstead(email, name, cb);
                }
                console.error(err);
                return cb(err);
             }
             return cb(null);
           });
      });
};

exports.addEvent = function(roomId, email, type, value, cb) {
  cb = cb || function(err) {};
  withConn(function(err, conn, finCb) {
    if (err) {
      return cb(err);
    }
    var insertCb = function(err, res) {
      finCb();
      if (err) {
        console.error(err);
        cb(err);
      } else {
        return cb(null, res.insertId);
      }
    };

    conn.query('INSERT INTO events (rooms_id, member_email, etype, evalue) ' +
               'VALUES (?, ?, ?, ?)', [roomId, email, type, value], insertCb);
  });
};

exports.syncEvents = function(roomId, email, lastId, cb) {
  var sel = 'SELECT event_id AS id, member_email AS email, ' +
    'name, evalue AS message ' +
    'FROM events ' +
    'JOIN members ON events.member_email = members.email ' +
    'WHERE rooms_id = ? AND created > ' +
    '    (select entered from rooms_members where member_email = ? AND ' +
    '     rooms_id = ?) ' +
    'AND event_id > ? ORDER BY event_id';
  withConn(function(err, conn, finCb) {
    if (err) {
      return cb(err);
    }
    var selectCb = function(err, res) {
      finCb();
      if (err) {
        console.error(err);
        cb(err);
      } else {
        var sync = { roomId: roomId, events: []};
        for (var i=0; i < res.length; i++) {
          // db column type is blob...
          res[i].message = new Buffer(res[i].message, 'utf8').toString();
          res[i].avatar40 = avatar(res[i].email, 40);
          sync.events.push(res[i]);
        }
        return cb(null, sync);
      }
    };
    conn.query(sel, [roomId, email, roomId, lastId], selectCb);
  });
};
