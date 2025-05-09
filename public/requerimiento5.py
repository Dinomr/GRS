# requerimiento5.py

import json
import os

def cargar_juegos(ruta_archivo='data/juegos.json'):
    """Carga el catálogo de juegos desde un archivo JSON."""
    if not os.path.exists(ruta_archivo):
        return []
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        return json.load(f)

def consultar_descuento_volumen(juegos, detalles_compra):
    """
    Nombre: consultar_descuento_volumen
    Parámetros:
      - juegos (list of dict): Catálogo cargado de juegos.
      - detalles_compra (list of dict): Cada dict con claves:
          * 'nombre_juego' (str)
          * 'cantidad' (int)
    Retorno:
      - dict con:
          * porcentaje_descuento (float): 0.20, 0.15 o 0.0
          * total_con_descuento (float): Monto final tras aplicar el descuento
    Descripción:
      Suma cantidades solicitadas por categoría y calcula:
        1. Si rompecabezas >= 25 → descuento 20%
        2. Si deporte >= 20 y acción >= 15 → descuento 15%
      Solo la primera promoción que cumpla. Luego aplica el porcentaje
      al total bruto (precio * cantidad) y retorna el resultado.
    """
    # Inicializar sumas y total bruto
    sum_por_categoria = {'rompecabezas': 0, 'deporte': 0, 'acción': 0}
    total_bruto = 0.0

    # Calcular totales
    for item in detalles_compra:
        nombre = item.get('nombre_juego', '')
        cantidad = item.get('cantidad', 0)
        juego = next((j for j in juegos if j['nombre'].lower() == nombre.lower()), None)
        if juego:
            total_bruto += juego['precio'] * cantidad
            cat = juego['categoria'].lower()
            if cat in sum_por_categoria:
                sum_por_categoria[cat] += cantidad

    # Determinar porcentaje de descuento
    descuento = 0.0
    if sum_por_categoria['rompecabezas'] >= 25:
        descuento = 0.20
    elif sum_por_categoria['deporte'] >= 20 and sum_por_categoria['acción'] >= 15:
        descuento = 0.15

    total_con_descuento = total_bruto * (1 - descuento)

    return {
        'porcentaje_descuento': descuento,
        'total_con_descuento': round(total_con_descuento, 2)
    }

if __name__ == '__main__':
    ruta = 'data/juegos.json'
    juegos = cargar_juegos(ruta)

    print("Ingrese cada compra en formato: NombreJuego,Cantidad")
    print("Deje línea vacía para finalizar y calcular.")
    detalles = []
    while True:
        linea = input("> ").strip()
        if not linea:
            break
        try:
            nombre, cant = linea.split(',', 1)
            detalles.append({'nombre_juego': nombre.strip(), 'cantidad': int(cant)})
        except ValueError:
            print("Formato inválido. Use NombreJuego,Cantidad")

    resultado = consultar_descuento_volumen(juegos, detalles)
    pct = int(resultado['porcentaje_descuento'] * 100)
    total = resultado['total_con_descuento']
    print(f"\nDescuento aplicado: {pct}%")
    print(f"Total a pagar con descuento: ${total:.2f}")
