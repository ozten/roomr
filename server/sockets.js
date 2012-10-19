var cookieReader = require('./lib/client_sessions_cookie_reader'),
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
       socket.on('post room', function (data) {
        console.log('== SIO post room', data);
        // checkMemberOfRoom(data.roomId, function (err, isMember) {})
        //socket.get('email')}

        socket.get('email', function (err, email) {
          if (! err)
          io.sockets.in(data.roomId).emit('post message', {message: data.message, email: email});
        });



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