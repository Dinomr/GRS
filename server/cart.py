from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from app import db, Game, Transaction, TransactionDetail

cart = Blueprint('cart', __name__)

def calculate_discount(items):
    # Agrupar licencias por categoría
    category_licenses = {}
    for item in items:
        game = Game.query.get(item['game_id'])
        if game:
            category_licenses[game.category] = category_licenses.get(game.category, 0) + item['quantity']
    
    # Aplicar reglas de descuento
    discount = 0
    if category_licenses.get('rompecabezas', 0) >= 25:
        discount = 20
    elif (category_licenses.get('deportes', 0) >= 20 and 
          category_licenses.get('accion', 0) >= 15):
        discount = 15
    
    return discount

@cart.route('/cart/calculate', methods=['POST'])
@jwt_required()
def calculate_cart():
    data = request.get_json()
    items = data.get('items', [])
    
    if not items:
        return jsonify({'error': 'El carrito está vacío'}), 400
    
    # Calcular subtotal y verificar disponibilidad
    subtotal = 0
    for item in items:
        game = Game.query.get(item['game_id'])
        if not game:
            return jsonify({'error': f'Juego no encontrado: {item["game_id"]}'}), 404
        
        if item['quantity'] > game.available_licenses:
            return jsonify({'error': f'No hay suficientes licencias disponibles para {game.name}'}), 400
        
        subtotal += game.price * item['quantity']
    
    # Calcular descuento
    discount_percentage = calculate_discount(items)
    discount_amount = (subtotal * discount_percentage) / 100
    total = subtotal - discount_amount
    
    return jsonify({
        'subtotal': subtotal,
        'discount_percentage': discount_percentage,
        'discount_amount': discount_amount,
        'total': total
    }), 200

@cart.route('/cart/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    data = request.get_json()
    items = data.get('items', [])
    
    if not items:
        return jsonify({'error': 'El carrito está vacío'}), 400
    
    # Verificar disponibilidad y calcular totales
    subtotal = 0
    for item in items:
        game = Game.query.get(item['game_id'])
        if not game:
            return jsonify({'error': f'Juego no encontrado: {item["game_id"]}'}), 404
        
        if item['quantity'] > game.available_licenses:
            return jsonify({'error': f'No hay suficientes licencias disponibles para {game.name}'}), 400
        
        subtotal += game.price * item['quantity']
    
    # Calcular descuento
    discount_percentage = calculate_discount(items)
    discount_amount = (subtotal * discount_percentage) / 100
    total = subtotal - discount_amount
    
    # Crear transacción
    transaction = Transaction(
        user_id=user_id,
        date=datetime.utcnow(),
        total_amount=total,
        discount_percentage=discount_percentage,
        transaction_type='purchase'
    )
    
    try:
        db.session.add(transaction)
        db.session.flush()  # Para obtener el ID de la transacción
        
        # Crear detalles de transacción y actualizar inventario
        for item in items:
            game = Game.query.get(item['game_id'])
            
            # Crear detalle
            detail = TransactionDetail(
                transaction_id=transaction.id,
                game_id=game.id,
                quantity=item['quantity'],
                unit_price=game.price
            )
            db.session.add(detail)
            
            # Actualizar inventario
            game.available_licenses -= item['quantity']
            game.sold_licenses += item['quantity']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Compra exitosa',
            'transaction_id': transaction.id,
            'total': total
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al procesar la compra'}), 500

@cart.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).all()
    
    result = []
    for transaction in transactions:
        details = TransactionDetail.query.filter_by(transaction_id=transaction.id).all()
        items = []
        for detail in details:
            game = Game.query.get(detail.game_id)
            items.append({
                'game_name': game.name,
                'quantity': detail.quantity,
                'unit_price': detail.unit_price,
                'subtotal': detail.quantity * detail.unit_price
            })
        
        result.append({
            'id': transaction.id,
            'date': transaction.date.isoformat(),
            'total_amount': transaction.total_amount,
            'discount_percentage': transaction.discount_percentage,
            'transaction_type': transaction.transaction_type,
            'items': items
        })
    
    return jsonify(result), 200 