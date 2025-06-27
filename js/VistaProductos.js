const API_URL = "https://retoolapi.dev/ETJdfZ/Productos";
const container = document.getElementById('cards-container');

async function CargarProductos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        CargarTarjetas(data);
    }catch (err) {
        //Error para el programador
        console.erro('Error al cargar datos: ', err);
        //Error para el usuario
        container.innerHTML = '<p>Error al cargar las personas.</p>';
    }
}

function CargarTarjetas(productos){
    container.innerHTML = '';

    if(productos.length == 0){
        container.innerHTML = "<p>No hay personas registradas</p>";
        return;//Evitamos que el codigo se siga ejecutando
    }

    productos.forEach(producto => {
        container.innerHTML += `
        <div class="card">
        <img src="${producto.imagen}" alt="Foto de perfil">
        <h2>${producto.nombre}</h2>
        <p>${producto.precio}</p>
        </div>
        `;
    });
}