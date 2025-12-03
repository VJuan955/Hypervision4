if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = "login.html";
}

const gestorProductosAdmin = window.gestorProductos || new GestorProductos();
const tablaBody = qs("#productos-admin-body");
const form = qs("#producto-form");
const modal = qs("#crud-modal");
const modalTitle = qs("#modal-title");

function renderizarTabla(productos) {
    tablaBody.innerHTML = "";
    if (productos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay productos registrados.</td></tr>';
        return;
    }
    productos.forEach(p => {
        const row = document.createElement("tr");
        row.dataset.id = p.id;
        row.innerHTML = `
            <td>${p.id}</td>
            <td><img src="img/${p.imagen}" alt="${p.nombre}" class="admin-mini-img"></td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${p.getPrecioFormateado()}</td>
            <td>${p.destacado ? '<i class="fas fa-check-circle check-icon"></i>' : '-'}</td>
            <td>
                <button class="btn-edit" data-id="${p.id}" onclick="abrirFormulario(${p.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" data-id="${p.id}" onclick="eliminarProducto(${p.id})">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </td>
        `;
        tablaBody.appendChild(row);
    });
}

function ordenarProductos(criterioValor) {
    if (!criterioValor || criterioValor === 'none') {
        renderizarTabla(gestorProductosAdmin.mostrarTodos());
        return;
    }
    const partes = criterioValor.split('-');
    if (partes.length !== 2) {
        renderizarTabla(gestorProductosAdmin.mostrarTodos());
        return;
    }
    const [criterio, direccion] = partes;
    const productosOrdenados = gestorProductosAdmin.ordenar(criterio, direccion);
    renderizarTabla(productosOrdenados);
}

window.ordenarProductos = ordenarProductos;

function cargarOpcionesCategoria() {
    const categorias = gestorProductosAdmin.obtenerCategoriasUnicas();
    const select = qs("#categoria");
    if (!select) return;
    select.innerHTML = '<option value="">--Seleccionar Categoria --</option>';
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        const textoFormateado = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
        option.textContent = textoFormateado;
        select.appendChild(option);
    });
}

window.abrirFormulario = function (idProducto = null) {
    form.reset();
    qs("#producto-id").value = "";
    if (idProducto) {
        const producto = gestorProductos.buscarPorId(idProducto);
        if (producto) {
            modalTitle.textContent = `Editar Producto #${idProducto}`;
            qs("#producto-id").value = producto.id;
            qs("#nombre").value = producto.nombre;
            qs("#precio").value = producto.precio;
            qs("#imagen").value = producto.imagen;
            qs("#categoria").value = producto.categoria;
            qs("#marca").value = producto.marca;
            qs("#destacado").checked = producto.destacado;
            if (producto.caracteristicas && Object.keys(producto.caracteristicas).length > 0) {
                qs("#caracteristicas").value = JSON.stringify(producto.caracteristicas, null, 2);
            } else {
                qs("#caracteristicas").value = "";
            }
        }
    } else {
        modalTitle.textContent = "Insertar Nuevo Producto";
    }
    openModal("#crud-modal");
};

function manejarEnvioFormulario(e) {
    e.preventDefault();
    const id = qs("#producto-id").value;
    const formData = new FormData(form);
    const datos = Object.fromEntries(formData.entries());
    datos.destacado = formData.has('destacado') ? 'on' : 'off';
    try {
        datos.caracteristicas = datos.caracteristicas ? JSON.parse(datos.caracteristicas) : {};
    } catch (error) {
        showToast("Error: Las Características deben ser un JSON válido. Guardado sin características.");
        datos.caracteristicas = {};
    }
    let resultado;
    if (id) {
        resultado = gestorProductos.editar(id, datos);
        if (resultado) {
            showToast(`Producto #${id} editado con éxito.`);
        }
    } else {
        resultado = gestorProductos.insertar(datos);
        if (resultado) {
            showToast(`Producto ${resultado.nombre} insertado con ID #${resultado.id}.`);
        }
    }
    if (resultado) {
        closeModal("#crud-modal");
        renderizarTabla(gestorProductos.mostrarTodos());
    }
}

window.eliminarProducto = function (idProducto) {
    if (confirm(`¿Estás seguro de eliminar el producto #${idProducto}?`)) {
        const exito = gestorProductos.eliminar(idProducto);
        if (exito) {
            showToast(`Producto #${idProducto} eliminado correctamente.`);
            renderizarTabla(gestorProductos.mostrarTodos()); // Refrescar la tabla
        } else {
            alert("Error al eliminar el producto.");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    cargarOpcionesCategoria();
    renderizarTabla(gestorProductos.mostrarTodos()); 
    qs("#btn-nuevo-producto")?.addEventListener("click", () => abrirFormulario());
    form.addEventListener("submit", manejarEnvioFormulario);
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar por nombre...';
    searchInput.id = 'admin-search';
    searchInput.classList.add('admin-search-input');
    qs('.flex-actions').prepend(searchInput); 
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const todos = gestorProductos.mostrarTodos();
        const resultados = todos.filter(p => p.nombre.toLowerCase().includes(query));
        renderizarTabla(resultados);
    });
});
