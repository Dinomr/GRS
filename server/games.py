from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_

games = Blueprint('games', __name__)

@games.route('/games', methods=['GET'])
def get_games():
    from app import Game
    # Obtener parámetros de filtrado y ordenamiento
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    sort_by = request.args.get('sort_by', 'name')
    sort_order = request.args.get('sort_order', 'asc')
    
    # Construir query base
    query = Game.query
    
    # Aplicar filtros
    if search:
        query = query.filter(Game.name.ilike(f'%{search}%'))
    if category:
        query = query.filter(Game.category == category)
    
    # Aplicar ordenamiento
    if sort_by == 'price':
        query = query.order_by(Game.price.asc() if sort_order == 'asc' else Game.price.desc())
    else:  # Por defecto ordenar por nombre
        query = query.order_by(Game.name.asc() if sort_order == 'asc' else Game.name.desc())
    
    # Ejecutar query y formatear resultados
    games_list = query.all()
    return jsonify([{
        'id': game.id,
        'name': game.name,
        'category': game.category,
        'price': game.price,
        'available_licenses': game.available_licenses,
        'image_url': game.image_url
    } for game in games_list]), 200

@games.route('/games/<int:game_id>', methods=['GET'])
def get_game_details(game_id):
    from app import Game
    game = Game.query.get_or_404(game_id)
    return jsonify({
        'id': game.id,
        'name': game.name,
        'category': game.category,
        'size_kb': game.size_kb,
        'price': game.price,
        'available_licenses': game.available_licenses,
        'sold_licenses': game.sold_licenses,
        'image_url': game.image_url
    }), 200

@games.route('/games', methods=['POST'])
@jwt_required()
def create_game():
    from app import db, Game, User
    # Verificar si el usuario es administrador
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.get_json()
    
    # Validar datos requeridos
    required_fields = ['name', 'category', 'size_kb', 'price', 'available_licenses']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan datos requeridos'}), 400
    
    # Verificar si el nombre ya existe
    if Game.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Ya existe un juego con ese nombre'}), 400
    
    # Crear nuevo juego
    new_game = Game(
        name=data['name'],
        category=data['category'],
        size_kb=data['size_kb'],
        price=data['price'],
        available_licenses=data['available_licenses'],
        image_url=data.get('image_url', '')
    )
    
    try:
        db.session.add(new_game)
        db.session.commit()
        return jsonify({'message': 'Juego creado exitosamente', 'id': new_game.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el juego'}), 500

@games.route('/games/<int:game_id>', methods=['PUT'])
@jwt_required()
def update_game(game_id):
    from app import db, Game, User
    # Verificar si el usuario es administrador
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'No autorizado'}), 403
    
    game = Game.query.get_or_404(game_id)
    data = request.get_json()
    
    # Actualizar campos permitidos
    if 'category' in data:
        game.category = data['category']
    if 'size_kb' in data:
        game.size_kb = data['size_kb']
    if 'price' in data:
        game.price = data['price']
    if 'available_licenses' in data:
        game.available_licenses = data['available_licenses']
    if 'image_url' in data:
        game.image_url = data['image_url']
    if 'min_stock' in data:
        game.min_stock = data['min_stock']
    
    try:
        db.session.commit()
        return jsonify({'message': 'Juego actualizado exitosamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al actualizar el juego'}), 500 