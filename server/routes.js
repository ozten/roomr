var config = require('./etc/config'),
    db = require('./lib/db'),
    utils = require('./lib/utils'),
    https = require('https'),
    qs = require('querystring');

exports.setup = function (app) {

app.use(function (req, res, next) {
  var cu = "null",
  needsProfile = false,
  cont = function (cu) {
    console.log(cu);
    res.locals.currentUser = cu;
    res.locals.JSON = JSON;
    next();
  };

  if (req.session.email) {
    cu = '"' + req.session.email + '"';
    db.getProfile(req.session.email, function (err, profile) {
      res.locals.profile = profile;
      cont(cu);
    });
  } else {
    res.locals.profile = null;
    cont(cu);
  }
});

app.get('/', function (req, res) {
    // currrentUser must be formatted for direct output in JS
    // so null or "alice@example.com"

    var ctx = {

    };
    console.log(req.session);
    res.render('home.html', ctx);

});

app.post('/create', function (req, res) {
  var subject = req.body.subject;
  db.createRoom(req.session.email, subject, function (err, roomId) {
    if (err) {
        res.send(err, 500);
    } else {
        res.send(utils.roomIdToUrl(roomId));
    }
  });
});

app.get('/r/:roomUrl', function (req, res) {
  var roomId = utils.roomUrlToId(req.params.roomUrl);
  console.log(req.session);
  if (! req.session.email) {
    return res.render('unauthenticated.html');
  }
  db.getRoom(roomId, function (err, room) {
    if (err) {
        return res.send("Error loading room: " + err);
    } else if (! room.room.name) {
        return res.render('unknown_room.html');
    } else {
        db.addMemberToRoom(req.session.email, roomId, function (err) {
            if (err) console.error('Unable to add user to room ' + err);
        });
        console.log('room =');
        console.log(room);

        return res.render('room.html', {
            audience: config.audience,
            room: room.room,
            members: room.members
        });
    }
  });
});

app.post('/profile', function (req, res) {
    db.updateProfile(req.session.email, req.body.name, function (err) {
        if (err) {
            res.send('Unable to update profile: ' + err, 500);
        } else {
            res.send('OK');
        }
    });
});

// Widgets - return HTML fragments
app.get('/widgets/members/:roomId', function (req, res) {
  console.log('list members of ' + req.params.roomId);
  db.getRoom(req.params.roomId, function (err, room) {
    if (err) {
      console.error(err);
      res.send(err, 500);
    } else {
      res.render('widget/members.html', {members: room.members});
    }
  });
});

app.get('/widgets/new_room_form', function (req, res) {
  res.render('widget/new_room_form.html');
});

var successfulLogin = function (req, res, email) {
  req.session.email = email;
  db.getProfile(email, function (err, profile) {
    if (err) {
      res.send('Auth okay, unable to talk to DB', 500);
    } else {
      res.contentType('json');
      res.send(JSON.stringify({
        email: email,
        name: profile.name
      }));
    }

  });

};
// Persona Authentication
app.post('/auth/login', function (req, res) {

    var sent = false;
    var fail = function () {
        if (! sent) res.send('FAIL', 401);
        sent = true;
    };
    var postBody = qs.stringify({
        assertion: req.body.assertion,
        audience: config.audience
    });
    console.log(postBody);
    var opts = {
        host: 'verifier.login.persona.org',
        port: 443,
        path: '/verify',
        method: 'POST',
        headers: {
            'Content-Length': postBody.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    console.log(opts);
    var d = '';
  var originalRes = res;
    var verifier = https.request(opts, function (res) {
        if (200 === res.statusCode) {
            res.setEncoding('utf8');
            res.on('data', function(data) {
                d += data;
              });
            res.on('end', function (a, b, c) {
                var verified = JSON.parse(d);
                console.log("verifier says " + d);
                if ("okay" === verified.status &&
                    !! verified.email) {
                    successfulLogin(req, originalRes, verified.email);
                } else {
                    fail();
                }
            });
        } else {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            fail();
        }
    });
    verifier.write(postBody);
    verifier.on('error', function (e) {
        console.error(e);
        fail();
    });
    verifier.end();
});

app.post('/auth/logout', function (req, res) {
  console.log('Logging user out');
  req.session.reset();
  res.send('OK');
});

// Airplane mode
app.get('/airplane/:email', function (req, res) {
  if ('http://192.168.186.138:9714' === config.audience) {
    console.log(req.params.email);
    var email = req.params.email;
    successfulLogin(req, res, email);
  } else {
    res.send('Not enough frequent flyer miles', 401);
  }
});

};// exports
