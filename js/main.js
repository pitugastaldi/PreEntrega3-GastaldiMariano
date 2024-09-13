let pinCorrecto = 1234;
let saldo = 1000;
let transacciones = [];
let currentAction = null;

// Cargar datos de localStorage
function cargarDatos() {
  const pinGuardado = localStorage.getItem('pinCorrecto');
  const saldoGuardado = localStorage.getItem('saldo');
  const transaccionesGuardadas = localStorage.getItem('transacciones');

  if (pinGuardado) {
    pinCorrecto = parseInt(pinGuardado, 10);
  }
  if (saldoGuardado) {
    saldo = parseFloat(saldoGuardado);
  }
  if (transaccionesGuardadas) {
    transacciones = JSON.parse(transaccionesGuardadas);
  }
}

function guardarDatos() {
  localStorage.setItem('pinCorrecto', pinCorrecto);
  localStorage.setItem('saldo', saldo);
  localStorage.setItem('transacciones', JSON.stringify(transacciones));
}

// DOM
const pinSection = document.getElementById('pin-section');
const pinInput = document.getElementById('pinInput');
const submitPinBtn = document.getElementById('submitPin');
const pinMessage = document.getElementById('pinMessage');

const menuSection = document.getElementById('menu-section');
const menuMessage = document.getElementById('menuMessage');

const actionSection = document.getElementById('action-section');
const amountInput = document.getElementById('amountInput');
const confirmActionBtn = document.getElementById('confirmAction');
const actionMessage = document.getElementById('actionMessage');

// Mostrar mensaje de bienvenida
function mostrarMensajeBienvenida() {
  pinSection.style.display = 'block';
  menuSection.style.display = 'none';
  actionSection.style.display = 'none';
  pinMessage.textContent = 'Bienvenido al cajero automático';
}

// Validar el PIN ingresado
function validarPIN() {
  const pinIngresado = parseInt(pinInput.value, 10);
  if (pinIngresado === pinCorrecto) {
    Toastify({
      text: "PIN correcto. Bienvenido al banco.",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "green",
    }).showToast();
    pinSection.style.display = 'none';
    menuSection.style.display = 'block';
  } else {
    Toastify({
      text: "PIN incorrecto. Intente nuevamente.",
      duration: 3000,
      gravity: "top",
      position: "center",
      backgroundColor: "red",
    }).showToast();
  }
}

// Mostrar el menú de opciones
function mostrarMenu(opcion) {
  switch (opcion) {
    case 'a':
      verSaldo();
      break;
    case 'b':
      currentAction = retirarDinero;
      mostrarAccion('Retirar');
      break;
    case 'c':
      currentAction = depositarDinero;
      mostrarAccion('Depositar');
      break;
    case 'd':
      cambiarPIN();
      break;
    case 'e':
      verTransacciones();
      break;
    case 'f':
      currentAction = transferirEntreCuentas;
      mostrarAccion('Transferir');
      break;
    case 'g':
      salir();
      break;
    default:
      menuMessage.textContent = 'Opción no válida. Intente nuevamente.';
  }
}

// Mostrar la sección de acción con el tipo correspondiente
function mostrarAccion(tipo) {
  actionSection.style.display = 'block';
  menuMessage.textContent = `Ingrese el monto a ${tipo}`;
}

function verSaldo() {
    // Mostrar el saldo actual con SweetAlert
    Swal.fire({
      title: 'Saldo actual',
      text: `Su saldo es: $${saldo}`,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
    });
  }

