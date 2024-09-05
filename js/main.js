let pinCorrecto = 1234;
let saldo = 1000;
let transacciones = [];
// let currentAction = null;

// localStorage
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

// Guardar datos en localStorage
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

// PIN 
function mostrarMensajeBienvenida() {
  pinSection.style.display = 'block';
  menuSection.style.display = 'none';
  actionSection.style.display = 'none';
  pinMessage.textContent = 'Bienvenido al cajero automático';
}

function validarPIN() {
  const pinIngresado = parseInt(pinInput.value, 10);
  if (pinIngresado === pinCorrecto) {
    pinMessage.textContent = 'PIN correcto. Bienvenido al banco.';
    pinSection.style.display = 'none';
    menuSection.style.display = 'block';
  } else {
    pinMessage.textContent = 'PIN incorrecto. Intente nuevamente.';
  }
}

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
      currentAction = transferirDinero;
      mostrarAccion('Transferir');
      break;
    case 'g':
      salir();
      break;
    default:
      menuMessage.textContent = 'Opción no válida. Intente nuevamente.';
  }
}

function mostrarAccion(tipo) {
  actionSection.style.display = 'block';
  menuMessage.textContent = `Ingrese el monto a ${tipo}`;
}

function verSaldo() {
  menuMessage.textContent = `Su saldo es: $${saldo}`;
}

function retirarDinero(monto) {
  validarMonto(monto, (montoValido) => {
    if (montoValido > saldo) {
      actionMessage.textContent = 'Fondos insuficientes.';
    } else {
      saldo -= montoValido;
      transacciones.push(`Retiro: $${montoValido}`);
      actionMessage.textContent = `Ha retirado $${montoValido}. Su nuevo saldo es: $${saldo}`;
      guardarDatos(); 
    }
  });
}

function depositarDinero(monto) {
  validarMonto(monto, (montoValido) => {
    saldo += montoValido;
    transacciones.push(`Depósito: $${montoValido}`);
    actionMessage.textContent = `Ha depositado $${montoValido}. Su nuevo saldo es: $${saldo}`;
    guardarDatos(); 
  });
}

function cambiarPIN() {
  const nuevoPin = prompt('Ingrese su nuevo PIN:');
  if (nuevoPin && nuevoPin.length === 4) {
    pinCorrecto = parseInt(nuevoPin, 10);
    menuMessage.textContent = 'PIN cambiado exitosamente.';
    guardarDatos(); 
  } else {
    menuMessage.textContent = 'PIN inválido. Debe tener 4 dígitos.';
  }
}

function verTransacciones() {
  const transaccionesText = transacciones.length > 0 ? transacciones.join('\n') : 'No hay transacciones';
  menuMessage.textContent = `Transacciones:\n${transaccionesText}`;
}

function transferirDinero(monto) {
  validarMonto(monto, (montoValido) => {
    if (montoValido > saldo) {
      actionMessage.textContent = 'Fondos insuficientes.';
    } else {
      const cuentaDestino = prompt('Ingrese el número de cuenta de destino:');
      saldo -= montoValido;
      transacciones.push(`Transferencia de $${montoValido} a la cuenta ${cuentaDestino}`);
      actionMessage.textContent = `Ha transferido $${montoValido}. Su nuevo saldo es: $${saldo}`;
      guardarDatos(); 
    }
  });
}

function validarMonto(monto, callback) {
  if (isNaN(monto) || monto <= 0) {
    actionMessage.textContent = 'Monto inválido. Intente nuevamente.';
  } else {
    callback(monto);
  }
}


function salir() {
  menuMessage.textContent = 'Gracias por usar el cajero automático. ¡CHAU!';
  menuSection.style.display = 'none';
}

// Asignar eventos
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

// Inicializar cajero automatico
cargarDatos(); 
mostrarMensajeBienvenida();
