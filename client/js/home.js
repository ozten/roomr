function initNewRoom () {
  $('#new-room').bind('submit', function (e) {
    e.preventDefault();
    var subj = $('#subject').val(),
    body = $('#body').val();

    $.ajax({
      type: 'POST',
      url: '/create',
      data: {
	subject: subj,
	body: body
      },
      success: function (data, status, xhr) {
	body += "\n\nJoin the conversation http://roomr.co/r/" + data + "\n\n";

	var mail = "mailto:create@rooms.com?";
	mail += "subject=" + encodeURIComponent(subj);
	mail += "&body=" + encodeURIComponent(body);
	window.location.href = mail;

      },
      error: function (xhr, status, err) {
	alert('Unable to create room. Try again later');
      }
    });
    return false;
  });

}