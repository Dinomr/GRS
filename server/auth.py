from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    from app import db, User
    data = request.get_json()
    
    # Validar datos requeridos
    if not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({'error': 'Faltan datos requeridos'}), 400
    
    # Validar formato de email
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
        return jsonify({'error': 'Formato de email inválido'}), 400
    
    # Validar seguridad de contraseña
    if len(data['password']) < 8:
        return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres'}), 400
    
    # Verificar si el email ya existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    # Crear nuevo usuario
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=generate_password_hash(data['password'])
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Usuario registrado exitosamente'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar usuario'}), 500

@auth.route('/login', methods=['POST'])
def login():
    from app import User
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Faltan datos requeridos'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }), 200
    
    return jsonify({'error': 'Credenciales inválidas'}), 401

# Nuevo endpoint para promover usuario a admin
@auth.route('/users/<int:user_id>/promote', methods=['PUT'])
@jwt_required()
def promote_user(user_id):
    from app import db, User
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.is_admin:
        return jsonify({'error': 'No autorizado'}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    user.is_admin = True
    db.session.commit()
    return jsonify({'message': 'Usuario promovido a administrador'}), 200

# Endpoint para listar usuarios (solo admin)
@auth.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    from app import User
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'error': 'No autorizado'}), 403
    users = User.query.all()
    return jsonify([
        {
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'is_admin': u.is_admin
        } for u in users
    ]), 200 