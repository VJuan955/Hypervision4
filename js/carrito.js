const STORAGE_KEY = "carrito_hypervision";

function getCarrito() {
    const carritoJSON = localStorage.getItem(STORAGE_KEY);
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function saveCarrito(carrito) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

const gestorProductosCarrito = window.gestorProductos || new GestorProductos();

async function agregarCarrito(idProducto) {
    try {
        if (typeof idProducto === "undefined" || idProducto === null) {
            console.error("[carrito.js] agregarCarrito llamado sin idProducto");
            alert("Error: id de producto inválido.");
            return;
        }
        const idNum = Number(idProducto);
        if (isNaN(idNum)) {
            console.error("[carrito.js] idProducto no es número:", idProducto);
            alert("Error: id de producto inválido.");
            return;
        }
        const producto = gestorProductosCarrito.buscarPorId(idNum);
        if (!producto) {
            console.warn("[carrito.js] Producto no encontrado para id:", idNum);
            alert("Producto no encontrado. Intenta recargar la página.");
            return;
        }
        let carrito = getCarrito();
        let item = carrito.find(p => p.id === producto.id);
        if (item) {
            item.cantidad = (Number(item.cantidad) || 0) + 1;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre || "Sin nombre",
                precio: Number(producto.precio) || 0,
                imagen: producto.imagen || "",
                cantidad: 1
            });
        }
        saveCarrito(carrito);
        actualizarContadorCarrito();
        console.info("[carrito.js] Producto añadido:", producto.nombre, "id:", producto.id);
        if (typeof showToast === "function") {
            showToast("Producto agregado al carrito");
        } else {
            alert("Producto agregado al carrito");
        }
    } catch (err) {
        console.error("[carrito.js] Error en agregarCarrito:", err);
        alert("Error al agregar al carrito. Revisa la consola.");
    }
}

window.agregarCarrito = agregarCarrito;

function cambiarCantidad(idProducto, paso) {
    const idNum = Number(idProducto);
    if (isNaN(idNum)) return;
    let carrito = getCarrito();
    let item = carrito.find(p => p.id === idNum);
    if (!item) return;
    item.cantidad = (Number(item.cantidad) || 0) + paso;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(p => p.id !== idNum);
    }
    saveCarrito(carrito);
    mostrarCarrito();
    actualizarContadorCarrito();
}

function eliminarProducto(idProducto) {
    const idNum = Number(idProducto);
    if (isNaN(idNum)) return;
    let carrito = getCarrito();
    carrito = carrito.filter(p => p.id !== idNum);
    saveCarrito(carrito);
    mostrarCarrito();
    actualizarContadorCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem(STORAGE_KEY);
    mostrarCarrito();
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const carrito = getCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0);
    const contador = document.getElementById("cart-count");
    if (contador) {
        contador.textContent = totalItems;
    } else {
        const c2 = document.querySelector("[data-cart-count]");
        if (c2) c2.textContent = totalItems;
    }
}

function construirRutaImg(imagenNombre) {
    if (!imagenNombre) return "img/placeholder.png";
    if (imagenNombre.startsWith("img/") || imagenNombre.startsWith("/")) return imagenNombre;
    return "img/" + imagenNombre;
}

function mostrarCarrito() {
    const tabla = document.getElementById("carrito-body");
    const totalSpan = document.getElementById("carrito-total");
    if (!tabla || !totalSpan) return;
    const carrito = getCarrito();
    tabla.innerHTML = "";
    let total = 0;
    carrito.forEach(item => {
        const fila = document.createElement("tr");
        const imgSrc = construirRutaImg(item.imagen);
        fila.innerHTML = `
            <td><img src="${imgSrc}" class="mini" onerror="this.src='img/placeholder.png'"></td>
            <td>${item.nombre}</td>
            <td>S/ ${Number(item.precio).toFixed(2)}</td>
            <td>
                <button class="qty-btn" data-id="${item.id}" data-step="-1">-</button>
                <span class="qty-value">${item.cantidad}</span>
                <button class="qty-btn" data-id="${item.id}" data-step="1">+</button>
            </td>
            <td>S/ ${(Number(item.precio) * Number(item.cantidad)).toFixed(2)}</td>
            <td><button class="remove-btn" data-id="${item.id}">Eliminar</button></td>
        `;
        tabla.appendChild(fila);
        total += Number(item.precio) * Number(item.cantidad);
    });
    totalSpan.textContent = "S/ " + total.toFixed(2);
    tabla.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = btn.dataset.id;
            const step = Number(btn.dataset.step);
            cambiarCantidad(id, step);
        });
    });
    tabla.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = btn.dataset.id;
            eliminarProducto(id);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.info("[carro.js] Inicializando...");
    actualizarContadorCarrito();
    document.addEventListener("click", function (e) {
        const btn = e.target.closest(".btn-add");
        if (btn) {
            const id = btn.dataset.id;
            if (!id) {
                console.warn("[carro.js] btn-add sin data-id:", btn);
                alert("Error interno: producto sin identificador.");
                return;
            }
            agregarCarrito(id);
        }
    });
    if (document.body.classList.contains("carrito-page") || document.getElementById("carrito-body")) {
        mostrarCarrito();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const checkoutBtn = document.getElementById("btn-checkout");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            const carrito = getCarrito();
            if (carrito.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
            const total = carrito.reduce((sum, item) => 
                sum + (item.precio * item.cantidad), 0);
            localStorage.setItem("total_checkout", total);
            window.location.href = "checkout.html";
        });
    }
});

function mostrarCheckout() {
    const tabla = document.getElementById("checkout-body");
    const totalSpan = document.getElementById("checkout-total");
    if (!tabla || !totalSpan) return;
    const carrito = getCarrito();
    tabla.innerHTML = "";
    let total = 0;
    carrito.forEach(item => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><img src="img/${item.imagen}" class="mini"></td>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>S/ ${item.precio}</td>
            <td>S/ ${item.precio * item.cantidad}</td>
        `;

        tabla.appendChild(fila);
        total += item.precio * item.cantidad;
    });
    totalSpan.textContent = "S/ " + total;
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".checkout-page")) {
        mostrarCheckout();
    }
});

document.addEventListener("submit", e => {
    if (e.target.id === "checkout-form") {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.target).entries());
        const carrito = getCarrito();
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }
        localStorage.setItem("ultimo_pedido", JSON.stringify({
            cliente: datos,
            carrito: carrito,
            fecha: new Date().toLocaleString()
        }));
        vaciarCarrito();
        document.getElementById("mensaje-exito").classList.remove("oculto");
        e.target.reset();
    }
});
