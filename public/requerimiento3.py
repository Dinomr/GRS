# requerimiento3.py

import json
import os

def cargar_juegos(ruta_archivo='data/juegos.json'):
    """Carga el catálogo de juegos desde un archivo JSON."""
    if not os.path.exists(ruta_archivo):
        return []
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        return json.load(f)

def guardar_juegos(juegos, ruta_archivo='data/juegos.json'):
    """Guarda el catálogo de juegos en el archivo JSON."""
    with open(ruta_archivo, 'w', encoding='utf-8') as f:
        json.dump(juegos, f, ensure_ascii=False, indent=2)

def vender_licencias(juegos, nombre_juego, cantidad):
    """
    Nombre: vender_licencias
    Parámetros:
      - juegos (list of dict): Catálogo cargado de juegos.
      - nombre_juego (str): Nombre único del juego.
      - cantidad (int): Número de licencias a devolver o revender.
    Retorno:
      - dict con:
          * mensaje (str): Confirmación o error.
          * juego_actualizado (dict|null): Juego modificado o None si no existe.
    Descripción:
      Valida que la cantidad a devolver no sea mayor que las licencias vendidas.
      Si es válida, incrementa licenciasDisponibles y decrementa licenciasVendidas.
    """
    # Buscar el juego
    juego = next((j for j in juegos if j['nombre'].lower() == nombre_juego.lower()), None)
    if juego is None:
        return {'mensaje': 'Juego no encontrado', 'juego_actualizado': None}

    # Validar devolución
    if juego['licenciasVendidas'] < cantidad:
        return {'mensaje': 'Cantidad a devolver inválida', 'juego_actualizado': juego}

    # Actualizar inventario
    juego['licenciasDisponibles'] += cantidad
    juego['licenciasVendidas'] -= cantidad

    mensaje = f"Venta/Devolución exitosa: {cantidad} licencias de \"{juego['nombre']}\"."
    return {'mensaje': mensaje, 'juego_actualizado': juego}

if __name__ == '__main__':
    ruta = 'data/juegos.json'
    juegos = cargar_juegos(ruta)

    nombre = input("Ingrese el nombre del juego a devolver/vender: ").strip()
    try:
        cantidad = int(input("Ingrese la cantidad de licencias a devolver: "))
    except ValueError:
        print("Cantidad inválida.")
        exit(1)

    resultado = vender_licencias(juegos, nombre, cantidad)
    print("\n" + resultado['mensaje'])

    if resultado['juego_actualizado']:
        guardar_juegos(juegos, ruta)
        print("Inventario actualizado correctamente.")
