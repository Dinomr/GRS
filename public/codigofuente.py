# app.py

import json
import os
import sys

DATA_PATH = os.path.join('data', 'juegos.json')

def cargar_juegos(ruta=DATA_PATH):
    """Carga el catálogo de juegos desde un JSON."""
    if not os.path.exists(ruta):
        return []
    with open(ruta, 'r', encoding='utf-8') as f:
        return json.load(f)

def guardar_juegos(juegos, ruta=DATA_PATH):
    """Guarda el catálogo de juegos en el JSON."""
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(juegos, f, ensure_ascii=False, indent=2)

# --- Requerimiento 1 ---
def visualizar_detalle_juego(juegos, nombre):
    """
    Nombre: visualizar_detalle_juego
    Parámetros:
      - juegos (list of dict)
      - nombre (str)
    Retorno:
      - dict con todos los atributos del juego, o None si no existe
    """
    return next((j for j in juegos if j['nombre'].lower() == nombre.lower()), None)

# --- Requerimiento 2 ---
def comprar_licencias(juegos, nombre, cantidad):
    """
    Nombre: comprar_licencias
    Parámetros:
      - juegos (list of dict)
      - nombre (str)
      - cantidad (int)
    Retorno:
      - dict { mensaje: str, juego_actualizado: dict|null }
    """
    juego = visualizar_detalle_juego(juegos, nombre)
    if juego is None:
        return {'mensaje': 'Juego no encontrado', 'juego_actualizado': None}
    if juego['licenciasDisponibles'] < cantidad:
        return {'mensaje': 'Licencias insuficientes', 'juego_actualizado': juego}

    precio_total = juego['precio'] * cantidad
    descuento = 0.0
    cat = juego['categoria'].lower()
    if cat == 'rompecabezas' and cantidad >= 25:
        descuento = 0.20
    elif cat == 'deporte' and cantidad >= 20:
        descuento = 0.15
    elif cat == 'acción' and cantidad >= 15:
        descuento = 0.15

    total_desc = precio_total * (1 - descuento)
    juego['licenciasDisponibles'] -= cantidad
    juego['licenciasVendidas'] += cantidad

    mensaje = (f"Compra exitosa: {cantidad} licencias de \"{juego['nombre']}\". "
               f"Total a pagar: ${total_desc:.2f} (Descuento: {int(descuento*100)}%).")
    return {'mensaje': mensaje, 'juego_actualizado': juego}

# --- Requerimiento 3 ---
def vender_licencias(juegos, nombre, cantidad):
    """
    Nombre: vender_licencias
    Parámetros:
      - juegos (list of dict)
      - nombre (str)
      - cantidad (int)
    Retorno:
      - dict { mensaje: str, juego_actualizado: dict|null }
    """
    juego = visualizar_detalle_juego(juegos, nombre)
    if juego is None:
        return {'mensaje': 'Juego no encontrado', 'juego_actualizado': None}
    if juego['licenciasVendidas'] < cantidad:
        return {'mensaje': 'Cantidad a devolver inválida', 'juego_actualizado': juego}

    juego['licenciasDisponibles'] += cantidad
    juego['licenciasVendidas'] -= cantidad
    mensaje = f"Venta/Devolución exitosa: {cantidad} licencias de \"{juego['nombre']}\"."
    return {'mensaje': mensaje, 'juego_actualizado': juego}

# --- Requerimiento 4 ---
def consultar_juego_mas_vendido(juegos):
    """
    Nombre: consultar_juego_mas_vendido
    Parámetros:
      - juegos (list of dict)
    Retorno:
      - dict { nombre_juego: str|null, cantidad_vendida: int }
    """
    if not juegos:
        return {'nombre_juego': None, 'cantidad_vendida': 0}
    mas_vendido = max(juegos, key=lambda j: j.get('licenciasVendidas', 0))
    return {
        'nombre_juego': mas_vendido['nombre'],
        'cantidad_vendida': mas_vendido.get('licenciasVendidas', 0)
    }

# --- Requerimiento 5 ---
def consultar_descuento_volumen(juegos, detalles):
    """
    Nombre: consultar_descuento_volumen
    Parámetros:
      - juegos (list of dict)
      - detalles (list of { nombre_juego: str, cantidad: int })
    Retorno:
      - dict { porcentaje_descuento: float, total_con_descuento: float }
    """
    sum_cat = {'rompecabezas': 0, 'deporte': 0, 'acción': 0}
    total_bruto = 0.0

    for item in detalles:
        juego = visualizar_detalle_juego(juegos, item['nombre_juego'])
        if not juego:
            continue
        total_bruto += juego['precio'] * item['cantidad']
        cat = juego['categoria'].lower()
        if cat in sum_cat:
            sum_cat[cat] += item['cantidad']

    descuento = 0.0
    if sum_cat['rompecabezas'] >= 25:
        descuento = 0.20
    elif sum_cat['deporte'] >= 20 and sum_cat['acción'] >= 15:
        descuento = 0.15

    total_desc = total_bruto * (1 - descuento)
    return {'porcentaje_descuento': descuento, 'total_con_descuento': round(total_desc, 2)}

# --- Interfaz de Línea de Comandos ---
def menu():
    juegos = cargar_juegos()
    while True:
        print("\n--- Menú AppStore ---")
        print("1) Ver detalle de un juego")
        print("2) Comprar licencias")
        print("3) Vender licencias")
        print("4) Consultar juego más vendido")
        print("5) Descuento por volumen")
        print("6) Salir")
        opt = input("Opción: ").strip()
        if opt == '1':
            n = input("Nombre del juego: ").strip()
            det = visualizar_detalle_juego(juegos, n)
            if det:
                for k,v in det.items():
                    print(f"{k}: {v}")
            else:
                print("Juego no encontrado.")
        elif opt == '2':
            n = input("Nombre del juego: ").strip()
            c = int(input("Cantidad a comprar: "))
            res = comprar_licencias(juegos, n, c)
            print(res['mensaje'])
            if res['juego_actualizado']:
                guardar_juegos(juegos)
        elif opt == '3':
            n = input("Nombre del juego: ").strip()
            c = int(input("Cantidad a devolver: "))
            res = vender_licencias(juegos, n, c)
            print(res['mensaje'])
            if res['juego_actualizado']:
                guardar_juegos(juegos)
        elif opt == '4':
            mv = consultar_juego_mas_vendido(juegos)
            if mv['nombre_juego']:
                print(f"Más vendido: {mv['nombre_juego']} ({mv['cantidad_vendida']} licencias)")
            else:
                print("No hay juegos.")
        elif opt == '5':
            print("Ingrese en formato NombreJuego,Cantidad. Línea vacía para terminar.")
            detalles = []
            while True:
                line = input("> ").strip()
                if not line: break
                n,c = line.split(',',1)
                detalles.append({'nombre_juego': n.strip(), 'cantidad': int(c)})
            dto = consultar_descuento_volumen(juegos, detalles)
            print(f"Descuento: {int(dto['porcentaje_descuento']*100)}%")
            print(f"Total con descuento: ${dto['total_con_descuento']:.2f}")
        elif opt == '6':
            print("Saliendo...")
            sys.exit()
        else:
            print("Opción inválida.")

if __name__ == '__main__':
    menu()
