// 🔐 Contraseñas por usuario
const contraseñas = {
  "Fausto@lsc.com": "123",
  "juan@lsc.com": "123",
  "sofia@lsc.com": "123",
  "carlos@lsc.com": "123",
  "valentina@lsc.com": "123"
  
};

let usuario = "";
let esAdmin = false;

let repuestos = [];
let trabajos = [];
let carrito = [];

function cargarRepuestosFirebase() {
  firebase.database().ref("repuestos").on("value", (snapshot) => {
    repuestos = snapshot.val() || [];
    renderizarRepuestos();
  });
}

function cargarTrabajosFirebase() {
  firebase.database().ref("trabajos").on("value", (snapshot) => {
    trabajos = snapshot.val() || [];
    renderizarTrabajos();
  });
}

function guardarRepuestos() {
  firebase.database().ref("repuestos").set(repuestos);
}

function guardarTrabajos() {
  firebase.database().ref("trabajos").set(trabajos);
}


function vaciarCarrito() {
  if (confirm("¿Seguro que querés vaciar el carrito?")) {
    carrito = [];
    actualizarContadorCarrito();
    actualizarCarrito();
    mostrarMensajeEnviado("🧹 Carrito vaciado");
  }
}



let correoSeleccionado = "";

function loginUsuario() {
  correoSeleccionado = document.getElementById("selector-correo").value;
  if (!correoSeleccionado) return;

  document.getElementById("modal-login").classList.remove("oculto");
}


function confirmarLogin() {
  const clave = document.getElementById("input-password").value;

  if (clave === contraseñas[correoSeleccionado]) {
    usuario = correoSeleccionado;
    esAdmin = usuario === "Fausto@lsc.com";

    localStorage.setItem("usuario", usuario);
    localStorage.setItem("esAdmin", esAdmin);

    mostrarMensajeEnviado(`Bienvenido, ${usuario}`);
    document.getElementById("modal-login").classList.add("oculto");

    if (esAdmin) {
      document.getElementById("form-admin").classList.remove("oculto");
      document.getElementById("form-trabajo").classList.remove("oculto");
      renderizarTrabajos();
      document.getElementById("btn-backup").classList.remove("oculto");
    }
    renderizarRepuestos();

    document.getElementById("selector-correo").style.display = "none";
    document.getElementById("btn-cerrar-sesion").style.display = "inline-block";
  } else {
    mostrarMensajeEnviado("❌ Contraseña incorrecta");
    cerrarModalLogin();
  }
}

function cerrarModalLogin() {
  document.getElementById("modal-login").classList.add("oculto");
  document.getElementById("selector-correo").value = "";
  document.getElementById("input-password").value = "";
}



document.addEventListener("DOMContentLoaded", () => {
  usuario = localStorage.getItem("usuario") || "";
  esAdmin = localStorage.getItem("esAdmin") === "true";

  const btnCerrar = document.getElementById("btn-cerrar-sesion");
  const selectorCorreo = document.getElementById("selector-correo");
  const btnBackup = document.getElementById("btn-backup"); 

  if (usuario !== "") {
    document.getElementById("selector-correo").value = usuario;

    if (esAdmin) {
      document.getElementById("form-admin").classList.remove("oculto");
      document.getElementById("form-trabajo").classList.remove("oculto");

      document.getElementById("btn-backup").classList.remove("oculto");
    }
  }

  if (usuario) {
    selectorCorreo.style.display = "none";
    btnCerrar.style.display = "inline-block";

    if (esAdmin && btnBackup) {
      btnBackup.style.display = "inline-block";
    } else if (btnBackup) {
      btnBackup.style.display = "none";
    }

  } else {
    selectorCorreo.style.display = "inline-block";
    btnCerrar.style.display = "none";

    if (btnBackup) {
      btnBackup.style.display = "none";
    }
  }

  cargarRepuestosFirebase();
  cargarTrabajosFirebase();
});



function agregarRepuesto() {
  const nombre = document.getElementById("nuevo-repuesto").value;
  const precio = parseFloat(document.getElementById("precio-repuesto").value);
  const imagen = document.getElementById("imagen-repuesto").value;

  if (nombre && precio && imagen) {
    repuestos.push({ nombre, precio, imagen });
    guardarRepuestos();
    renderizarRepuestos();
  }
}

function contarProductoEnCarrito(nombre) {
  return carrito.filter(item => item.nombre === nombre).length;
}

