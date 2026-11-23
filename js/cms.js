/**
 * cms.js — edición visual en vivo del sitio público.
 *
 * 1) Siempre (con o sin sesión): aplica window.GJL_CONTENT[pagina] sobre
 *    cualquier elemento [data-cms]/[data-cms-image], igual que common.js
 *    ya hace con GJL_CONTACT. Esto funciona también en GitHub Pages
 *    (contenido estático, sin PHP).
 * 2) Solo en este servidor local (XAMPP con admin/*.php real): si hay
 *    sesión de admin activa, agrega un botón de modo edición — al
 *    activarlo, cada bloque se vuelve editable ahí mismo y un botón
 *    "Guardar cambios" publica todo con una sola petición.
 *
 * admin/ no existe en GitHub Pages (está en .gitignore), así que los
 * fetch a admin/whoami.php simplemente fallan ahí y el sitio se queda
 * en modo solo-lectura — ningún error visible, es el comportamiento
 * esperado.
 */
(function () {
  'use strict';

  var PAGE = document.body.getAttribute('data-page');
  var CONTENT = (window.GJL_CONTENT && PAGE && window.GJL_CONTENT[PAGE]) || {};

  function applyContent() {
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var key = el.getAttribute('data-cms');
      if (!(key in CONTENT)) return;
      el.textContent = CONTENT[key];
    });
    document.querySelectorAll('[data-cms-image]').forEach(function (el) {
      var key = el.getAttribute('data-cms-image');
      if (key in CONTENT) el.setAttribute('src', CONTENT[key]);
    });
  }
  applyContent();

  if (!PAGE) return; // página sin modo edición (ej. 404.html)

  var editMode = false;
  var dirty = {}; // key -> { type, value, file }
  var widget, toggleBtn, saveBar, saveCount, toast;

  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function markDirty(key, type, value, file) {
    dirty[key] = { type: type, value: value, file: file || null };
    updateSaveBar();
  }

  function updateSaveBar() {
    var n = Object.keys(dirty).length;
    if (!saveBar) return;
    if (n > 0) {
      saveBar.classList.add('cms-show');
      saveCount.textContent = n === 1 ? '1 cambio sin guardar' : (n + ' cambios sin guardar');
    } else {
      saveBar.classList.remove('cms-show');
    }
  }

  function showToast(msg, isError, duration) {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'cms-toast cms-show' + (isError ? ' cms-toast-error' : '');
    setTimeout(function () { toast.classList.remove('cms-show'); }, duration || 3200);
  }

  function enableEditing() {
    document.body.classList.add('cms-editing');

    qsa('[data-cms]').forEach(function (el) {
      if (el.hasAttribute('data-cms-mirror')) return; // los duplicados (ej. carrusel) solo reciben el espejo
      el.setAttribute('contenteditable', 'plaintext-only');
      el.classList.add('cms-editable');
      el.addEventListener('input', function () {
        var key = el.getAttribute('data-cms');
        markDirty(key, 'text', el.textContent);
        qsa('[data-cms="' + key + '"][data-cms-mirror]').forEach(function (mirror) {
          mirror.textContent = el.textContent;
        });
      });
    });

    qsa('[data-cms-image]').forEach(function (img) {
      if (img.hasAttribute('data-cms-mirror')) return; // los duplicados (ej. carrusel de clientes) solo reciben el espejo de src
      var key = img.getAttribute('data-cms-image');
      var wrap = document.createElement('span');
      wrap.className = 'cms-img-edit';
      // Si la imagen es position:absolute (ej. el fondo del hero, que llena
      // a su sección), el wrapper debe heredar ese mismo posicionamiento
      // "inset:0" — si no, el span queda en flujo normal sin tamaño propio
      // (un hijo absoluto no aporta tamaño a su padre) y colapsa a 0x0,
      // haciendo que la imagen de adentro desaparezca por completo.
      var imgPos = getComputedStyle(img).position;
      if (imgPos === 'absolute' || imgPos === 'fixed') {
        wrap.style.position = imgPos;
        wrap.style.inset = '0';
      }
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);

      var overlay = document.createElement('button');
      overlay.type = 'button';
      overlay.className = 'cms-img-overlay';
      overlay.textContent = 'Cambiar imagen';
      wrap.appendChild(overlay);

      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.className = 'cms-hidden-file';
      wrap.appendChild(input);

      overlay.addEventListener('click', function (e) {
        e.preventDefault();
        input.click();
      });
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        var url = URL.createObjectURL(file);
        img.src = url;
        qsa('[data-cms-image="' + key + '"]').forEach(function (other) { other.src = url; });
        markDirty(key, 'image', CONTENT[key] || '', file);
      });
    });
  }

  function disableEditing() {
    document.body.classList.remove('cms-editing');
    qsa('[data-cms][contenteditable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
      el.classList.remove('cms-editable');
    });
    qsa('.cms-img-edit').forEach(function (wrap) {
      var img = wrap.querySelector('img');
      wrap.parentNode.insertBefore(img, wrap);
      wrap.remove();
    });
  }

  function discardChanges() {
    dirty = {};
    location.reload();
  }

  function saveChanges() {
    var keys = Object.keys(dirty);
    if (!keys.length) return;
    var blocks = keys.map(function (k) { return { key: k, type: dirty[k].type, value: dirty[k].value }; });
    var fd = new FormData();
    fd.append('page', PAGE);
    fd.append('blocks', JSON.stringify(blocks));
    keys.forEach(function (k) {
      if (dirty[k].file) fd.append('file_' + k, dirty[k].file);
    });

    var btn = saveBar.querySelector('.cms-save-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando…';

    fetch('admin/save-content.php', { method: 'POST', credentials: 'include', body: fd })
      .then(function (r) { return r.json().catch(function () { throw new Error('Respuesta inválida (¿se cerró la sesión?)'); }); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || 'Error al guardar.');
        Object.assign(CONTENT, data.saved);
        dirty = {};
        updateSaveBar();
        showToast('Guardado y publicado.');
      })
      .catch(function (err) {
        showToast(err.message || 'No se pudo guardar.', true);
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Guardar cambios';
      });
  }

  function buildWidget(loggedIn, username) {
    if (widget) widget.remove();
    widget = document.createElement('div');
    widget.className = 'cms-widget';

    if (!loggedIn) {
      var accessBtn = document.createElement('button');
      accessBtn.type = 'button';
      accessBtn.className = 'cms-access-btn';
      accessBtn.textContent = 'Acceso';
      accessBtn.addEventListener('click', openAuthModal);
      widget.appendChild(accessBtn);
    } else {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'cms-toggle-btn';
      toggleBtn.textContent = 'Modo edición';
      toggleBtn.addEventListener('click', function () {
        editMode = !editMode;
        toggleBtn.classList.toggle('cms-on', editMode);
        toggleBtn.textContent = editMode ? 'Editando · ' + username : 'Modo edición';
        if (editMode) {
          enableEditing();
          showToast('Haz clic en cualquier texto para escribir encima. En las fotos, usa el botón ✎ para cambiarlas.', false, 5200);
        } else {
          disableEditing();
        }
      });
      widget.appendChild(toggleBtn);

      var logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'cms-logout-btn';
      logoutBtn.textContent = 'Salir';
      logoutBtn.addEventListener('click', function () {
        fetch('admin/public-logout.php', { method: 'POST', credentials: 'include' }).then(function () { location.reload(); });
      });
      widget.appendChild(logoutBtn);
    }

    document.body.appendChild(widget);
  }

  function openAuthModal() {
    var overlay = document.createElement('div');
    overlay.className = 'cms-modal-overlay';
    overlay.innerHTML =
      '<div class="cms-modal">' +
      '  <div class="cms-modal-tabs">' +
      '    <button type="button" class="cms-tab cms-tab-active" data-tab="login">Ingresar</button>' +
      '    <button type="button" class="cms-tab" data-tab="register">Crear cuenta</button>' +
      '  </div>' +
      '  <form class="cms-form" data-form="login">' +
      '    <label>Usuario<input type="text" name="username" required autocomplete="username"></label>' +
      '    <label>Contraseña<input type="password" name="password" required autocomplete="current-password"></label>' +
      '    <div class="cms-form-error" hidden></div>' +
      '    <button type="submit" class="btn btn-primary">Ingresar</button>' +
      '  </form>' +
      '  <form class="cms-form" data-form="register" hidden>' +
      '    <label>Usuario nuevo<input type="text" name="username" required autocomplete="username"></label>' +
      '    <label>Contraseña (mín. 6 caracteres)<input type="password" name="password" required autocomplete="new-password" minlength="6"></label>' +
      '    <div class="cms-form-error" hidden></div>' +
      '    <button type="submit" class="btn btn-primary">Crear cuenta y entrar</button>' +
      '  </form>' +
      '  <button type="button" class="cms-modal-close" aria-label="Cerrar">&times;</button>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.cms-modal-close').addEventListener('click', function () { overlay.remove(); });

    qsa('.cms-tab', overlay).forEach(function (tab) {
      tab.addEventListener('click', function () {
        qsa('.cms-tab', overlay).forEach(function (t) { t.classList.remove('cms-tab-active'); });
        tab.classList.add('cms-tab-active');
        qsa('.cms-form', overlay).forEach(function (f) { f.hidden = f.getAttribute('data-form') !== tab.getAttribute('data-tab'); });
      });
    });

    function handleSubmit(form, url) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var errBox = form.querySelector('.cms-form-error');
        errBox.hidden = true;
        var body = { username: form.username.value, password: form.password.value };
        fetch(url, { method: 'POST', credentials: 'include', body: JSON.stringify(body) })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (!data.ok) { errBox.textContent = data.error || 'Error.'; errBox.hidden = false; return; }
            overlay.remove();
            location.reload();
          })
          .catch(function () { errBox.textContent = 'No se pudo conectar con el servidor.'; errBox.hidden = false; });
      });
    }
    handleSubmit(overlay.querySelector('[data-form="login"]'), 'admin/public-login.php');
    handleSubmit(overlay.querySelector('[data-form="register"]'), 'admin/public-register.php');
  }

  function buildSaveBar() {
    saveBar = document.createElement('div');
    saveBar.className = 'cms-savebar';
    saveBar.innerHTML =
      '<span class="cms-save-count">0 cambios</span>' +
      '<button type="button" class="cms-discard-btn">Descartar</button>' +
      '<button type="button" class="btn btn-primary cms-save-btn">Guardar cambios</button>';
    saveCount = saveBar.querySelector('.cms-save-count');
    saveBar.querySelector('.cms-discard-btn').addEventListener('click', discardChanges);
    saveBar.querySelector('.cms-save-btn').addEventListener('click', saveChanges);
    document.body.appendChild(saveBar);

    toast = document.createElement('div');
    toast.className = 'cms-toast';
    document.body.appendChild(toast);
  }

  buildSaveBar();

  fetch('admin/whoami.php', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (data) { buildWidget(!!data.loggedIn, data.username); })
    .catch(function () { buildWidget(false, null); });
})();
