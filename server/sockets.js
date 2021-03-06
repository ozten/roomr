var avatar = require('./lib/avatar'),
    config = require('./etc/config'),
    cookieReader = require('./lib/client_sessions_cookie_reader'),
    db = require('./lib/db'),
    socket_io = require('socket.io'),
    webremix = require('webremix');

exports.setup = function(app) {
    var io = socket_io.listen(app);

    io.configure(function() {
      io.set('log level', config.logLevel);
      io.set('authorization', function(handshakeData, cb) {
        cookieReader(handshakeData.headers.cookie, function(err, session) {
          console.log('SESSION=', session);
          console.log('User is allowed? ', (!!session && !!session.email));
          var authed = (!!session && !!session.email);
          if (authed) handshakeData.email = session.email;
          cb(null, authed);
        });

      });
    });

    /**
     *
     */
    io.sockets.on('connection', function(socket) {
      console.log('== SIO connection');
      socket.set('email', socket.handshake.email);

      /**
       * Message Posted To A Room
       *   others get the update and message is queued into messages table (?)
       */

       /** User Joins Room
       *
       */

       socket.on('subscribe room', function(data) {
         var email = socket.handshake.email;
         socket.join(data.roomId);
         // checkMemberOfRoom(data.roomId, function(err, isMember) {})
         db.addMemberToRoom(email, data.roomId, function(err, newUser) {
           if (err) {
             console.error(err);
           }
           if (newUser) {
             db.getProfile(email, function(err, profile) {
               profile.avatar40 = avatar(email, 40);
               db.addEvent(data.roomId, email, 'NEWUSER', JSON.stringify(profile), function(err, eventId) {
                 if (err) {
                   console.log('ERROR saving post room event');
                   console.log(err);
                 } else {
                   profile.event_id = eventId;
                   io.sockets.in(data.roomId).emit('new user', profile);
                 }
               });
             });
           }
         });
       });

      /**
       * Sync Room - backfill missed messages
       */
       socket.on('sync room', function(data) {
        console.log('== SIO sync room ' + data.roomId + ' ' + data.eventId);
        // checkMemberOfRoom(data.roomId, function(err, isMember) {})
         db.syncEvents(data.roomId, socket.handshake.email, data.eventId, function(err, syncData) {
           if (err) {
             console.error('Unable to get sync data from db');
             console.log(err);
           } else {
             // socket.emit send only to that user
             // io.sockets.in(room).emit sends to all users of a room
             // io.sockets.emit sends to all users (???)
             socket.emit('sync update', syncData);
           }
         });
       });
       socket.on('post room', function(data) {
         var email = socket.handshake.email;
         //roomId memberEmail, type, value
         console.log('== SIO post room', data, socket.handshake.email);
	 var options = { width: 500 };
         webremix.generate(data.message, options, function(err, message) {
           db.addEvent(data.roomId, email, 'POST', message, function(err, eventId) {
             if (err) {
               console.log('ERROR saving post room event');
               console.log(err);
             } else {
               db.getProfile(email, function(err, profile) {
		 if (! err) {
                   var post = {
                     id: eventId,
                     message: message,
                     email: email,
                     name: profile.name,
                     avatar40: avatar(email, 40) };
                   io.sockets.in(data.roomId).emit('post message', post);
		 }
               });
             }
           });
	 });
        // checkMemberOfRoom(data.roomId, function(err, isMember) {})
        //socket.get('email')}





       });
       socket.on('unsubscribe room', function(data) {
        console.log('== SIO unsubscribe room ' + data.roomId);
        socket.leave(data.roomId);
       });

       /**
       * User Leaves a Room
       *
       * User Changes Profile
       */

      /**
       *
       */
      socket.on('disconnect', function() {
        console.log('== SIO disconnect');
        io.sockets.emit('user disconnected');
      });

    }); // connection
};
