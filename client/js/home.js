function initNewRoom () {
  $('#new-room').bind('submit', function (e) {
    e.preventDefault();
    var subj = $('#subject').val();

    $.ajax({
      type: 'POST',
      url: '/create',
      data: {
	subject: subj
      },
      success: function (data, status, xhr) {
        window.location.href = '/r/' + data;
      },
      error: function (xhr, status, err) {
	alert('Unable to create room. Try again later');
      }
    });
    return false;
  });

}