function renderizarRepuestos() {
  const cont = document.getElementById("lista-repuestos");
  cont.innerHTML = "";

  repuestos.forEach((r, index) => {
    const cantidad = contarProductoEnCarrito(r.nombre); 

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${r.imagen}" alt="${r.nombre}" />
      <h3>${r.nombre}</h3>
      <p>$${r.precio}</p>
      <p class="contador">En carrito: ${cantidad}</p>
      <button onclick="agregarAlCarrito(${index})">Agregar al carrito</button>
    `;


    // Solo el admin ve opciones de editar/eliminar
    if (esAdmin) {
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.onclick = () => editarRepuesto(index);
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.onclick = () => eliminarRepuesto(index);
      card.appendChild(btnEditar);
      card.appendChild(btnEliminar);
    }

    cont.appendChild(card);
  });
}

function editarRepuesto(index) {
  const nuevoNombre = prompt("Nuevo nombre:", repuestos[index].nombre);
  const nuevoPrecio = prompt("Nuevo precio:", repuestos[index].precio);
  const nuevaImagen = prompt("Nueva imagen URL:", repuestos[index].imagen);

  if (nuevoNombre && nuevoPrecio && nuevaImagen) {
    repuestos[index] = {
      nombre: nuevoNombre,
      precio: parseFloat(nuevoPrecio),
      imagen: nuevaImagen
    };
    guardarRepuestos();
    renderizarRepuestos();
    mostrarMensajeEnviado("✅ Repuesto actualizado");
  }
}

function eliminarRepuesto(index) {
  if (confirm("¿Seguro que querés eliminar este repuesto?")) {
    repuestos.splice(index, 1);
    guardarRepuestos();
    renderizarRepuestos();
    mostrarMensajeEnviado("🗑️ Repuesto eliminado");
  }
}

function agregarAlCarrito(index) {
  carrito.push(repuestos[index]);
  actualizarContadorCarrito();
  actualizarCarrito();
}

function actualizarContadorCarrito() {
  document.getElementById("carrito-contador").textContent = carrito.length;
}

function toggleCarrito() {
  const carritoBtn = document.getElementById("carrito-nav");
  carritoBtn.classList.add("clicked");

  setTimeout(() => {
    carritoBtn.classList.remove("clicked");
  }, 100);

  const modal = document.getElementById("modal-carrito");
  modal.classList.toggle("oculto");

  // Evita scroll del body cuando se abre el modal
  if (!modal.classList.contains("oculto")) {
    document.body.classList.add("modal-abierto");
  } else {
    document.body.classList.remove("modal-abierto");
  }
}



function actualizarCarrito() {
  const cont = document.getElementById("items-carrito");
  const total = document.getElementById("total");
  const final = document.getElementById("total-final");

  cont.innerHTML = "";
  let suma = 0;

  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `
      ${item.nombre} - $${item.precio}
      <button onclick="eliminarDelCarrito(${index})">❌</button>
    `;
    cont.appendChild(div);
    suma += item.precio;
  });

  total.textContent = suma.toFixed(2);
  final.textContent = (suma * 1.55).toFixed(2);
  renderizarRepuestos(); 

}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarContadorCarrito();
  actualizarCarrito();
  mostrarMensajeEnviado("❌ Producto eliminado del carrito");
}


function copiarTotal() {
  const total = document.getElementById("total-final").textContent;
  navigator.clipboard.writeText(`$${total}`);
  mostrarMensajeEnviado("💸 Total copiado al portapapeles");
}

function enviarTrabajo() {
  if (!usuario || usuario === "") {
    mostrarMensajeEnviado("❌ Debes iniciar sesión");
    return;
  }

  if (carrito.length === 0) {
    mostrarMensajeEnviado("⚠️ El carrito está vacío");
    return;
  }

  const resumen = carrito.map(i => i.nombre).join(", ");
  const total = document.getElementById("total-final").textContent;
  
  const templateParams = {
    user_email: "igna0409@gmail.com", 
    name: usuario.split("@")[0],
    user: usuario,
    repuestos: resumen,
    total: total,
    email: usuario
  };

  console.log("📤 Enviando trabajo:", templateParams); 

  emailjs.send("service_z7hd523", "template_trabajo", templateParams)
    .then(() => {
      mostrarMensajeEnviado("✅ Trabajo enviado correctamente al jefe.");

      carrito = [];
      actualizarContadorCarrito();
      toggleCarrito();
      actualizarCarrito();
    })
    .catch((error) => {
      console.error("❌ Error al enviar trabajo:", error);
      mostrarMensajeEnviado("❌ Error al enviar el trabajo. Verificá la plantilla.");
    });
}




function agregarTrabajo() {
  const trabajo = {
    mecanico: document.getElementById("mecanico").value,
    trabajo: document.getElementById("trabajo").value,
    precio: document.getElementById("precio").value
  };
  trabajos.push(trabajo);
  guardarTrabajos();
  renderizarTrabajos();
}

function renderizarTrabajos() {
  const tbody = document.querySelector("#tabla-trabajos tbody");
  tbody.innerHTML = "";

  trabajos.forEach((t, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${t.mecanico}</td>
      <td>${t.trabajo}</td>
      <td>$${t.precio}</td>
    `;

    // Si es admin, agregar acciones
    if (esAdmin) {
      const td = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.onclick = () => editarTrabajo(index);

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.onclick = () => eliminarTrabajo(index);

      td.appendChild(btnEditar);
      td.appendChild(btnEliminar);

      row.appendChild(td);
    }

    tbody.appendChild(row);
  });

  
}



