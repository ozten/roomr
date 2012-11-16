$('#signinpanel').show();
/*var signinLink = document.getElementById('signin');
if (signinLink) {
  signinLink.onclick = function(e) {
    */

$('.persona-button.signin').bind('click', function (e) {
  e.preventDefault();
  $('#signinpanel').hide();
  navigator.id.request();
});

/*var signoutLink = document.getElementById('signout');
if (signoutLink) {
  signoutLink.onclick = function(e) {
  */
$('.signout').bind('click', function (e) {
  e.preventDefault();
  $('#signinpanel').hide();
  navigator.id.logout();
});

if (!! currentUser) {
    $('#signout-button').show();
    $('#authenticated').show();
    $('#signin-header-button').hide();
    $('#welcome').hide();
} else {
    $('#signin-header-button').show();
    $('#welcome').show();
    $('#signout-button').hide();
    $('#authenticated').hide();
}

navigator.id.watch({
  loggedInUser: currentUser,
  onlogin: function(assertion) {
    // A user has logged in! Here you need to:
    // 1. Send the assertion to your backend for verification and to create a session.
    // 2. Update your UI.

    $.ajax({ /* <-- This example uses jQuery, but you can use whatever you'd like */
      type: 'POST',
      url: '/auth/login', // This is a URL on your website.
      data: {assertion: assertion},
      success: function(res, status, xhr) {

        $('body').trigger('auth-login');

        $('#signout-button').show();
        if (res.name) {
          $('#authenticated').show();
        } else {
          collectProfile();
        }

        $('#signin-header-button').hide();
        $('#welcome').hide();
        $('#signinpanel').show();

        //window.location.reload();
      },
      error: function(res, status, xhr) {
        $('#signinpanel').show();
        alert("login failure" + res);
      }
    });
  },
  onlogout: function() {
    // A user has logged out! Here you need to:
    // Tear down the user's session by redirecting the user or making a call to your backend.
    // Also, make sure loggedInUser will get set to null on the next page load.
    // (That's a literal JavaScript null. Not false, 0, or undefined. null.)
    $('#signinpanel').hide();
    $.ajax({
      type: 'POST',
      url: '/auth/logout', // This is a URL on your website.
      success: function(res, status, xhr) {
        $('body').trigger('auth-logout');
        $('#signin-header-button').show();
        $('#welcome').show();
        $('#signout-button').hide();
        $('#authenticated').hide();
        $('#new-user').hide();
        $('#signinpanel').show();

        window.location.reload();
      },
      error: function(res, status, xhr) {
        $('#signinpanel').show();
         alert("logout failure" + res); }
    });
  }
});

function collectProfile () {
  $('#new-user').show();
}

function hideProfileForm () {
  $('#authenticated').show();
  $('#new-user').hide();
}

$('#profile').bind('submit', function (e) {
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/profile',
        data: {
          name: $('#profilename').val()
        },
        success: function (data, status, xhr) {
          hideProfileForm();
          $('body').trigger('page_loaded_user_ready');          
        },
        error: function (xhr, status, err) {
            alert('Unable to update your profile. Try again later');
        }
    });
});