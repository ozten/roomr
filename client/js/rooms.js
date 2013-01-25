
window.connect = function(audience, roomId) {
  var socket = io.connect(audience);
  socket.on('connect', function() {
    console.log('CONNECT');
    socket.emit('subscribe room', {
      roomId: roomId
    });
    socket.emit('sync room', {
      roomId: roomId,
      eventId: 0
    });
  });

  socket.on('connecting', function() {
      console.log('CONNECTING');
  });
  socket.on('disconnect', function() {
      console.log('DISCONNECT');
  });
  socket.on('connect_failed', function() {
      console.log('CONNECT FAILED');
  });
  socket.on('error', function() {
      console.log('ERROR');
  });
  socket.on('reconnect', function() {
      console.log('RECONNECT');
  });
  socket.on('reconnecting', function() {
      console.log('RECONNECTING');
  });

  console.log(knownEmails);

  // underscore.js template interpolation settings; for replacing template vars
  _.templateSettings = {
    interpolate: /\$\{(.+?)\}/g
  };

  var messageTemplate = _.template($("#message_template").html());

  var renderMessage = function(data) {
    // TODO unify formats of events and sync events...
    // POST ROOM
    // SYNC UPDATE
    if ('POST' === data.type) {
      data.message = data.value;
    }

    // placeholders while i block out the css
    //data.name = "Author's Name";
    data.avatar40 = data.avatar40 || "http://cdn.libravatar.org/nobody/40.png";
    data.date = (new Date()).toISOString();

    var h = messageTemplate(data);
    $("date.timeago").timeago();

    var revchron = false;
    if (revchron)
        $('#stream ol').prepend(h);
    else
        $('#stream ol').append(h);
  };

  var renderNewUser = function(profile) {
    profile.date = (new Date()).toISOString();
    var h = _.template($("#new_user_template").html())(profile);
    $('#stream ol').prepend(h);
  };

  socket.on('post message', function(data) {
      if (! knownEmails[currentUser]) {
        knownEmails[currentUser] = true;
        $('#members').load('/widgets/members/' + roomId);
      } else if (! knownEmails[data.email]) {
        knownEmails[data.email] = true;
        $('#members').load('/widgets/members/' + roomId);
      }
    renderMessage(data);
    //window.scrollTo(0, 1000000);
  });
  socket.on('new user', function(profile) {
    renderNewUser(profile);
  });
  socket.on('sync update', function(data) {
    console.log('SYNC UPDATE', data);
    for (var i=0; i < data.events.length; i++) {
      console.log(i, data.events[i]);
      try {
        var event = JSON.parse(data.events[i].message);
        if (event.name) renderNewUser(event);
      } catch (e) {
        console.log(e);
        // TODO Unify POST are a string, while NEW USER are JSON
        renderMessage(data.events[i]);
      }
    }
  });

  $('#editor form textarea').bind('keyup', function(e) {
    if (e.keyCode === 13) {
      $('#editor form').trigger('submit');
    }
  }).focus();

  $('#editor form').bind('submit', function(e) {
      e.preventDefault();
      socket.emit('post room', {
        roomId: roomId,
        message: $('textarea', this).val()
      });
      $('textarea', this).val('');
  });

var newRoomTabLoaded = false;
$('#new-room-tab, #new-room-button').click(function(e) {
  e.preventDefault();

  if (! newRoomTabLoaded) {
    newRoomTabLoaded = true;
    $('#new-room-stub').load('/widgets/new_room_form', function() {
      $('head').append('<link rel="stylesheet" media="screen,projection,tv" href="/css/home.css" />');
      initNewRoom();
      $('.cancel', $('#new-room-stub')).click(function(e) {
        e.preventDefault();
        $('#new-room-stub').hide();
      });
    });
  }
  $('#new-room-stub').show();

});

  $('button').bind('click', function(e) {e.preventDefault(); alert('Would eventually be a photo picker and uploader'); });
};

var layout = function() {
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
$(document).ready(function() {
  layout();
});
