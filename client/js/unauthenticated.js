$('#new-user').hide();
$('body').bind('auth-login', function (e) {
    window.location.reload();
});