// Retirar dinero
function retirarDinero(monto) {
    validarMonto(monto, (montoValido) => {
      if (montoValido > saldo) {
        // Mensaje de error con SweetAlert si no hay fondos suficientes
        Swal.fire({
          title: 'Fondos insuficientes',
          text: `No tiene suficientes fondos para retirar $${montoValido}. Su saldo actual es $${saldo}.`,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33'
        });
      } else {
        // Confirmar la transacción antes de retirarla
        Swal.fire({
          title: 'Confirmar retiro',
          text: `¿Está seguro que desea retirar $${montoValido}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, retirar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            // Retiro confirmado
            saldo -= montoValido;
            const ahora = luxon.DateTime.now().toLocaleString(luxon.DateTime.DATETIME_MED);
            transacciones.push(`Retiro: $${montoValido} - ${ahora}`);
  
            // Mostrar confirmación de retiro exitoso
            Swal.fire({
              title: 'Retiro exitoso',
              text: `Ha retirado $${montoValido}. Su nuevo saldo es: $${saldo}.`,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#3085d6'
            });
  
            // Actualizar el mensaje en la interfaz
            actionMessage.textContent = `Ha retirado $${montoValido}. Su nuevo saldo es: $${saldo}`;
            guardarDatos(); // Guardar los datos actualizados
          }
        });
      }
    });
  }
  

// Depositar dinero
function depositarDinero(monto) {
    validarMonto(monto, (montoValido) => {
      if (montoValido > 0) {
        // Confirmación antes de realizar el depósito
        Swal.fire({
          title: 'Confirmar depósito',
          text: `¿Está seguro que desea depositar $${montoValido}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, depositar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            // Realizar el depósito
            saldo += montoValido;
            const ahora = luxon.DateTime.now().toLocaleString(luxon.DateTime.DATETIME_MED);
            transacciones.push(`Depósito: $${montoValido} - ${ahora}`);
  
            // Mostrar alerta de éxito
            Swal.fire({
              title: 'Depósito exitoso',
              text: `Ha depositado $${montoValido}. Su nuevo saldo es: $${saldo}.`,
              icon: 'success',
              confirmButtonText: 'OK',
              confirmButtonColor: '#3085d6'
            });
  
            // Actualizar el mensaje en la interfaz
            actionMessage.textContent = `Ha depositado $${montoValido}. Su nuevo saldo es: $${saldo}`;
  
            // Guardar los datos actualizados
            guardarDatos();
          }
        });
      } else {
        // Mostrar error si el monto es inválido
        Swal.fire({
          title: 'Monto inválido',
          text: 'Por favor, ingrese un monto válido para depositar.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
  
// Cambiar el PIN
function cambiarPIN() {
  Swal.fire({
    title: 'Ingrese su nuevo PIN',
    input: 'password',
    inputAttributes: {
      maxlength: 4,
      pattern: '\\d{4}',
      inputmode: 'numeric'
    },
    showCancelButton: true,
    confirmButtonText: 'Cambiar',
    cancelButtonText: 'Cancelar',
    preConfirm: (nuevoPin) => {
      if (!/^\d{4}$/.test(nuevoPin)) {
        Swal.showValidationMessage('El PIN debe tener 4 dígitos numéricos');
      }
      return nuevoPin;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      pinCorrecto = parseInt(result.value, 10);
      menuMessage.textContent = 'PIN cambiado exitosamente.';
      guardarDatos();
    }
  });
}

// Ver transacciones
function verTransacciones() {
    const cuerpoTransacciones = document.getElementById('cuerpo-transacciones');
    cuerpoTransacciones.innerHTML = ''; // Limpiar el contenido previo de la tabla
  
    if (transacciones.length === 0) {
      const filaVacia = `<tr><td colspan="3">No hay transacciones registradas.</td></tr>`;
      cuerpoTransacciones.innerHTML = filaVacia;
    } else {
      transacciones.forEach((transaccion) => {
        // Asumiendo que cada transacción tiene el formato: "Tipo: $monto - fecha"
        const partes = transaccion.split(' - ');
        const tipoYMonto = partes[0].split(': '); // Dividir el tipo del monto usando ": "
        const tipo = tipoYMonto[0];
        const monto = tipoYMonto[1];
        const fecha = partes[1];
  
        // Generar la fila correctamente con los datos obtenidos
        const nuevaFila = `
          <tr>
            <td>${tipo}</td>
            <td>${monto}</td>
            <td>${fecha}</td>
          </tr>
        `;
        cuerpoTransacciones.innerHTML += nuevaFila;
      });
    }
  
    menuSection.style.display = 'none';
    actionSection.style.display = 'none';
    document.getElementById('transacciones-section').style.display = 'block';
  }
  
  // Volver al menú desde la sección de transacciones
  document.getElementById('volver-menu').addEventListener('click', () => {
    document.getElementById('transacciones-section').style.display = 'none';
    menuSection.style.display = 'block';
  });
  
  

// Transferir dinero entre cuentas
function transferirEntreCuentas() {
    Swal.fire({
      title: 'Transferir Dinero',
      html: 
        '<input id="cuentaDestino" class="swal2-input" placeholder="Número de cuenta destino">' +
        '<input id="montoTransferencia" type="number" class="swal2-input" placeholder="Monto a transferir">',
      confirmButtonText: 'Transferir',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const cuentaDestino = document.getElementById('cuentaDestino').value;
        const monto = parseFloat(document.getElementById('montoTransferencia').value);
        
        // Validar si el monto es válido
        if (isNaN(monto) || monto <= 0) {
          Toastify({
            text: "Monto inválido.",
            duration: 3000,
            backgroundColor: "red",
          }).showToast();
          return;
        }

        // Validar si hay fondos suficientes
        if (monto > saldo) {
          Toastify({
            text: "Fondos insuficientes.",
            duration: 3000,
            backgroundColor: "red",
          }).showToast();
          return;
        }

        // Restar el monto del saldo actual y registrar la transacción
        saldo -= monto;
        const ahora = luxon.DateTime.now().toLocaleString(luxon.DateTime.DATETIME_MED);
        transacciones.push(`Transferencia de $${monto} a la cuenta ${cuentaDestino} - ${ahora}`);
        guardarDatos(); // Guardar los datos actualizados

        // Notificación de éxito con Toastify
        Toastify({
          text: `Transferiste $${monto} a la cuenta ${cuentaDestino}.`,
          duration: 3000,
          backgroundColor: "green",
        }).showToast();
      }
    });
  }

  // Vincular el botón al evento click para ejecutar la función
  document.getElementById('btnTransferir').addEventListener('click', transferirEntreCuentas);

// Validar el monto ingresado
function validarMonto(monto, callback) {
  if (isNaN(monto) || monto <= 0) {
    actionMessage.textContent = 'Monto inválido. Intente nuevamente.';
  } else {
    callback(monto);
  }
}

// Salir del cajero
function salir() {
    // Mostrar la alerta de confirmación para salir
    Swal.fire({
      title: '¿Seguro que quieres salir?',
      text: 'Gracias por usar el cajero automático. ¡CHAU!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, se realiza la acción de salir
        Swal.fire(
          '¡Hasta luego!',
          'Has salido del cajero automático.',
          'success'
        );
        menuSection.style.display = 'none';  // Ocultar el menú
        pinSection.style.display = 'block';  // Volver a la sección de PIN
      }
    });
  }
  

// Listeners
submitPinBtn.addEventListener('click', validarPIN);
menuSection.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const opcion = e.target.getAttribute('data-option');
    mostrarMenu(opcion);
  }
});
confirmActionBtn.addEventListener('click', () => {
  const monto = parseFloat(amountInput.value);
  if (currentAction) {
    currentAction(monto);
    actionSection.style.display = 'none';
  }
});

// Cargar los datos y mostrar mensaje de bienvenida
cargarDatos();
mostrarMensajeBienvenida();
