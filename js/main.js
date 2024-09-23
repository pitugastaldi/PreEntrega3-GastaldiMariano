let pinCorrecto = 1234;
let saldo = 1000;
let transacciones = [];
let currentAction = null;

function cargarDatos() {
  const pinGuardado = localStorage.getItem('pinCorrecto');
  const saldoGuardado = localStorage.getItem('saldo');
  const transaccionesGuardadas = localStorage.getItem('transacciones');

  pinCorrecto = pinGuardado ? parseInt(pinGuardado, 10) : pinCorrecto;
  saldo = saldoGuardado ? parseFloat(saldoGuardado) : saldo;
  transacciones = transaccionesGuardadas ? JSON.parse(transaccionesGuardadas) : [];
}

function guardarDatos() {
  localStorage.setItem('pinCorrecto', pinCorrecto);
  localStorage.setItem('saldo', saldo);
  localStorage.setItem('transacciones', JSON.stringify(transacciones));
}


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


function mostrarCarga(mensaje) {
  Swal.fire({
    title: mensaje,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

function cerrarCarga() {
  Swal.close();
}

function deshabilitarBotones(seccion) {
  const botones = seccion.querySelectorAll('button');
  botones.forEach(btn => btn.disabled = true);
}

function habilitarBotones(seccion) {
  const botones = seccion.querySelectorAll('button');
  botones.forEach(btn => btn.disabled = false);
}

function resetearCampos(seccion) {
  const inputs = seccion.querySelectorAll('input');
  inputs.forEach(input => input.value = '');
}

function mostrarNotificacion(mensaje, tipo) {
  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: tipo === "error" ? "red" : (tipo === "success" ? "green" : "#3085d6"),
  }).showToast();
}

function actualizarSaldoUI() {
  const saldoElement = document.getElementById('saldoActual');
  const colorSaldo = saldo > 0 ? 'text-success' : 'text-danger';
}

function mostrarSeccion(seccion) {
  seccion.style.display = 'block';
  seccion.classList.add('animate__animated', 'animate__fadeIn');
}

function ocultarSeccion(seccion) {
  seccion.classList.remove('animate__fadeIn');
  seccion.classList.add('animate__fadeOut');
  setTimeout(() => {
    seccion.style.display = 'none';
    seccion.classList.remove('animate__animated', 'animate__fadeOut');
  }, 1000);
}

function mostrarMensajeBienvenida() {
  mostrarSeccion(pinSection);
  ocultarSeccion(menuSection);
  ocultarSeccion(actionSection);
  pinMessage.textContent = 'Bienvenido al cajero automático';
}

function verificarPINConPromesa(pinIngresado) {
  return new Promise((resolve, reject) => {
        setTimeout(() => {
      if (pinIngresado === pinCorrecto) {
        resolve('PIN correcto');
      } else {
        reject('PIN incorrecto');
      }
    }, 2000);
  });
}


function validarPIN() {
  const pinIngresado = parseInt(pinInput.value, 10);
  
  if (isNaN(pinIngresado) || pinInput.value.length !== 4) {
    mostrarNotificacion("El PIN debe tener 4 dígitos numéricos.", "error");
    return;
  }

  mostrarCarga("Validando PIN...");
  deshabilitarBotones(pinSection);
  
  verificarPINConPromesa(pinIngresado)
    .then((mensajeExito) => {
      cerrarCarga();
      mostrarNotificacion(mensajeExito + ". Bienvenido al banco.", "success");
      ocultarSeccion(pinSection);
      mostrarSeccion(menuSection);
      actualizarSaldoUI();
      resetearCampos(pinSection);
    })
    .catch((mensajeError) => {
      cerrarCarga();
      mostrarNotificacion(mensajeError + ". Intente nuevamente.", "error");
      habilitarBotones(pinSection);
      resetearCampos(pinSection);
    });
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
      transferirEntreCuentas();
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
  resetearCampos(actionSection);
}

function verSaldo() {
  const colorSaldo = saldo > 0 ? 'green' : 'red';
  Swal.fire({
    title: 'Saldo actual',
    html: `Su saldo es: <span style="color:${colorSaldo};">$${saldo}</span>`,
    icon: 'info',
    confirmButtonText: 'OK',
  });
}


function validarMonto(monto) {
  return new Promise((resolve, reject) => {
    if (isNaN(monto) || monto <= 0) {
      reject('El monto ingresado no es válido');
    } else {
      resolve(monto);
      console.log(monto);
    }
  });
}

async function retirarDinero(monto) {
    try {
      const montoValido = await validarMonto(monto);
      if (montoValido > saldo) {
        throw new Error(`Fondos insuficientes. Saldo actual: $${saldo}`);
      }
  
      mostrarCarga("Procesando retiro...");
      deshabilitarBotones(actionSection);
  
      await validarRetiroConPromesa(montoValido);
  
      saldo -= montoValido; 
      registrarTransaccion(`Retiro: $${montoValido}`);
      
      cerrarCarga();

     
      mostrarNotificacion(`Retiro exitoso de $${montoValido}. Saldo actual: $${saldo.toFixed(2)}`, "success");
      
      actualizarSaldoUI(); 
      guardarDatos();
      resetearCampos(actionSection);
      habilitarBotones(actionSection);
      
    } catch (error) {
      cerrarCarga();
      mostrarNotificacion(error.message || error, "error");
      habilitarBotones(actionSection);
    }
}

  async function depositarDinero(monto) {
    try {
      const montoValido = await validarMonto(monto);
      
      mostrarCarga("Procesando depósito...");
      deshabilitarBotones(actionSection);
  
     
      await validarDepositoConPromesa(montoValido); 
  
      saldo += montoValido;
      registrarTransaccion(`Depósito: $${montoValido}`);
      cerrarCarga();
      mostrarNotificacion(`Deposito exitoso de $${montoValido}. Saldo actual: $${saldo.toFixed(2)}`, "success");
      actualizarSaldoUI();
      guardarDatos();
      resetearCampos(actionSection);
      habilitarBotones(actionSection);
    } catch (error) {
      cerrarCarga();
      mostrarNotificacion(error.message || error, "error");
      habilitarBotones(actionSection);
    }
  }
  

function validarRetiroConPromesa(monto) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        
        if (monto > 0 && monto <= saldo) {
          resolve('Retiro válido'); 
        } else {
          reject(`Fondos insuficientes. Saldo actual: $${saldo}`); 
        }
      }, 1500); 
    });
  }

  function validarDepositoConPromesa(monto) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        
        if (monto > 0 && monto <= saldo) {
          resolve('Deposito válido'); 
        } else {
          reject(`Fondos insuficientes. Saldo actual: $${saldo}`); 
        }
      }, 1500); 
    });
  }
  
