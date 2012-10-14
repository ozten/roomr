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
      console.log(data);

      body += "\n\nJoin the conversation https://roo.mr/r/" + data + "\n\n";

      var mail = "mailto:create@rooms.com?";
      mail += "subject=" + encodeURIComponent(subj);
      mail += "&body=" + encodeURIComponent(body);
      window.location.href = mail;

    },
    error: function (xhr, status, err) {
      alert('Unable to create room. Try again later');
    }
  });

});

$('#profile').bind('submit', function (e) {
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/profile',
        data: {
          name: $('#profilename').val()
        },
        success: function (data, status, xhr) {
            $('#authenticated').show();
            $('#new-user').hide();
        },
        error: function (xhr, status, err) {
            alert('Unable to update your profile. Try again later');
        }
    });
});