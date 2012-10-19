var socket = io.connect('http://192.168.186.138:9714/');
socket.on('connect', function () {
    console.log('CONNECT');
    socket.emit('subscribe room', {
      roomId: '1dc994783d8b1cf144bcd0d226d1f9a63d102d113a7c09b03aab5ff8733bf10f'
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
    var h = '<li>' + data.email + ' said ' + data.message + '</li>';

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
      roomId: '1dc994783d8b1cf144bcd0d226d1f9a63d102d113a7c09b03aab5ff8733bf10f',
      message: $('textarea', this).val()
    });
    $('textarea', this).val('');

});

$('button').bind('click', function (e) {e.preventDefault(); alert('Would eventually be a photo picker and uploader') });