import sqlite3
from backend.db import get_db_connection

class PedidoModel:
    @staticmethod
    def get_all(db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.idUsuario, u.nombre AS usuario_nombre, u.correo AS usuario_correo, u.rol AS usuario_rol,
                       p.idPlato, pl.nombre AS plato_nombre, pl.precio AS plato_precio, pl.idCategoria,
                       p.cantidad, ROUND(p.cantidad * pl.precio, 2) AS subtotal
                FROM Pedido p
                LEFT JOIN Usuario u ON p.idUsuario = u.id
                LEFT JOIN Plato pl ON p.idPlato = pl.id
                ORDER BY p.id ASC;
            """)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(pedido_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.idUsuario, u.nombre AS usuario_nombre, u.correo AS usuario_correo, u.rol AS usuario_rol,
                       p.idPlato, pl.nombre AS plato_nombre, pl.precio AS plato_precio, pl.idCategoria,
                       p.cantidad, ROUND(p.cantidad * pl.precio, 2) AS subtotal
                FROM Pedido p
                LEFT JOIN Usuario u ON p.idUsuario = u.id
                LEFT JOIN Plato pl ON p.idPlato = pl.id
                WHERE p.id = ?;
            """, (pedido_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def create(id_usuario, id_plato, cantidad=1, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO Pedido (idUsuario, idPlato, cantidad) VALUES (?, ?, ?);",
                (int(id_usuario), int(id_plato), int(cantidad))
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "idUsuario": int(id_usuario),
                "idPlato": int(id_plato),
                "cantidad": int(cantidad)
            }
        finally:
            conn.close()

    @staticmethod
    def update(pedido_id, id_usuario, id_plato, cantidad, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Pedido WHERE id = ?;", (pedido_id,))
            if not cursor.fetchone():
                return None
            cursor.execute(
                "UPDATE Pedido SET idUsuario = ?, idPlato = ?, cantidad = ? WHERE id = ?;",
                (int(id_usuario), int(id_plato), int(cantidad), pedido_id)
            )
            conn.commit()
            return {
                "id": pedido_id,
                "idUsuario": int(id_usuario),
                "idPlato": int(id_plato),
                "cantidad": int(cantidad)
            }
        finally:
            conn.close()

    @staticmethod
    def delete(pedido_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Pedido WHERE id = ?;", (pedido_id,))
            if not cursor.fetchone():
                return False
            cursor.execute("DELETE FROM Pedido WHERE id = ?;", (pedido_id,))
            conn.commit()
            return True
        finally:
            conn.close()
