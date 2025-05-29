from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
import os

# Crear aplicación Flask
app = Flask(__name__)

# Configurar CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///games.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Inicializar extensiones
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Definir modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_admin': self.is_admin
        }

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    size_kb = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    available_licenses = db.Column(db.Integer, nullable=False)
    sold_licenses = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(200))
    min_stock = db.Column(db.Integer, default=5)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    total = db.Column(db.Float, nullable=False)

class TransactionDetail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)

if __name__ == '__main__':
    # Importar blueprints
    from auth import auth
    from games import games
    from cart import cart

    # Registrar blueprints
    app.register_blueprint(auth, url_prefix='/api')
    app.register_blueprint(games, url_prefix='/api')
    app.register_blueprint(cart, url_prefix='/api')

    # Crear todas las tablas
    with app.app_context():
        db.create_all()
        
        # Crear usuario admin si no existe
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            from werkzeug.security import generate_password_hash
            admin = User(
                name='Admin',
                email='admin@example.com',
                password=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            
    app.run(debug=True)