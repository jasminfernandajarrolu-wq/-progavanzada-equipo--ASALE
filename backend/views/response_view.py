from flask import jsonify

def success_response(data=None, message=None, status_code=200):
    payload = {}
    if message is not None:
        payload["mensaje"] = message
    if data is not None:
        payload["datos"] = data
    return jsonify(payload), status_code

def error_response(message="Error en la solicitud", status_code=400, details=None):
    payload = {
        "error": message,
        "codigo": status_code
    }
    if details is not None:
        payload["detalles"] = details
    return jsonify(payload), status_code
