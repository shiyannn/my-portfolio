
(function () {
  'use strict';

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setInvalid(field, invalid) {
    field.classList.toggle('invalid', invalid);
    var control = field.querySelector('input, textarea');
    if (control) control.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function init() {
    var form = document.getElementById('contact-form');
    var note = document.getElementById('form-note');
    if (!form || !note) return;

    var name = document.getElementById('name');
    var email = document.getElementById('email');
    var message = document.getElementById('message');

    [name, email, message].forEach(function (control) {
      if (!control) return;
      control.addEventListener('input', function () {
        var field = control.closest('.field');
        if (field.classList.contains('invalid')) setInvalid(field, false);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var nameOk = name.value.trim().length > 0;
      var emailOk = EMAIL_PATTERN.test(email.value.trim());
      var messageOk = message.value.trim().length > 0;

      setInvalid(name.closest('.field'), !nameOk);
      setInvalid(email.closest('.field'), !emailOk);
      setInvalid(message.closest('.field'), !messageOk);

      if (!nameOk || !emailOk || !messageOk) {
        note.classList.remove('ok');
        note.textContent = 'Please fix the highlighted fields and try again.';
        var firstInvalid = form.querySelector('.field.invalid input, .field.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      note.classList.add('ok');
      note.textContent = 'Thanks, ' + name.value.trim().split(' ')[0] + ' — your message is ready to send.';
      form.reset();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
