import os
from flask import Flask
from flask_cors import CORS
from backend.config import Config
from backend.db import init_db
from backend.views.response_view import success_response, error_response
from backend.controllers.usuario_controller import usuario_bp
from backend.controllers.categoria_controller import categoria_bp
from backend.controllers.plato_controller import plato_bp
from backend.controllers.pedido_controller import pedido_bp
from backend.controllers.reporte_controller import reporte_bp
from backend.controllers.ingrediente_controller import ingrediente_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar Base de Datos SQLite con nuevo esquema
    db_path = app.config.get("DATABASE_PATH")
    if db_path != ":memory:":
        init_db(db_path)

    # Configurar CORS para permitir peticiones desde el frontend (React, Vite, etc.)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Registrar Blueprints (Controladores)
    app.register_blueprint(usuario_bp)
    app.register_blueprint(categoria_bp)
    app.register_blueprint(plato_bp)
    app.register_blueprint(pedido_bp)
    app.register_blueprint(reporte_bp)
    app.register_blueprint(ingrediente_bp)

    # Ruta raíz informativa
    @app.route("/", methods=["GET"])
    def index():
        return success_response(
            data={
                "api": "API REST - Restaurante Sabores Bolivianos",
                "version": "2.0.0",
                "endpoints": {
                    "usuarios": "/usuarios",
                    "categorias": "/categorias",
                    "platos": "/platos",
                    "ingredientes": "/ingredientes",
                    "pedidos": "/pedidos",
                    "reporte_pedidos": "/reportes/pedidos-por-usuario",
                    "reporte_platos": "/reportes/platos-por-categoria"
                }
            },
            message="Bienvenido al sistema gastronómico Sabores Bolivianos",
            status_code=200
        )

    # Manejo de rutas inexistentes (404)
    @app.errorhandler(404)
    def not_found(e):
        return error_response(message="La ruta solicitada no fue encontrada", status_code=404)

    # Manejo de métodos no permitidos (405)
    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response(message="Método HTTP no permitido para esta ruta", status_code=405)

    # Manejo de errores internos (500)
    @app.errorhandler(500)
    def internal_error(e):
        return error_response(message="Error interno del servidor", status_code=500)

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
