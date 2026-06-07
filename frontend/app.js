if (window.location.pathname.includes("dashboard")) {
    if (!localStorage.getItem('usuario_id')) {
        window.location.href = 'login.html';
    }

    const txtNombre = document.getElementById('nombreUsuario');
    if (txtNombre) {
        txtNombre.innerText = "Bienvenido " + localStorage.getItem('usuario_nombre');
    }
}

const API = '/api';

async function cargarMovimientos() {
    try {
        const usuario_id = localStorage.getItem('usuario_id');
        if (!usuario_id) return;

        const respuesta = await fetch(`${API}/movimientos?usuario_id=${usuario_id}`);
        const datos = await respuesta.json();

        let tabla = '';
        datos.forEach(m => {
            tabla += `
                <tr>
                    <td>${m.id}</td>
                    <td>${m.tipo}</td>
                    <td>${m.categoria}</td>
                    <td>${m.descripcion}</td>
                    <td>${m.monto}</td>
                    <td>
                        <button onclick="editarMovimiento(${m.id})">Editar</button>
                        <button onclick="eliminarMovimiento(${m.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        const contenedorTabla = document.getElementById('tablaMovimientos');
        if (contenedorTabla) {
            contenedorTabla.innerHTML = tabla;
        }
    } catch (error) {
        console.error("Error al cargar movimientos:", error);
    }
}

// BALANCE
async function cargarBalance() {
    try {
        const usuario_id = localStorage.getItem('usuario_id');
        if (!usuario_id) return;

        const respuesta = await fetch(`${API}/balance?usuario_id=${usuario_id}`);
        const datos = await respuesta.json();

        const contenedorBalance = document.getElementById('balance');
        if (contenedorBalance) {
            contenedorBalance.innerText = 'Q' + (datos.balance || 0);
        }
    } catch (error) {
        console.error("Error al cargar balance:", error);
    }
}

async function guardarMovimiento() {
    const usuario_id = localStorage.getItem('usuario_id');
    
    if (!usuario_id) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        window.location.href = 'login.html';
        return;
    }

    const txtDescripcion = document.getElementById('descripcion');
    const txtMonto = document.getElementById('monto');

    if (!txtDescripcion.value || !txtMonto.value) {
        alert("Por favor completa la descripción y el monto.");
        return;
    }

    const movimiento = {
        usuario_id: Number(usuario_id),
        tipo: document.getElementById('tipo').value,
        categoria: document.getElementById('categoria').value,
        descripcion: txtDescripcion.value,
        monto: Number(txtMonto.value)
    };

    try {
        const res = await fetch(`${API}/movimientos`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(movimiento)
        });

        if (res.ok) {
            txtDescripcion.value = '';
            txtMonto.value = '';
            
            // Actualizamos la interfaz
            cargarMovimientos();
            cargarBalance();
        } else {
            alert("Error al guardar el movimiento en el servidor");
        }
    } catch (error) {
        console.error("Error en la petición guardar:", error);
    }
}

// EDITAR MOVIMIENTO
async function editarMovimiento(id) {
    const tipo = prompt("Nuevo tipo (INGRESO o GASTO):");
    const categoria = prompt("Nueva categoría:");
    const descripcion = prompt("Nueva descripción:");
    const monto = prompt("Nuevo monto:");

    if (!tipo || !categoria || !descripcion || !monto) {
        alert("Todos los campos son obligatorios");
        return;
    }

    const tipoUpper = tipo.toUpperCase();
    if (tipoUpper !== 'INGRESO' && tipoUpper !== 'GASTO') {
        alert("El tipo debe ser INGRESO o GASTO");
        return;
    }

    try {
        await fetch(`${API}/movimientos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: tipoUpper, categoria, descripcion, monto: Number(monto) })
        });

        cargarMovimientos();
        cargarBalance();
    } catch (error) {
        console.error("Error al editar:", error);
    }
}

// ELIMINAR MOVIMIENTO
async function eliminarMovimiento(id) {
    if (!confirm("¿Seguro que quieres eliminar este movimiento?")) return;

    try {
        await fetch(`${API}/movimientos/${id}`, {
            method: 'DELETE'
        });

        cargarMovimientos();
        cargarBalance();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// LOGIN
async function login() {
    console.log("LOGIN EJECUTADO");
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    try {
        // Corregido: Ahora pasará directo a través de Nginx
        const res = await fetch(`${API}/usuarios`);
        const usuarios = await res.json();

        const user = usuarios.find(u => u.correo === correo && u.password === password);

        if (user) {
            localStorage.setItem('usuario_id', user.id);
            localStorage.setItem('usuario_nombre', user.nombre);
            window.location.href = 'dashboard.html';
        } else {
            alert('Credenciales incorrectas');
        }
    } catch (error) {
        console.error("ERROR LOGIN:", error);
        alert("Error conectando con el backend");
    }
}

// REGISTRO
async function registrar() {
    try {
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const password = document.getElementById('password').value;

        const res = await fetch(`${API}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, password })
        });

        const text = await res.text();
        const data = JSON.parse(text);

        if (!res.ok) {
            alert("Error en backend: " + (data.error?.message || "Error Desconocido"));
            return;
        }

        alert(data.mensaje || "Registrado con éxito");
        window.location.href = 'login.html';

    } catch (error) {
        console.error("ERROR COMPLETO:", error);
        alert("Error conectando con backend");
    }
}

// LOGOUT
function logout() {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('usuario_nombre');
    window.location.href = 'login.html';
}

if (window.location.pathname.includes("dashboard")) {
    cargarMovimientos();
    cargarBalance();
}