import sqlite3
from flask import Blueprint, request
from backend.models.usuario_model import UsuarioModel, ROLES_PERMITIDOS
from backend.views.response_view import success_response, error_response

usuario_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

def _validar_payload_usuario(data):
    if not data or not isinstance(data, dict):
        return None, "El cuerpo de la solicitud debe ser un objeto JSON válido"

    nombre = data.get("nombre")
    correo = data.get("correo")
    rol = data.get("rol")

    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        return None, "El campo 'nombre' es obligatorio y debe ser una cadena no vacía"
    if not correo or not isinstance(correo, str) or not correo.strip():
        return None, "El campo 'correo' es obligatorio y debe ser una cadena no vacía"
    if not rol or not isinstance(rol, str) or not rol.strip():
        return None, f"El campo 'rol' es obligatorio. Roles válidos: {', '.join(ROLES_PERMITIDOS)}"

    rol = rol.strip().lower()
    if rol not in ROLES_PERMITIDOS:
        return None, f"El rol '{rol}' no es válido. Los roles permitidos son: {', '.join(ROLES_PERMITIDOS)}"

    return {
        "nombre": nombre.strip(),
        "correo": correo.strip().lower(),
        "rol": rol
    }, None

@usuario_bp.route("", methods=["GET"])
def get_usuarios():
    usuarios = UsuarioModel.get_all()
    return success_response(data=usuarios, status_code=200)

@usuario_bp.route("/<int:user_id>", methods=["GET"])
def get_usuario(user_id):
    usuario = UsuarioModel.get_by_id(user_id)
    if not usuario:
        return error_response(message=f"Usuario con id {user_id} no encontrado", status_code=404)
    return success_response(data=usuario, status_code=200)

@usuario_bp.route("", methods=["POST"])
def create_usuario():
    validados, err = _validar_payload_usuario(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    try:
        nuevo_usuario = UsuarioModel.create(
            nombre=validados["nombre"],
            correo=validados["correo"],
            rol=validados["rol"]
        )
        return success_response(data=nuevo_usuario, message="Usuario creado exitosamente", status_code=201)
    except sqlite3.IntegrityError:
        return error_response(message=f"El correo '{validados['correo']}' ya se encuentra registrado", status_code=409)
    except Exception as e:
        return error_response(message=f"Error inesperado al crear el usuario: {str(e)}", status_code=500)

@usuario_bp.route("/<int:user_id>", methods=["PUT"])
def update_usuario(user_id):
    validados, err = _validar_payload_usuario(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    usuario_existente = UsuarioModel.get_by_id(user_id)
    if not usuario_existente:
        return error_response(message=f"Usuario con id {user_id} no encontrado", status_code=404)

    try:
        usuario_actualizado = UsuarioModel.update(
            user_id=user_id,
            nombre=validados["nombre"],
            correo=validados["correo"],
            rol=validados["rol"]
        )
        return success_response(data=usuario_actualizado, message="Usuario actualizado exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(message=f"El correo '{validados['correo']}' ya está en uso por otro usuario", status_code=409)
    except Exception as e:
        return error_response(message=f"Error inesperado al actualizar usuario: {str(e)}", status_code=500)

@usuario_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_usuario(user_id):
    usuario_existente = UsuarioModel.get_by_id(user_id)
    if not usuario_existente:
        return error_response(message=f"Usuario con id {user_id} no encontrado", status_code=404)

    try:
        UsuarioModel.delete(user_id)
        return success_response(message=f"Usuario con id {user_id} eliminado exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(
            message=f"No se puede eliminar el usuario con id {user_id} porque tiene pedidos asociados",
            status_code=409
        )
    except Exception as e:
        return error_response(message=f"Error inesperado al eliminar usuario: {str(e)}", status_code=500)
