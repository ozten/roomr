window.connect = function (audience, roomId) {
  var socket = io.connect(audience);
  socket.on('connect', function () {
    console.log('CONNECT');
    socket.emit('subscribe room', {
      roomId: roomId
    });
    socket.emit('sync room', {
      roomId: roomId,
      eventId: 0
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

  var render = function (data) {
    // TODO unify formats of events and sync events...
    // POST ROOM
    var h = '<li>#' + data.id + ' ' + data.email + ' - ' + data.message + '</li>';
    // SYNC UPDATE
    if ('POST' === data.type) {
      h = '<li>#' + data.id + ' ' + data.email + ' - ' + data.value + '</li>';
    }
    var revchron = false;
    if (revchron)
        $('#stream ol').prepend(h);
    else
        $('#stream ol').append(h);
  };
  socket.on('post message', function (data) {
      if (! knownEmails[currentUser]) {
	knownEmails[currentUser] = true;
	$('#members').load('/widgets/members/' + roomId);
      } else if (! knownEmails[data.email]) {
        knownEmails[data.email] = true;
	$('#members').load('/widgets/members/' + roomId);
      }
    console.log(data);
    render(data);  
    //window.scrollTo(0, 1000000);
  });
  socket.on('sync update', function (data) {
    console.log('SYNC UPDATE', data);
    for (var i=0; i < data.events.length; i++) {
      render(data.events[i]);
      console.log(i, data.events[i]);
    }
  });

  $('#editor form textarea').bind('keyup', function (e) {
    if (e.keyCode === 13) {
      $('#editor form').trigger('submit');
    }
  }).focus();

  $('#editor form').bind('submit', function (e) {
      e.preventDefault();
      socket.emit('post room', {
        roomId: roomId,
        message: $('textarea', this).val()
      });
      $('textarea', this).val('');
  });

var newRoomTabLoaded = false;
$('#new-room-tab, #new-room-button').click(function (e) {
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

var layout = function () {
  var mH = $('#members').height();
  var eH = $('#editor').height();
  var titleH = 50; /* #room-name */
  var dH = document.body.clientHeight;
  // TODO A/B testing
  if (true == false) {
    $('#stream').css('height', (dH - mH - titleH - eH) + 'px');
  }
};
$(window).resize(layout);
$(document).ready(function () {
  layout();
});