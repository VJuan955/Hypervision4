const USERNAME = "admin";
const PASSWORD = "123";

function manejarLogin(e) {
    e.preventDefault();
    const loginForm = e.target;
    const usernameInput = loginForm.querySelector("#username").value.trim();
    const passwordInput = loginForm.querySelector("#password").value.trim();
    const errorMsg = loginForm.querySelector("#login-error");
    if (usernameInput === USERNAME && passwordInput === PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = "admin.html";
    } else {
        errorMsg.classList.remove("oculto");
        errorMsg.textContent = "Usuario o contraseña incorrectos. Inténtalo de nuevo.";
    }
}

function manejarEnvioFormularioGeneral(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    if (typeof showToast === "function") {
        showToast("¡Formulario enviado con éxito! Nos pondremos en contacto pronto.", 4000);
    } else {
        alert("¡Formulario enviado con éxito!");
    }
    setTimeout(() => {
        form.reset();
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar mensaje';
    }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", manejarLogin);
    }
    const contactoForm = document.getElementById("contacto-form");
    if (contactoForm) {
        contactoForm.addEventListener("submit", manejarEnvioFormularioGeneral);
    }
    const reclamosForm = document.getElementById("reclamos-form");
    if (reclamosForm) {
        reclamosForm.addEventListener("submit", manejarEnvioFormularioGeneral);
    }
});