// 💬 Mensaje flotante
function mostrarMensajeEnviado(texto) {
  const div = document.createElement("div");
  div.className = "mensaje-flotante";
  div.textContent = texto;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 5000);
}

// 🚀 Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarRepuestosFirebase();
  cargarTrabajosFirebase();
});

document.getElementById("form-contacto").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = this;

  emailjs.sendForm("service_z7hd523", "template_contacto", form)
    .then(() => {
      mostrarMensajeEnviado("✅ Mensaje de contacto enviado correctamente");
      form.reset(); // 👈 Esto limpia los campos
    }, (error) => {
      console.error("Error al enviar contacto:", error);
      mostrarMensajeEnviado("❌ Error al enviar el mensaje");
    });
});



function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("esAdmin");

  document.getElementById("selector-correo").style.display = "inline-block";
  document.getElementById("btn-cerrar-sesion").style.display = "none";

  document.getElementById("btn-backup").classList.add("oculto");


  location.reload();

}


function editarTrabajo(index) {
  const t = trabajos[index];

  const nuevoMecanico = prompt("Nuevo mecánico:", t.mecanico);
  const nuevoTrabajo = prompt("Nuevo trabajo realizado:", t.trabajo);
  const nuevoPrecio = prompt("Nuevo precio:", t.precio);

  if (
    nuevoMecanico !== null && nuevoMecanico.trim() !== "" &&
    nuevoTrabajo !== null && nuevoTrabajo.trim() !== "" &&
    nuevoPrecio !== null && nuevoPrecio.trim() !== "" && !isNaN(nuevoPrecio)
  ) {
    trabajos[index] = {
      mecanico: nuevoMecanico.trim(),
      trabajo: nuevoTrabajo.trim(),
      precio: parseFloat(nuevoPrecio)
    };
    guardarTrabajos();
    renderizarTrabajos();
    mostrarMensajeEnviado("✅ Trabajo actualizado");
  } else {
    mostrarMensajeEnviado("❌ Por favor completá todos los campos correctamente");
  }
}


function eliminarTrabajo(index) {
  if (confirm("¿Seguro que querés eliminar este trabajo?")) {
    trabajos.splice(index, 1);
    guardarTrabajos();
    renderizarTrabajos();
    mostrarMensajeEnviado("🗑️ Trabajo eliminado");
  }
}

function mostrarModalVaciar() {
  document.getElementById("modal-confirmar-vaciar").classList.remove("oculto");
}

function cerrarModalVaciar() {
  document.getElementById("modal-confirmar-vaciar").classList.add("oculto");
}

function confirmarVaciarCarrito() {
  carrito = [];
  actualizarContadorCarrito();
  actualizarCarrito();
  cerrarModalVaciar();
  mostrarMensajeEnviado("🗑️ Carrito vaciado");
}


function descargarBackup() {
  const data = {
    repuestos,
    trabajos,
    logs: JSON.parse(localStorage.getItem("logs")) || []
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "backup_lsc.json";
  link.click();
}


function animarCarrito() {
  const carritoBtn = document.getElementById("carrito-nav");
  carritoBtn.classList.add("animar");
  setTimeout(() => carritoBtn.classList.remove("animar"), 500);
}

function agregarAlCarrito(index) {
  carrito.push(repuestos[index]);
  actualizarContadorCarrito();
  actualizarCarrito();
  animarCarrito();
}


if (esAdmin) {
  const thAcciones = document.createElement("th");
  thAcciones.textContent = "Acciones";
  filaEncabezado.appendChild(thAcciones);
}

if (esAdmin) {
  const tdAcciones = document.createElement("td");
  tdAcciones.className = "acciones-admin";
  tdAcciones.innerHTML = `
    <button>✏️</button>
    <button>🗑️</button>
  `;
  fila.appendChild(tdAcciones);
}

btnEditar.classList.add("btn-editar");
btnEliminar.classList.add("btn-eliminar");