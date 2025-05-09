# requerimiento4.py

import json
import os

def cargar_juegos(ruta_archivo='data/juegos.json'):
    """Carga el catálogo de juegos desde un archivo JSON."""
    if not os.path.exists(ruta_archivo):
        return []
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        return json.load(f)

def consultar_juego_mas_vendido(juegos):
    """
    Nombre: consultar_juego_mas_vendido
    Parámetros:
      - juegos (list of dict): Catálogo cargado de juegos.
    Retorno:
      - dict con:
          * nombre_juego (str|null): Nombre del juego más vendido.
          * cantidad_vendida (int): Licencias vendidas de ese juego.
    Descripción:
      Recorre la lista de juegos y encuentra el que tiene mayor
      valor en 'licenciasVendidas'. Si la lista está vacía, retorna
      nombre_juego=None y cantidad_vendida=0.
    """
    if not juegos:
        return { 'nombre_juego': None, 'cantidad_vendida': 0 }

    mas_vendido = juegos[0]
    for juego in juegos[1:]:
        if juego.get('licenciasVendidas', 0) > mas_vendido.get('licenciasVendidas', 0):
            mas_vendido = juego

    return {
        'nombre_juego': mas_vendido.get('nombre'),
        'cantidad_vendida': mas_vendido.get('licenciasVendidas', 0)
    }

if __name__ == '__main__':
    ruta = 'data/juegos.json'
    juegos = cargar_juegos(ruta)

    resultado = consultar_juego_mas_vendido(juegos)
    if resultado['nombre_juego']:
        print(f"Juego más vendido: {resultado['nombre_juego']} ({resultado['cantidad_vendida']} licencias vendidas)")
    else:
        print("No hay juegos registrados.")
