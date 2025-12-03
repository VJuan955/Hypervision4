function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

function openModal(id) {
    const modal = qs(id);
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeModal(id) {
    const modal = qs(id);
    if (modal) {
        modal.style.display = "none";
    }
}

function showToast(message, duration = 2500) {
    const div = document.createElement("div");
    div.textContent = message;
    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.padding = "12px 18px";
    div.style.background = "#2d8cff";
    div.style.color = "white";
    div.style.borderRadius = "8px";
    div.style.zIndex = "9999";
    document.body.appendChild(div);
    setTimeout(function () {
        div.remove();
    }, duration);
}

document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", String(!expanded));
            navMenu.classList.toggle("show");
        });
    }
    if (typeof loadFeaturedProducts === "function") {
        loadFeaturedProducts();
    }
});
