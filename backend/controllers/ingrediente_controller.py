import sqlite3
import unicodedata
from flask import Blueprint, request
from backend.models.ingrediente_model import IngredienteModel
from backend.models.plato_model import PlatoModel
from backend.views.response_view import success_response, error_response

ingrediente_bp = Blueprint("ingredientes", __name__, url_prefix="/ingredientes")


def _normalizar(texto):
    if not texto:
        return ""
    return unicodedata.normalize("NFD", str(texto).strip().lower()).encode("ascii", "ignore").decode("utf-8")


def _validar_payload_ingrediente(data):
    if not data or not isinstance(data, dict):
        return None, "El cuerpo de la solicitud debe ser un objeto JSON válido"

    nombre = data.get("nombre")
    unidad = data.get("unidad")
    stock = data.get("stock", 0)
    stock_minimo = data.get("stockMinimo", 0)
    precio_unitario = data.get("precioUnitario", 0)

    if not nombre or not isinstance(nombre, str) or not nombre.strip():
        return None, "El campo 'nombre' es obligatorio y debe ser una cadena no vacía"

    if not unidad or not isinstance(unidad, str) or not unidad.strip():
        return None, "El campo 'unidad' es obligatorio y debe ser una cadena no vacía (ej. kg, l, unid)"

    if stock is None or not isinstance(stock, (int, float)) or stock < 0:
        return None, "El campo 'stock' debe ser un número mayor o igual a 0"

    if stock_minimo is None or not isinstance(stock_minimo, (int, float)) or stock_minimo < 0:
        return None, "El campo 'stockMinimo' debe ser un número mayor o igual a 0"

    if precio_unitario is None or not isinstance(precio_unitario, (int, float)) or precio_unitario < 0:
        return None, "El campo 'precioUnitario' debe ser un número mayor o igual a 0"

    return {
        "nombre": nombre.strip(),
        "unidad": unidad.strip(),
        "stock": float(stock),
        "stockMinimo": float(stock_minimo),
        "precioUnitario": float(precio_unitario)
    }, None


@ingrediente_bp.route("", methods=["GET"])
def get_ingredientes():
    ingredientes = IngredienteModel.get_all()
    return success_response(data=ingredientes, status_code=200)


@ingrediente_bp.route("/<int:ingrediente_id>", methods=["GET"])
def get_ingrediente(ingrediente_id):
    ingrediente = IngredienteModel.get_by_id(ingrediente_id)
    if not ingrediente:
        return error_response(message=f"Ingrediente con id {ingrediente_id} no encontrado", status_code=404)
    return success_response(data=ingrediente, status_code=200)


@ingrediente_bp.route("", methods=["POST"])
def create_ingrediente():
    validados, err = _validar_payload_ingrediente(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    existente = IngredienteModel.get_by_nombre(validados["nombre"])
    if existente:
        return error_response(
            message=f"Ya existe un ingrediente con el nombre '{validados['nombre']}'",
            status_code=409
        )

    try:
        nuevo = IngredienteModel.create(
            nombre=validados["nombre"],
            unidad=validados["unidad"],
            stock=validados["stock"],
            stock_minimo=validados["stockMinimo"],
            precio_unitario=validados["precioUnitario"]
        )
        return success_response(data=nuevo, message="Ingrediente creado exitosamente", status_code=201)
    except sqlite3.IntegrityError:
        return error_response(
            message=f"Ya existe un ingrediente con el nombre '{validados['nombre']}'",
            status_code=409
        )
    except Exception as e:
        return error_response(message=f"Error inesperado al crear ingrediente: {str(e)}", status_code=500)


@ingrediente_bp.route("/<int:ingrediente_id>", methods=["PUT"])
def update_ingrediente(ingrediente_id):
    validados, err = _validar_payload_ingrediente(request.get_json(silent=True))
    if err:
        return error_response(message=err, status_code=400)

    ingrediente_actual = IngredienteModel.get_by_id(ingrediente_id)
    if not ingrediente_actual:
        return error_response(message=f"Ingrediente con id {ingrediente_id} no encontrado", status_code=404)

    # Verificar si el nombre ya lo usa otro ingrediente distinto
    con_mismo_nombre = IngredienteModel.get_by_nombre(validados["nombre"])
    if con_mismo_nombre and con_mismo_nombre["id"] != ingrediente_id:
        return error_response(
            message=f"Ya existe otro ingrediente con el nombre '{validados['nombre']}'",
            status_code=409
        )

    try:
        actualizado = IngredienteModel.update(
            ingrediente_id=ingrediente_id,
            nombre=validados["nombre"],
            unidad=validados["unidad"],
            stock=validados["stock"],
            stock_minimo=validados["stockMinimo"],
            precio_unitario=validados["precioUnitario"]
        )
        return success_response(data=actualizado, message="Ingrediente actualizado exitosamente", status_code=200)
    except sqlite3.IntegrityError:
        return error_response(
            message=f"Ya existe otro ingrediente con el nombre '{validados['nombre']}'",
            status_code=409
        )
    except Exception as e:
        return error_response(message=f"Error inesperado al actualizar ingrediente: {str(e)}", status_code=500)


@ingrediente_bp.route("/<int:ingrediente_id>", methods=["DELETE"])
def delete_ingrediente(ingrediente_id):
    ingrediente = IngredienteModel.get_by_id(ingrediente_id)
    if not ingrediente:
        return error_response(message=f"Ingrediente con id {ingrediente_id} no encontrado", status_code=404)

    # Regla: Antes de borrar un ingrediente, verificar si algún plato lo usa
    nombre_norm = _normalizar(ingrediente["nombre"])
    platos = PlatoModel.get_all()
    platos_usando = []
    for plato in platos:
        receta = plato.get("ingredientes") or []
        for item in receta:
            if isinstance(item, (list, tuple)) and len(item) > 0:
                item_nombre = item[0]
                if _normalizar(item_nombre) == nombre_norm:
                    platos_usando.append(plato["nombre"])
                    break

    if platos_usando:
        lista_platos = ", ".join(platos_usando)
        return error_response(
            message=f"No se puede eliminar el ingrediente '{ingrediente['nombre']}' porque está siendo utilizado en: {lista_platos}",
            status_code=409
        )

    try:
        IngredienteModel.delete(ingrediente_id)
        return success_response(
            message=f"Ingrediente con id {ingrediente_id} eliminado exitosamente",
            status_code=200
        )
    except Exception as e:
        return error_response(message=f"Error inesperado al eliminar ingrediente: {str(e)}", status_code=500)
