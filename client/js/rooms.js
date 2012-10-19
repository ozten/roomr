window.connect = function (audience, roomId) {
  var socket = io.connect(audience);
  socket.on('connect', function () {
      console.log('CONNECT');
      socket.emit('subscribe room', {
        roomId: roomId
    });
  });

  socket.on('connecting', function () {
      console.log('CONNECTING');
  });
  socket.on('disconnect', function () {
      console.log('DISCONNECT');
  });
  socket.on('connect_failed', function () {
      console.log('CONNECT FAILED');
  });
  socket.on('error', function () {
      console.log('ERROR');
  });
  socket.on('reconnect', function () {
      console.log('RECONNECT');
  });
  socket.on('reconnecting', function () {
      console.log('RECONNECTING');
  });

  socket.on('post message', function (data) {
      console.log(data);
      var h = '<li>' + data.email + ' - ' + data.message + '</li>';

      var revchron = false;
      if (revchron)
          $('#stream ol').prepend(h);
      else
          $('#stream ol').append(h);

      window.scrollTo(0, 1000000);

  });

  $('#editor form').bind('submit', function (e) {
      e.preventDefault();
      socket.emit('post room', {
        roomId: roomId,
        message: $('textarea', this).val()
      });
      $('textarea', this).val('');

  });

  $('button').bind('click', function (e) {e.preventDefault(); alert('Would eventually be a photo picker and uploader') });
};