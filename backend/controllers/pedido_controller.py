import sqlite3
from flask import Blueprint, request
from backend.models.pedido_model import PedidoModel
from backend.models.usuario_model import UsuarioModel
from backend.models.plato_model import PlatoModel
from backend.views.response_view import success_response, error_response

pedido_bp = Blueprint("pedidos", __name__, url_prefix="/pedidos")

def _validar_payload_pedido(data):
    if not data or not isinstance(data, dict):
        return None, "El cuerpo de la solicitud debe ser un objeto JSON válido"

    id_usuario = data.get("idUsuario")
    id_plato = data.get("idPlato")
    cantidad = data.get("cantidad", 1)

    if id_usuario is None or not isinstance(id_usuario, int) or id_usuario <= 0:
        return None, "El campo 'idUsuario' es obligatorio y debe ser un entero positivo"

    if id_plato is None or not isinstance(id_plato, int) or id_plato <= 0:
        return None, "El campo 'idPlato' es obligatorio y debe ser un entero positivo"

    if cantidad is None or not isinstance(cantidad, int) or cantidad <= 0:
        return None, "El campo 'cantidad' debe ser un número entero mayor a 0"

    return {
        "idUsuario": int(id_usuario),
        "idPlato": int(id_plato),
        "cantidad": int(cantidad)
    }, None

@pedido_bp.route("", methods=["GET"])
def get_pedidos():
    pedidos = PedidoModel.get_all()
    return success_response(data=pedidos, status_code=200)

@pedido_bp.route("/<int:pedido_id>", methods=["GET"])
def get_pedido(pedido_id):
    pedido = PedidoModel.get_by_id(pedido_id)
    if not pedido:
        return error_response(message=f"Pedido con id {pedido_id} no encontrado", status_code=404)
    return success_response(data=pedido, status_code=200)

@pedido_bp.route("", methods=["POST"])
def create_pedido():
    validados, err = _validar_payload_pedido(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    # Validar existencia de usuario y plato
    usuario = UsuarioModel.get_by_id(validados["idUsuario"])
    if not usuario:
        return error_response(message=f"El usuario con id {validados['idUsuario']} no existe", status_code=404)

    plato = PlatoModel.get_by_id(validados["idPlato"])
    if not plato:
        return error_response(message=f"El plato con id {validados['idPlato']} no existe", status_code=404)

    try:
        nuevo_pedido = PedidoModel.create(
            id_usuario=validados["idUsuario"],
            id_plato=validados["idPlato"],
            cantidad=validados["cantidad"]
        )
        return success_response(data=nuevo_pedido, message="Pedido registrado exitosamente", status_code=201)
    except sqlite3.IntegrityError:
        return error_response(message="Conflicto de integridad referencial al registrar el pedido", status_code=409)
    except Exception as e:
        return error_response(message=f"Error inesperado al crear el pedido: {str(e)}", status_code=500)

@pedido_bp.route("/<int:pedido_id>", methods=["PUT"])
def update_pedido(pedido_id):
    validados, err = _validar_payload_pedido(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    pedido_existente = PedidoModel.get_by_id(pedido_id)
    if not pedido_existente:
        return error_response(message=f"Pedido con id {pedido_id} no encontrado", status_code=404)

    usuario = UsuarioModel.get_by_id(validados["idUsuario"])
    if not usuario:
        return error_response(message=f"El usuario con id {validados['idUsuario']} no existe", status_code=404)

    plato = PlatoModel.get_by_id(validados["idPlato"])
    if not plato:
        return error_response(message=f"El plato con id {validados['idPlato']} no existe", status_code=404)

    try:
        pedido_actualizado = PedidoModel.update(
            pedido_id=pedido_id,
            id_usuario=validados["idUsuario"],
            id_plato=validados["idPlato"],
            cantidad=validados["cantidad"]
        )
        return success_response(data=pedido_actualizado, message="Pedido actualizado exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(message="Conflicto de integridad referencial al actualizar el pedido", status_code=409)
    except Exception as e:
        return error_response(message=f"Error inesperado al actualizar el pedido: {str(e)}", status_code=500)

@pedido_bp.route("/<int:pedido_id>", methods=["DELETE"])
def delete_pedido(pedido_id):
    pedido_existente = PedidoModel.get_by_id(pedido_id)
    if not pedido_existente:
        return error_response(message=f"Pedido con id {pedido_id} no encontrado", status_code=404)

    try:
        PedidoModel.delete(pedido_id)
        return success_response(message=f"Pedido con id {pedido_id} eliminado exitosamente", status_code=200)
    except Exception as e:
        return error_response(message=f"Error inesperado al eliminar el pedido: {str(e)}", status_code=500)
