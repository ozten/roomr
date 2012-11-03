
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

  console.log(knownEmails);
  socket.on('post message', function (data) {
      if (! knownEmails[currentUser]) {
	knownEmails[currentUser] = true;
	$('#members').load('/widgets/members/' + roomId);
      } else if (! knownEmails[data.email]) {
        knownEmails[data.email] = true;
	$('#members').load('/widgets/members/' + roomId);
      }
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

var newRoomTabLoaded = false;
$('#new-room-tab').click(function (e) {
  e.preventDefault();

  if (! newRoomTabLoaded) {
    newRoomTabLoaded = true;
    $('#new-room-stub').load('/widgets/new_room_form', function () {
      $('head').append('<link rel="stylesheet" media="screen,projection,tv" href="/css/home.css" />');
      initNewRoom();
      $('.cancel', $('#new-room-stub')).click(function (e) {
	e.preventDefault();
        $('#new-room-stub').hide();
      });
    });
  }
  $('#new-room-stub').show();

});

  $('button').bind('click', function (e) {e.preventDefault(); alert('Would eventually be a photo picker and uploader'); });
};