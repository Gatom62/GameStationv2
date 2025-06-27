const API_URL = "https://retoolapi.dev/ETJdfZ/Productos";
const IMG_API_URL = 'https://api.imgbb.com/1/upload?key=cc3f6aa7cbcb62e53d0e68839631ed1b';

// Función para cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('Productos recibidos:', productos); // Para depuración
        
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarErrorEnInterfaz(error);
    }
}

// Función para mostrar los productos en el HTML con manejo robusto de imágenes
function mostrarProductos(productos) {
    const contenedor = document.getElementById('productos-api');
    contenedor.innerHTML = '';

    if (!productos || productos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-circle fs-1"></i>
                <p class="mt-3">No hay productos disponibles</p>
            </div>
        `;
        return;
    }

    productos.forEach(producto => {
        // Manejo flexible del campo de imagen (diferentes nombres posibles)
        const imagenUrl = obtenerUrlImagen(producto);
        
        const card = document.createElement('div');
        card.className = 'col mb-4';
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${imagenUrl}" 
                     class="card-img-top img-producto" 
                     alt="${producto.nombre || 'Producto'}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'; this.onerror=null;">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre || 'Producto sin nombre'}</h5>
                    <p class="card-text">
                        <span class="badge bg-primary">${producto.categoria || 'General'}</span>
                        <br>
                        <strong class="text-success">$${(producto.precio || 0).toFixed(2)}</strong>
                    </p>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// Función auxiliar para obtener la URL de imagen del producto
function obtenerUrlImagen(producto) {
    // Posibles nombres de campo para la imagen
    const posiblesCampos = ['imagen', 'image', 'img', 'url_imagen', 'imagen_url'];
    
    for (const campo of posiblesCampos) {
        if (producto[campo]) {
            // Si la imagen es base64
            if (producto[campo].startsWith('data:image')) {
                return producto[campo];
            }
            // Si es una URL relativa (empieza con /)
            if (producto[campo].startsWith('/')) {
                return `https://${window.location.host}${producto[campo]}`;
            }
            return producto[campo];
        }
    }
    
    return 'https://via.placeholder.com/300x200?text=Sin+imagen';
}

// Función para mostrar errores en la interfaz
function mostrarErrorEnInterfaz(error) {
    const contenedor = document.getElementById('productos-api') || document.body;
    
    contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="bi bi-cloud-off fs-1 text-danger"></i>
            <h4 class="mt-3">Error al cargar productos</h4>
            <p class="text-muted">${error.message || 'Intente recargar la página'}</p>
            <button class="btn btn-primary mt-2" onclick="window.location.reload()">
                <i class="bi bi-arrow-clockwise"></i> Recargar
            </button>
        </div>
    `;
    
    Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudieron cargar los productos. Verifique su conexión a internet.',
        footer: `<small>${error.message || ''}</small>`
    });
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar spinner de carga
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'text-center py-5';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Cargando productos...</p>
    `;
    
    const contenedor = document.getElementById('productos-api');
    contenedor.innerHTML = '';
    contenedor.appendChild(spinner);
    
    // Cargar productos
    cargarProductos();
});

// Opcional: Si necesitas subir imágenes a ImgBB
async function subirImagen(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(IMG_API_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data.data.url; // Retorna la URL de la imagen subida
    } catch (error) {
        console.error('Error al subir imagen:', error);
        throw error;
    }
}