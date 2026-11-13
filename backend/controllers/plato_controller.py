import sqlite3
from flask import Blueprint, request
from backend.models.plato_model import PlatoModel
from backend.models.categoria_model import CategoriaModel
from backend.views.response_view import success_response, error_response

plato_bp = Blueprint("platos", __name__, url_prefix="/platos")

def _validar_payload_plato(data):
    if not data or not isinstance(data, dict):
        return None, "El cuerpo de la solicitud debe ser un objeto JSON válido"

    nombre = data.get("nombre")
    precio = data.get("precio")
    id_categoria = data.get("idCategoria")

    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        return None, "El campo 'nombre' es obligatorio y debe ser una cadena no vacía"

    if precio is None or not isinstance(precio, (int, float)) or precio <= 0:
        return None, "El campo 'precio' es obligatorio y debe ser un número positivo mayor a 0"

    if id_categoria is None or not isinstance(id_categoria, int) or id_categoria <= 0:
        return None, "El campo 'idCategoria' es obligatorio y debe ser un entero positivo"

    return {
        "nombre": nombre.strip(),
        "precio": float(precio),
        "idCategoria": int(id_categoria)
    }, None

@plato_bp.route("", methods=["GET"])
def get_platos():
    platos = PlatoModel.get_all()
    return success_response(data=platos, status_code=200)

@plato_bp.route("/<int:plato_id>", methods=["GET"])
def get_plato(plato_id):
    plato = PlatoModel.get_by_id(plato_id)
    if not plato:
        return error_response(message=f"Plato con id {plato_id} no encontrado", status_code=404)
    return success_response(data=plato, status_code=200)

@plato_bp.route("", methods=["POST"])
def create_plato():
    validados, err = _validar_payload_plato(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    # Validar que la categoría exista
    categoria = CategoriaModel.get_by_id(validados["idCategoria"])
    if not categoria:
        return error_response(message=f"La categoría con id {validados['idCategoria']} no existe", status_code=404)

    try:
        nuevo_plato = PlatoModel.create(
            nombre=validados["nombre"],
            precio=validados["precio"],
            id_categoria=validados["idCategoria"]
        )
        return success_response(data=nuevo_plato, message="Plato creado exitosamente", status_code=201)
    except sqlite3.IntegrityError:
        return error_response(message="Conflicto de integridad al asociar la categoría del plato", status_code=409)
    except Exception as e:
        return error_response(message=f"Error inesperado al crear el plato: {str(e)}", status_code=500)

@plato_bp.route("/<int:plato_id>", methods=["PUT"])
def update_plato(plato_id):
    validados, err = _validar_payload_plato(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    plato_existente = PlatoModel.get_by_id(plato_id)
    if not plato_existente:
        return error_response(message=f"Plato con id {plato_id} no encontrado", status_code=404)

    categoria = CategoriaModel.get_by_id(validados["idCategoria"])
    if not categoria:
        return error_response(message=f"La categoría con id {validados['idCategoria']} no existe", status_code=404)

    try:
        plato_actualizado = PlatoModel.update(
            plato_id=plato_id,
            nombre=validados["nombre"],
            precio=validados["precio"],
            id_categoria=validados["idCategoria"]
        )
        return success_response(data=plato_actualizado, message="Plato actualizado exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(message="Conflicto de integridad al asociar la categoría del plato", status_code=409)
    except Exception as e:
        return error_response(message=f"Error inesperado al actualizar el plato: {str(e)}", status_code=500)

@plato_bp.route("/<int:plato_id>", methods=["DELETE"])
def delete_plato(plato_id):
    plato_existente = PlatoModel.get_by_id(plato_id)
    if not plato_existente:
        return error_response(message=f"Plato con id {plato_id} no encontrado", status_code=404)

    try:
        PlatoModel.delete(plato_id)
        return success_response(message=f"Plato con id {plato_id} eliminado exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(
            message=f"No se puede eliminar el plato con id {plato_id} porque tiene pedidos asociados",
            status_code=409
        )
    except Exception as e:
        return error_response(message=f"Error inesperado al eliminar el plato: {str(e)}", status_code=500)
