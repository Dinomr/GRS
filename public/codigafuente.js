// app.js
// Código fuente consolidado para los 5 Requerimientos Funcionales
// Node.js CLI usando readline y un JSON de ejemplo: data/juegos.json

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cargar datos iniciales
const dataPath = path.join(__dirname, 'data', 'juegos.json');
let juegos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// --- Requerimiento 1: Visualizar información detallada ---
/**
 * Nombre: visualizarDetalleJuego
 * Parámetros:
 *   - nombreJuego: string
 * Retorno:
 *   - objeto juego completo, o null si no existe
 * Descripción:
 *   Busca el juego por nombre y devuelve todos sus atributos.
 */
function visualizarDetalleJuego(nombreJuego) {
  const juego = juegos.find(j => j.nombre === nombreJuego);
  return juego || null;
}

// --- Requerimiento 2: Comprar licencias ---
/**
 * Nombre: comprarLicencias
 * Parámetros:
 *   - nombreJuego: string
 *   - cantidad: number
 * Retorno:
 *   - { mensaje: string, juegoActualizado: object|null }
 * Descripción:
 *   Valida stock, aplica descuento por volumen si corresponde,
 *   actualiza licenciasDisponibles y licenciasVendidas.
 */
function comprarLicencias(nombreJuego, cantidad) {
  const juego = juegos.find(j => j.nombre === nombreJuego);
  if (!juego) return { mensaje: 'Juego no encontrado', juegoActualizado: null };
  if (juego.licenciasDisponibles < cantidad) {
    return { mensaje: 'Licencias insuficientes', juegoActualizado: juego };
  }
  const precioTotal = juego.precio * cantidad;
  let descuento = 0;
  if (juego.categoria === 'rompecabezas' && cantidad >= 25) descuento = 0.20;
  else if (juego.categoria === 'deporte' && cantidad >= 20) descuento = 0.15;
  else if (juego.categoria === 'acción' && cantidad >= 15) descuento = 0.15;
  const totalConDescuento = precioTotal * (1 - descuento);

  juego.licenciasDisponibles -= cantidad;
  juego.licenciasVendidas += cantidad;

  return {
    mensaje: `Compra exitosa: ${cantidad} licencias de "${nombreJuego}". Total a pagar: $${totalConDescuento.toFixed(2)} (Descuento: ${Math.round(descuento*100)}%).`,
    juegoActualizado: juego
  };
}

// --- Requerimiento 3: Vender/Devolver licencias ---
/**
 * Nombre: venderLicencias
 * Parámetros:
 *   - nombreJuego: string
 *   - cantidad: number
 * Retorno:
 *   - { mensaje: string, juegoActualizado: object|null }
 * Descripción:
 *   Valida que no se devuelva más licencias de las vendidas,
 *   actualiza licenciasDisponibles y licenciasVendidas.
 */
function venderLicencias(nombreJuego, cantidad) {
  const juego = juegos.find(j => j.nombre === nombreJuego);
  if (!juego) return { mensaje: 'Juego no encontrado', juegoActualizado: null };
  if (juego.licenciasVendidas < cantidad) {
    return { mensaje: 'Cantidad a devolver inválida', juegoActualizado: juego };
  }
  juego.licenciasDisponibles += cantidad;
  juego.licenciasVendidas -= cantidad;
  return {
    mensaje: `Venta/Devolución exitosa: ${cantidad} licencias de "${nombreJuego}".`,
    juegoActualizado: juego
  };
}

// --- Requerimiento 4: Consultar juego más vendido ---
/**
 * Nombre: consultarJuegoMasVendido
 * Parámetros: ninguno
 * Retorno:
 *   - { nombreJuego: string|null, cantidadVendida: number }
 * Descripción:
 *   Recorre todos los juegos y devuelve el que tiene más licenciasVendidas.
 */
function consultarJuegoMasVendido() {
  if (juegos.length === 0) return { nombreJuego: null, cantidadVendida: 0 };
  let masVendido = juegos[0];
  for (const j of juegos.slice(1)) {
    if (j.licenciasVendidas > masVendido.licenciasVendidas) {
      masVendido = j;
    }
  }
  return { nombreJuego: masVendido.nombre, cantidadVendida: masVendido.licenciasVendidas };
}

