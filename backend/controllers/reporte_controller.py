import sqlite3
from flask import Blueprint
from backend.db import get_db_connection
from backend.views.response_view import success_response, error_response

reporte_bp = Blueprint("reportes", __name__, url_prefix="/reportes")

@reporte_bp.route("/pedidos-por-usuario", methods=["GET"])
def get_pedidos_por_usuario():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id AS idUsuario,
                   u.nombre,
                   u.correo,
                   u.rol,
                   COUNT(ped.id) AS cantidad_pedidos,
                   ROUND(COALESCE(SUM(pl.precio * ped.cantidad), 0.0), 2) AS monto_total
            FROM Usuario u
            LEFT JOIN Pedido ped ON u.id = ped.idUsuario
            LEFT JOIN Plato pl ON ped.idPlato = pl.id
            GROUP BY u.id, u.nombre, u.correo, u.rol
            ORDER BY u.id ASC;
        """)
        rows = cursor.fetchall()
        reporte = [
            {
                "idUsuario": row["idUsuario"],
                "nombre": row["nombre"],
                "correo": row["correo"],
                "rol": row["rol"],
                "cantidad_pedidos": int(row["cantidad_pedidos"]),
                "monto_total": float(row["monto_total"])
            }
            for row in rows
        ]
        return success_response(data=reporte, status_code=200)
    except Exception as e:
        return error_response(message=f"Error al generar reporte de pedidos por usuario: {str(e)}", status_code=500)
    finally:
        conn.close()

@reporte_bp.route("/platos-por-categoria", methods=["GET"])
def get_platos_por_categoria():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.id AS idCategoria,
                   c.nombre AS nombre_categoria,
                   pl.id AS plato_id,
                   pl.nombre AS plato_nombre,
                   pl.precio AS plato_precio
            FROM Categoria c
            LEFT JOIN Plato pl ON c.id = pl.idCategoria
            ORDER BY c.id ASC, pl.id ASC;
        """)
        rows = cursor.fetchall()

        categorias_map = {}
        for row in rows:
            id_cat = row["idCategoria"]
            if id_cat not in categorias_map:
                categorias_map[id_cat] = {
                    "idCategoria": id_cat,
                    "nombre_categoria": row["nombre_categoria"],
                    "cantidad_platos": 0,
                    "platos": []
                }
            if row["plato_id"] is not None:
                categorias_map[id_cat]["platos"].append({
                    "id": row["plato_id"],
                    "nombre": row["plato_nombre"],
                    "precio": float(row["plato_precio"])
                })

        reporte = []
        for cat in categorias_map.values():
            cat["cantidad_platos"] = len(cat["platos"])
            reporte.append(cat)

        return success_response(data=reporte, status_code=200)
    except Exception as e:
        return error_response(message=f"Error al generar reporte de platos por categoría: {str(e)}", status_code=500)
    finally:
        conn.close()