function cambiarPIN() {
  Swal.fire({
    title: 'Ingrese su nuevo PIN',
    input: 'password',
    inputAttributes: {
      maxlength: 4,
      pattern: '\\d{4}',
      inputmode: 'numeric',
      'aria-label': 'Nuevo PIN'
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
      mostrarNotificacion('PIN cambiado exitosamente.', "success");
      guardarDatos();
    }
  });
}

function ocultarSeccion(seccion) {
    seccion.style.display = 'none';
  }
  

  function mostrarSeccion(seccion) {
    seccion.style.display = 'block';
  }
  
  function verTransacciones() {
    const cuerpoTransacciones = document.getElementById('cuerpo-transacciones');
    const transaccionesSection = document.getElementById('transacciones-section');
    const menuSection = document.getElementById('menu-section'); 
    
    cuerpoTransacciones.innerHTML = ''; 
    
    if (transacciones.length === 0) {
      cuerpoTransacciones.innerHTML = `<tr><td colspan="3" class="text-center">No hay transacciones registradas.</td></tr>`;
    } else {
      transacciones.forEach((transaccion) => {
        const [tipoYMonto, fecha] = transaccion.split(' - ');
        const [tipo, monto] = tipoYMonto.split(': ');
        cuerpoTransacciones.innerHTML += `
          <tr>
            <td>${tipo}</td>
            <td>${monto}</td>
            <td>${fecha}</td>
          </tr>`;
      });
    }
  
    ocultarSeccion(menuSection);
    mostrarSeccion(transaccionesSection);
  }
  
  
  function volverAlMenu() {
    const transaccionesSection = document.getElementById('transacciones-section');
    const menuSection = document.getElementById('menu-section'); 
    ocultarSeccion(transaccionesSection);
    mostrarSeccion(menuSection);
  }
  
  
  document.getElementById('volver-menu').addEventListener('click', volverAlMenu);
  


function registrarTransaccion(descripcion) {
  const ahora = luxon.DateTime.now().toLocaleString(luxon.DateTime.DATETIME_MED);
  transacciones.push(`${descripcion} - ${ahora}`);
}


async function transferirEntreCuentas() {
  try {
    const { value: formValues } = await Swal.fire({
      title: 'Transferir Dinero',
      html: `
        <input id="cuentaDestino" class="swal2-input" placeholder="Número de cuenta destino" aria-label="Cuenta destino">
        <input id="montoTransferencia" type="number" class="swal2-input" placeholder="Monto a transferir" aria-label="Monto a transferir">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('cuentaDestino').value.trim(),
          parseFloat(document.getElementById('montoTransferencia').value)
        ];
      }
    });

    if (formValues) {
      const [cuentaDestino, monto] = formValues;

      if (!cuentaDestino) {
        throw new Error('Debe ingresar una cuenta destino válida.');
      }

      const montoValido = await validarMonto(monto);
      if (montoValido > saldo) {
        throw new Error('Fondos insuficientes.');
      }

      mostrarCarga("Procesando transferencia...");
      deshabilitarBotones(actionSection);

     
      await validarTransferenciaConPromesa(cuentaDestino, montoValido);

      saldo -= montoValido;
      registrarTransaccion(`Transferencia de $${montoValido} a la cuenta ${cuentaDestino}`);
      cerrarCarga();
      mostrarNotificacion(`Transferencia exitosa de $${montoValido} a la cuenta ${cuentaDestino}.`, "success");
      actualizarSaldoUI();
      guardarDatos();
      resetearCampos(actionSection);
      habilitarBotones(actionSection);
    }
  } catch (error) {
    cerrarCarga();
    mostrarNotificacion(error.message || error, "error");
    habilitarBotones(actionSection);
  }
}


function validarTransferenciaConPromesa(cuentaDestino, monto) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
     
        if (cuentaDestino && monto > 0 && monto <= saldo) {
          resolve('Transferencia válida'); 
        } else {
          reject('Error en la transferencia. Verifique los datos ingresados.'); 
        }
      }, 2000); 
    });
  }

function salir() {
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
      Swal.fire(
        '¡Hasta luego!',
        'Has salido del cajero automático.',
        'success'
      );
      ocultarSeccion(menuSection);
      mostrarSeccion(pinSection);
      actualizarSaldoUI();
      resetearCampos(pinSection);
    }
  });
}

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

cargarDatos();
mostrarMensajeBienvenida();
actualizarSaldoUI();
