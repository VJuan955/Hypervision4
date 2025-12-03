const gestorProductos = new GestorProductos();

window.gestorProductos = gestorProductos;

async function inicializarProductosDesdeJSON() {
    if (gestorProductos.mostrarTodos().length > 0) {
        console.info("[GestorProductos] Productos ya cargados en LocalStorage.");
        return;
    }
    try {
        console.warn("[GestorProductos] Inicializando base de datos desde JSON.");
        const r = await fetch("data/productos.json");
        const productosJSON = await r.json();
        productosJSON.forEach(p => {
            gestorProductos.cargarDatosIniciales(p);
        });
        gestorProductos.guardarEnLocalStorage();
        console.info("[GestorProductos] Base de datos inicializada con éxito.");
    } catch (error) {
        console.error("[GestorProductos] Error al cargar productos iniciales:", error);
    }
}

function cargarProductos() {
    return gestorProductos.mostrarTodos();
}

async function obtenerProductoPorID(id) {
    return gestorProductos.buscarPorId(id);
}

function crearCard(producto) {
    const div = document.createElement("div");
    div.classList.add("product-card");
    div.innerHTML = `
        <img src="img/${producto.imagen}" alt="${producto.nombre}">
        <h3 class="product-name">
            <a href="detalle.html?id=${producto.id}">${producto.nombre}</a>
        </h3>
        <p class="product-price">${producto.getPrecioFormateado()}</p>
        <button class="btn-add" data-id="${producto.id}">Agregar al carrito</button>
    `;
    return div;
}

function renderizarProducto(producto) {
    const contenedor = document.getElementById("producto-container");
    if (!producto) {
        contenedor.innerHTML = "<h2>Producto no encontrado</h2>";
        return;
    }
    contenedor.innerHTML = `
        <div class="detalle-wrapper">
            <div class="detalle-img">
                <img src="img/${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="detalle-info">
                <h1>${producto.nombre}</h1>
                <p class="detalle-precio">${producto.getPrecioFormateado()}</p>
                <button class="btn-add" data-id="${producto.id}">
                    Agregar al carrito
                </button>
                <h3>Información general</h3>
                <ul class="detalle-lista">
                    <li><strong>Categoría:</strong> ${producto.categoria}</li>
                    <li><strong>Marca:</strong> ${producto.marca}</li>
                </ul>
                <h3>Características</h3>
                <ul class="detalle-lista">
                    ${Object.entries(producto.caracteristicas || {}) // Asegura leer de la propiedad 'caracteristicas'
                        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                        .join("")}
                </ul>
            </div>
        </div>
    `;
}

async function mostrarDestacados() {
    const contenedor = document.getElementById("destacados-container");
    if (!contenedor) return;
    const productos = gestorProductos.mostrarTodos(); 
    const destacados = productos.filter(p => {
        return String(p.destacado).toLowerCase() === "true";
    });
    if (destacados.length === 0) {
        contenedor.innerHTML = "<p>No hay productos destacados para mostrar.</p>";
        return;
    }
    destacados.forEach(prod => {
        contenedor.appendChild(crearCard(prod));
    });
}

async function aplicarFiltros() {
    const productos = gestorProductos.mostrarTodos(); 
    const busqueda = document.getElementById("buscador")?.value.toLowerCase() || "";
    const categoria = document.getElementById("filtro-categoria")?.value || "todos";
    const marca = document.getElementById("filtro-marca")?.value || "todas";
    const precio = document.getElementById("filtro-precio")?.value || "todos";
    let filtrados = productos;
    filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(busqueda));
    if (categoria !== "todos") {
        filtrados = filtrados.filter(p => p.categoria === categoria);
    }
    if (marca !== "todas") {
        filtrados = filtrados.filter(p => p.marca === marca);
    }
    if (precio !== "todos") {
        const [min, max] = precio.split("-");
        filtrados = filtrados.filter(p => {
            if (max === "mas") {
                return p.precio >= parseInt(min);
            }
            return p.precio >= parseInt(min) && p.precio <= parseInt(max);
        });
    }
    const contenedor = document.getElementById("productos-container");
    if (contenedor) {
        contenedor.innerHTML = "";
        if (filtrados.length === 0) {
            contenedor.innerHTML = "<p class='text-center lead-text'>No se encontraron productos con esos filtros.</p>";
        } else {
            filtrados.forEach(p => contenedor.appendChild(crearCard(p)));
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await inicializarProductosDesdeJSON(); 
    mostrarDestacados();
    const productosContainer = document.getElementById("productos-container");
    if (productosContainer) {
        const ids = ["buscador", "filtro-categoria", "filtro-marca", "filtro-precio"];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", aplicarFiltros);
                el.addEventListener("change", aplicarFiltros);
            }
        });
        aplicarFiltros();
    }
    const detalleContainer = document.getElementById("producto-container");
    if (detalleContainer) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) {
            const producto = await obtenerProductoPorID(id);
            renderizarProducto(producto);
        } else {
            detalleContainer.innerHTML = "<h2>Error: ID de producto no especificado.</h2>";
        }
    }
});
