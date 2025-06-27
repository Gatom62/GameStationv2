const API_URL = "https://retoolapi.dev/ETJdfZ/Productos";
const IMG_API_URL = 'https://api.imgbb.com/1/upload?key=cc3f6aa7cbcb62e53d0e68839631ed1b';

// Elementos del DOM
const tbody = document.getElementById('productos-tbody');
const formAgregar = document.getElementById('fmAgregar');
const formEditar = document.getElementById('fmEditar');

// Obtener productos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    ObtenerProductos();
    configurarEventos();
});

// Configurar eventos de los formularios (Es como el controlador)
function configurarEventos() {
    formAgregar.addEventListener('submit', agregarProducto);
    formEditar.addEventListener('submit', editarProducto);
}

// Obtener productos desde la API
async function ObtenerProductos() {
    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();
        MostrarDatos(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    }
}

// Mostrar productos en la tabla
function MostrarDatos(productos) {
    tbody.innerHTML = '';

    productos.forEach(producto => {
        tbody.innerHTML += `
            <tr>
                <td>
                    <img src="${producto.img}" 
                         alt="${producto.nombre}" 
                         style="max-width: 100px; height: auto; border-radius: 4px;">
                </td>
                <td>${producto.nombre}</td>
                <td>${producto.descuento || 0}%</td>
                <td>${producto.stock}</td>
                <td>$${producto.precio}</td>
                <td>
                    <button class="btn btn-outline-primary" 
                            onclick="AbrirModalEditar('${producto.id}', '${producto.nombre}', '${producto.descuento}', '${producto.stock}', '${producto.precio}', '${producto.img}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger" onclick="EliminarProducto(${producto.id})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });
}

// Subir imagen a ImgBB
async function subirImagen(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(IMG_API_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        return null;
    }
}

// Agregar nuevo producto
async function agregarProducto(e) {
    e.preventDefault();

    const nombre = document.getElementById('txtProducto').value.trim();
    const stock = document.getElementById('txtStock').value.trim();
    let precio = document.getElementById('txtPrecio').value.trim();
    let descuento = document.getElementById('txtDescuento').value.trim() || 0;
    const imagenInput = document.getElementById('productImageUpload');
    const imagenFile = imagenInput.files[0];

    if (!nombre || !stock || !precio) {
        Swal.fire('Error', 'Complete los campos requeridos', 'error');
        return;
    }

    //Para calcular el precio total del producto
    precio = parseFloat(precio);
    descuento = parseFloat(descuento) || 0;

    if (descuento > 0) {
        precio = precio * (1 - (descuento / 100));
    }

    // Formatear a 2 decimales antes de guardar
    precio = parseFloat(precio.toFixed(2));

    try {
        // Subir imagen si existe
        let imagenUrl = 'https://via.placeholder.com/300';
        if (imagenFile) {
            Swal.fire({
                title: 'Subiendo producto...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            imagenUrl = await subirImagen(imagenFile);
            if (!imagenUrl) {
                throw new Error('Error al subir la imagen');
            }
        }

        // Crear el producto
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                stock,
                precio,
                descuento,
                img: imagenUrl
            })
        });

        if (!respuesta.ok) throw new Error('Error al crear producto');

        Swal.fire('Éxito', 'Producto agregado correctamente', 'success');
        formAgregar.reset();
        document.getElementById('productImage').src = 'https://via.placeholder.com/300x200?text=Imagen+del+producto';
        bootstrap.Modal.getInstance(document.getElementById('mdAgregar')).hide();
        ObtenerProductos();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Abrir modal de edición
function AbrirModalEditar(id, nombre, descuento, stock, precio, img) {
    document.getElementById('txtIdEditar').value = id;
    document.getElementById('txtNombreEditar').value = nombre;
    document.getElementById('txtDescuentoEditar').value = descuento;
    document.getElementById('txtStockEditar').value = stock;
    document.getElementById('txtPrecioEditar').value = precio;

    // Mostrar imagen actual
    const imgPreview = document.querySelector('#mdEditar img');
    imgPreview.src = img || 'https://via.placeholder.com/300x200?text=Imagen+del+producto';

    // Mostrar modal
    new bootstrap.Modal(document.getElementById('mdEditar')).show();
}

// Editar producto
async function editarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('txtIdEditar').value;
    const nombre = document.getElementById('txtNombreEditar').value.trim();
    const stock = document.getElementById('txtStockEditar').value.trim();
    let precio = document.getElementById('txtPrecioEditar').value.trim();
    let descuento = document.getElementById('txtDescuentoEditar').value.trim() || 0;
    const imagenInput = document.getElementById('productImageUploadEditar'); // Cambiado para coincidir con el modal de edición
    const imagenFile = imagenInput.files[0];
    const imgPreview = document.querySelector('#mdEditar img'); // Obtener la vista previa

    if (!nombre || !stock || !precio) {
        Swal.fire('Error', 'Complete los campos requeridos', 'error');
        return;
    }

    // Convertimos los valores a números
    precio = parseFloat(precio);
    descuento = parseFloat(descuento) || 0; // Si no hay descuento, será 0

    // En tu función agregarProducto
    precio = parseFloat(precio);
    descuento = parseFloat(descuento) || 0;

    if (descuento > 0) {
        precio = precio * (1 - (descuento / 100));
    }

    // Formatear a 2 decimales antes de guardar
    precio = parseFloat(precio.toFixed(2));

    try {
        let imagenUrl = imgPreview.src; // Usamos la vista previa actual

        // Si hay una nueva imagen, subirla
        if (imagenFile && imagenFile.size > 0) {
            Swal.fire({
                title: 'Actualizando imagen...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            imagenUrl = await subirImagen(imagenFile);
            if (!imagenUrl) {
                throw new Error('Error al subir la nueva imagen');
            }

            // Actualizar la vista previa inmediatamente
            imgPreview.src = imagenUrl;
        }

        // Actualizar producto
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                stock,
                precio,
                descuento,
                img: imagenUrl
            })
        });

        if (!respuesta.ok) throw new Error('Error al actualizar producto');

        Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');

        // Limpiar el input de archivo después de la subida exitosa
        imagenInput.value = '';

        bootstrap.Modal.getInstance(document.getElementById('mdEditar')).hide();
        ObtenerProductos();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Evento al seleccionar una imagen en el modal de edición
document.getElementById('productImageUploadEditar').addEventListener("change", function () {
    const file = this.files[0];
    const errorElement = document.getElementById("imageErrorEditar");
    const imgPreview = document.querySelector('#mdEditar img');

    // Validaciones
    if (!file) return;

    if (!file.type.match('image.*')) {
        errorElement.textContent = "¡Solo se permiten imágenes!";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        errorElement.textContent = "La imagen debe pesar menos de 2MB";
        return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = function (e) {
        imgPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Eliminar producto
async function EliminarProducto(id) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esta acción',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!respuesta.ok) throw new Error('Error al eliminar producto');

        Swal.fire('Eliminado', 'El producto ha sido eliminado', 'success');
        ObtenerProductos();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

const uploadInput = document.getElementById("productImageUpload");
const productImage = document.getElementById("productImage");
const clearBtn = document.getElementById("clearImageBtn");
const errorElement = document.getElementById("imageError");

// Evento al seleccionar una imagen
uploadInput.addEventListener("change", function () {
    const file = this.files[0];
    errorElement.textContent = "";

    // Validaciones
    if (!file) return;

    if (!file.type.match('image.*')) {
        showError("¡Solo se permiten imágenes!");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showError("La imagen debe pesar menos de 2MB");
        return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = function (e) {
        productImage.src = e.target.result;
        productImage.style.display = "block";
    };
    reader.readAsDataURL(file);
});

// Botón para limpiar la imagen
clearBtn.addEventListener("click", function () {
    uploadInput.value = "";
    productImage.src = "https://via.placeholder.com/300x200?text=Imagen+del+producto";
    errorElement.textContent = "";
});

function showError(message) {
    errorElement.textContent = message;
    uploadInput.classList.add("is-invalid");
    setTimeout(() => uploadInput.classList.remove("is-invalid"), 3000);
}