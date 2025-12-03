const STORAGE_KEY_PRODUCTOS = "productos_admin_hypervision";

class Producto {
    constructor(id, nombre, precio, imagen, categoria, marca, destacado = false, caracteristicas = {}) {
        this.id = id; 
        this.nombre = nombre;
        this.precio = parseFloat(precio);
        this.imagen = imagen;
        this.categoria = categoria;
        this.marca = marca;
        this.destacado = destacado;
        this.caracteristicas = caracteristicas; 
    }
    
    getPrecioFormateado() {
        return `S/ ${this.precio.toFixed(2)}`;
    }
}

class GestorProductos {
    constructor() {
        this.productos = this._cargarDesdeLocalStorage();
        this.ultimoId = this._obtenerUltimoId(); 
    }

    _obtenerUltimoId() {
        if (this.productos.length === 0) return 0;
        return Math.max(...this.productos.map(p => p.id));
    }

    _cargarDesdeLocalStorage() {
        const data = localStorage.getItem(STORAGE_KEY_PRODUCTOS);
        if (data) {
            const productosRaw = JSON.parse(data);
            return productosRaw.map(p => new Producto(
                p.id, p.nombre, p.precio, p.imagen, p.categoria, p.marca, p.destacado, p.caracteristicas
            ));
        }
        return [];
    }

    guardarEnLocalStorage() {
        localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(this.productos));
    }
    
    cargarDatosIniciales(productoData) {
        const nuevoProducto = new Producto(
            productoData.id,
            productoData.nombre,
            productoData.precio,
            productoData.imagen,
            productoData.categoria,
            productoData.marca,
            productoData.destacado,
            productoData.caracteristicas || {}
        );
        const existe = this.productos.some(p => p.id === nuevoProducto.id);
        if (!existe) {
            this.productos.push(nuevoProducto);
        }
    }
    
    obtenerCategoriasUnicas() {
        const categorias = this.productos.map(p => p.categoria);
        return [...new Set(categorias)].sort();
    }

    insertar(productoData) {
        this.ultimoId++;
        const nuevoProducto = new Producto(
            this.ultimoId,
            productoData.nombre,
            productoData.precio,
            productoData.imagen,
            productoData.categoria,
            productoData.marca,
            productoData.destacado === 'on', 
            productoData.caracteristicas || {}
        );
        this.productos.push(nuevoProducto);
        this.guardarEnLocalStorage();
        return nuevoProducto;
    }

    mostrarTodos() {
        return this.productos;
    }

    buscarPorId(id) {
        return this.productos.find(p => p.id === parseInt(id));
    }
    
    editar(id, nuevosDatos) {
        const index = this.productos.findIndex(p => p.id === parseInt(id));
        if (index === -1) return false;

        const p = this.productos[index];
        p.nombre = nuevosDatos.nombre;
        p.precio = parseFloat(nuevosDatos.precio);
        p.imagen = nuevosDatos.imagen;
        p.categoria = nuevosDatos.categoria;
        p.marca = nuevosDatos.marca;
        p.destacado = nuevosDatos.destacado === 'on'; 
        p.caracteristicas = nuevosDatos.caracteristicas || {};

        this.guardarEnLocalStorage();
        return true;
    }

    eliminar(id) {
        const idNum = parseInt(id);
        const longitudInicial = this.productos.length;
        this.productos = this.productos.filter(p => p.id !== idNum);
        this.guardarEnLocalStorage();
        return this.productos.length < longitudInicial; 
    }
    
    ordenar(criterio, direccion = 'asc') {
        const copia = [...this.productos];
        copia.sort((a, b) => {
            let valA = a[criterio];
            let valB = b[criterio];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) {
                return direccion === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return direccion === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return copia;
    }
}
