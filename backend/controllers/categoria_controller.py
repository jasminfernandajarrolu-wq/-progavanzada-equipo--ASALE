import sqlite3
from flask import Blueprint, request
from backend.models.categoria_model import CategoriaModel
from backend.views.response_view import success_response, error_response

categoria_bp = Blueprint("categorias", __name__, url_prefix="/categorias")

@categoria_bp.route("", methods=["GET"])
def get_categorias():
    categorias = CategoriaModel.get_all()
    return success_response(data=categorias, status_code=200)

@categoria_bp.route("/<int:categoria_id>", methods=["GET"])
def get_categoria(categoria_id):
    categoria = CategoriaModel.get_by_id(categoria_id)
    if not categoria:
        return error_response(message=f"Categoría con id {categoria_id} no encontrada", status_code=404)
    return success_response(data=categoria, status_code=200)

@categoria_bp.route("", methods=["POST"])
def create_categoria():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return error_response(message="El cuerpo de la solicitud debe ser un objeto JSON válido", status_code=400)

    nombre = data.get("nombre")
    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        return error_response(message="El campo 'nombre' es obligatorio y debe ser una cadena no vacía", status_code=400)

    nombre = nombre.strip()
    try:
        nueva_categoria = CategoriaModel.create(nombre)
        return success_response(data=nueva_categoria, message="Categoría creada exitosamente", status_code=201)
    except Exception as e:
        return error_response(message=f"Error inesperado al crear la categoría: {str(e)}", status_code=500)

@categoria_bp.route("/<int:categoria_id>", methods=["PUT"])
def update_categoria(categoria_id):
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return error_response(message="El cuerpo de la solicitud debe ser un objeto JSON válido", status_code=400)

    nombre = data.get("nombre")
    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        return error_response(message="El campo 'nombre' es obligatorio y debe ser una cadena no vacía", status_code=400)

    nombre = nombre.strip()
    categoria_existente = CategoriaModel.get_by_id(categoria_id)
    if not categoria_existente:
        return error_response(message=f"Categoría con id {categoria_id} no encontrada", status_code=404)

    try:
        categoria_actualizada = CategoriaModel.update(categoria_id, nombre)
        return success_response(data=categoria_actualizada, message="Categoría actualizada exitosamente", status_code=200)
    except Exception as e:
        return error_response(message=f"Error inesperado al actualizar la categoría: {str(e)}", status_code=500)

@categoria_bp.route("/<int:categoria_id>", methods=["DELETE"])
def delete_categoria(categoria_id):
    categoria_existente = CategoriaModel.get_by_id(categoria_id)
    if not categoria_existente:
        return error_response(message=f"Categoría con id {categoria_id} no encontrada", status_code=404)

    try:
        CategoriaModel.delete(categoria_id)
        return success_response(message=f"Categoría con id {categoria_id} eliminada exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(
            message=f"No se puede eliminar la categoría con id {categoria_id} porque tiene platos asociados",
            status_code=409
        )
    except Exception as e:
        return error_response(message=f"Error inesperado al eliminar la categoría: {str(e)}", status_code=500)
