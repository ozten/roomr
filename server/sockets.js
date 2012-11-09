var cookieReader = require('./lib/client_sessions_cookie_reader'),
    db = require('./lib/db'),
    socket_io = require('socket.io');

exports.setup = function (app) {
    var io = socket_io.listen(app);

    io.configure(function () {
      io.set('authorization', function (handshakeData, cb) {
        cookieReader(handshakeData.headers.cookie, function (err, session) {
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
    io.sockets.on('connection', function (socket) {
      console.log('== SIO connection');
      socket.set('email', socket.handshake.email);

      /**
       * Message Posted To A Room
       *   others get the update and message is queued into messages table (?)
       */

       /** User Joins Room
       *
       */

       socket.on('subscribe room', function (data) {
        console.log('== SIO subscribe room ' + data.roomId);
        // checkMemberOfRoom(data.roomId, function (err, isMember) {})
        socket.join(data.roomId);
       });

      /**
       * Sync Room - backfill missed messages
       */
       socket.on('sync room', function (data) {
        console.log('== SIO sync room ' + data.roomId + ' ' + data.eventId);
        // checkMemberOfRoom(data.roomId, function (err, isMember) {})
	 db.syncEvents(data.roomId, socket.handshake.email, data.eventId, function (err, syncData) {
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
       socket.on('post room', function (data) {
         //roomId memberEmail, type, value
         console.log('== SIO post room', data, socket.handshake.email);
         db.addEvent(data.roomId, socket.handshake.email, 'POST', data.message, function (err, eventId) {
	   if (err) {
	     console.log('ERROR saving post room event');
	     console.log(err);
	   } else {
             socket.get('email', function (err, email) {
               if (! err) {
		 var post = { id: eventId, message: data.message, email: email };
		 io.sockets.in(data.roomId).emit('post message', post);
	       }
             });
	   }
	 });
        // checkMemberOfRoom(data.roomId, function (err, isMember) {})
        //socket.get('email')}





       });
       socket.on('unsubscribe room', function (data) {
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
      socket.on('disconnect', function () {
        console.log('== SIO disconnect');
        io.sockets.emit('user disconnected');
      });

    }); // connection
};