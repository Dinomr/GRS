# requerimiento2.py

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

def comprar_licencias(juegos, nombre_juego, cantidad):
    """
    Nombre: comprar_licencias
    Parámetros:
      - juegos (list of dict): Catálogo cargado de juegos.
      - nombre_juego (str): Nombre único del juego.
      - cantidad (int): Número de licencias a comprar.
    Retorno:
      - dict con:
          * mensaje (str): Confirmación o error.
          * juego_actualizado (dict|null): Juego modificado o None si no existe.
    Descripción:
      Verifica stock, aplica descuento por volumen:
        • 20% si categoría == 'rompecabezas' y cantidad ≥ 25
        • 15% si categoría == 'deporte' y cantidad ≥ 20
        • 15% si categoría == 'acción' y cantidad ≥ 15
      Actualiza licenciasDisponibles y licenciasVendidas.
    """
    # Buscar el juego
    juego = next((j for j in juegos if j['nombre'].lower() == nombre_juego.lower()), None)
    if juego is None:
        return {'mensaje': 'Juego no encontrado', 'juego_actualizado': None}

    # Validar stock
    if juego['licenciasDisponibles'] < cantidad:
        return {'mensaje': 'Licencias insuficientes', 'juego_actualizado': juego}

    # Calcular total y descuento
    precio_total = juego['precio'] * cantidad
    descuento = 0.0
    cat = juego['categoria'].lower()
    if cat == 'rompecabezas' and cantidad >= 25:
        descuento = 0.20
    elif cat == 'deporte' and cantidad >= 20:
        descuento = 0.15
    elif cat == 'acción' and cantidad >= 15:
        descuento = 0.15

    total_con_descuento = precio_total * (1 - descuento)

    # Actualizar inventario
    juego['licenciasDisponibles'] -= cantidad
    juego['licenciasVendidas'] += cantidad

    mensaje = (
        f"Compra exitosa: {cantidad} licencias de \"{juego['nombre']}\". "
        f"Total a pagar: ${total_con_descuento:.2f} (Descuento: {int(descuento*100)}%)."
    )
    return {'mensaje': mensaje, 'juego_actualizado': juego}

if __name__ == '__main__':
    ruta = 'data/juegos.json'
    juegos = cargar_juegos(ruta)

    nombre = input("Ingrese el nombre del juego a comprar: ").strip()
    try:
        cantidad = int(input("Ingrese la cantidad de licencias: "))
    except ValueError:
        print("Cantidad inválida.")
        exit(1)

    resultado = comprar_licencias(juegos, nombre, cantidad)
    print("\n" + resultado['mensaje'])

    if resultado['juego_actualizado']:
        guardar_juegos(juegos, ruta)
        print("Inventario actualizado correctamente.")