// --- Requerimiento 5: Descuento por volumen de compra ---
/**
 * Nombre: consultarDescuentoVolumen
 * Parámetros:
 *   - detallesCompra: Array<{ nombreJuego: string, cantidad: number }>
 * Retorno:
 *   - { porcentajeDescuento: number, totalConDescuento: number }
 * Descripción:
 *   Suma cantidades por categoría y aplica:
 *     • 20% si rompecabezas ≥25
 *     • 15% si deporte ≥20 y acción ≥15
 *   Sólo la primera promoción que aplique.
 */
function consultarDescuentoVolumen(detallesCompra) {
  let totalBruto = 0;
  const sumPorCat = { rompecabezas: 0, deporte: 0, acción: 0 };

  for (const item of detallesCompra) {
    const juego = juegos.find(j => j.nombre === item.nombreJuego);
    if (!juego) continue;
    totalBruto += juego.precio * item.cantidad;
    if (sumPorCat.hasOwnProperty(juego.categoria)) {
      sumPorCat[juego.categoria] += item.cantidad;
    }
  }

  let descuento = 0;
  if (sumPorCat.rompecabezas >= 25) descuento = 0.20;
  else if (sumPorCat.deporte >= 20 && sumPorCat.acción >= 15) descuento = 0.15;

  return {
    porcentajeDescuento: descuento,
    totalConDescuento: totalBruto * (1 - descuento)
  };
}

// --- Persistir cambios en JSON ---
function guardarCambios() {
  fs.writeFileSync(dataPath, JSON.stringify(juegos, null, 2), 'utf8');
}

// --- Interfaz de línea de comandos ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log('\n=== AppStore de Juegos ===');
  console.log('1. Ver detalle de un juego');
  console.log('2. Comprar licencias');
  console.log('3. Vender licencias');
  console.log('4. Consultar juego más vendido');
  console.log('5. Consultar descuento por volumen');
  console.log('6. Salir');
  rl.question('Selecciona una opción: ', opcion => {
    switch (opcion.trim()) {
      case '1':
        rl.question('Nombre del juego: ', nombre => {
          const detalle = visualizarDetalleJuego(nombre.trim());
          console.log(detalle || 'Juego no encontrado');
          menu();
        });
        break;
      case '2':
        rl.question('Nombre del juego: ', nombre2 => {
          rl.question('Cantidad a comprar: ', cant => {
            const res = comprarLicencias(nombre2.trim(), +cant);
            console.log(res.mensaje);
            guardarCambios();
            menu();
          });
        });
        break;
      case '3':
        rl.question('Nombre del juego: ', nombre3 => {
          rl.question('Cantidad a devolver: ', cant2 => {
            const res = venderLicencias(nombre3.trim(), +cant2);
            console.log(res.mensaje);
            guardarCambios();
            menu();
          });
        });
        break;
      case '4':
        const mv = consultarJuegoMasVendido();
        console.log(
          mv.nombreJuego
            ? `Juego más vendido: ${mv.nombreJuego} (${mv.cantidadVendida} licencias)`
            : 'No hay datos'
        );
        menu();
        break;
      case '5':
        console.log('Ingrese cada juego y cantidad separados por coma (ej: PuzzleManía,10).');
        console.log('Termina con línea vacía.');
        const detalles = [];
        (function leeItem() {
          rl.question('> ', line => {
            if (!line.trim()) {
              const dto = consultarDescuentoVolumen(detalles);
              console.log(`Descuento: ${Math.round(dto.porcentajeDescuento*100)}%  Total final: $${dto.totalConDescuento.toFixed(2)}`);
              menu();
            } else {
              const [nombre5, cant5] = line.split(',').map(s => s.trim());
              detalles.push({ nombreJuego: nombre5, cantidad: +cant5 });
              leeItem();
            }
          });
        })();
        break;
      case '6':
        rl.close();
        break;
      default:
        console.log('Opción inválida.');
        menu();
    }
  });
}

menu();
