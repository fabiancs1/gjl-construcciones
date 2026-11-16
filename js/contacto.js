/**
 * contacto.js — Validación del formulario de contacto.
 * Simula un envío asíncrono (en un backend real, aquí iría el fetch al endpoint).
 */
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    nombre: (v) => v.trim().length >= 3 || "Ingrese su nombre completo.",
    correo: (v) => emailRegex.test(v.trim()) || "Ingrese un correo electrónico válido.",
    mensaje: (v) => v.trim().length >= 10 || "Cuéntenos un poco más sobre el proyecto."
  };

  function setError(field, message) {
    const wrapper = field.closest(".field");
    if (!wrapper) return;
    const errorEl = wrapper.querySelector(".field-error");
    if (message) {
      wrapper.classList.add("has-error");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("has-error");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateField(field) {
    const rule = validators[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    if (result === true) {
      setError(field, "");
      return true;
    }
    setError(field, result);
    return false;
  }

  ["nombre", "correo", "mensaje"].forEach((name) => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("has-error")) validateField(field);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Honeypot anti-spam: si el campo oculto tiene valor, es un bot.
    const honeypot = form.elements["website"];
    if (honeypot && honeypot.value) return;

    const fieldsToValidate = ["nombre", "correo", "mensaje"]
      .map((name) => form.elements[name])
      .filter(Boolean);
    const isValid = fieldsToValidate.map(validateField).every(Boolean);

    if (!isValid) {
      window.showToast("Revise los campos marcados antes de enviar.", "error");
      fieldsToValidate.find((f) => f.closest(".field").classList.contains("has-error"))?.focus();
      return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    // Simulación de envío asíncrono (reemplazar por fetch a un endpoint real).
    setTimeout(() => {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      window.showToast("Solicitud enviada. Le contactaremos en menos de 48 horas.");
      form.reset();
    }, 1100);
  });
})();
