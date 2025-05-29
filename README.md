# Game Store

Una aplicación web para la venta de licencias de juegos, desarrollada con React y Flask.

## Características

- Registro e inicio de sesión de usuarios
- Lista de juegos disponibles con filtros y ordenamiento
- Detalles de juegos
- Carrito de compras con descuentos por volumen
- Historial de compras
- Panel de administración para gestionar juegos

## Requisitos

- Python 3.8+
- Node.js 14+
- npm o yarn

## Instalación

### Backend (Flask)

1. Crear un entorno virtual:
```bash
cd server
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
Crear un archivo `.env` en el directorio `server` con:
```
JWT_SECRET_KEY=tu_clave_secreta
```

4. Iniciar el servidor:
```bash
python app.py
```

### Frontend (React)

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar la aplicación:
```bash
npm start
```

## Uso

1. Acceder a `http://localhost:3000`
2. Registrarse o iniciar sesión
3. Explorar la lista de juegos
4. Agregar juegos al carrito
5. Realizar la compra

## Estructura del Proyecto

```
.
├── server/                 # Backend Flask
│   ├── app.py             # Aplicación principal
│   ├── auth.py            # Autenticación
│   ├── games.py           # Gestión de juegos
│   ├── cart.py            # Carrito y transacciones
│   └── requirements.txt   # Dependencias Python
│
└── src/                   # Frontend React
    ├── components/        # Componentes React
    ├── App.js            # Componente principal
    └── index.js          # Punto de entrada
```

## API Endpoints

### Autenticación
- POST `/api/register` - Registro de usuarios
- POST `/api/login` - Inicio de sesión

### Juegos
- GET `/api/games` - Lista de juegos
- GET `/api/games/<id>` - Detalles de un juego
- POST `/api/games` - Crear juego (admin)
- PUT `/api/games/<id>` - Actualizar juego (admin)

### Carrito
- POST `/api/cart/calculate` - Calcular totales
- POST `/api/cart/checkout` - Realizar compra
- GET `/api/transactions` - Historial de compras

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request
