import sqlite3
from backend.db import get_db_connection

class PlatoModel:
    @staticmethod
    def get_all(db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.nombre, p.precio, p.idCategoria, c.nombre AS categoria_nombre
                FROM Plato p
                LEFT JOIN Categoria c ON p.idCategoria = c.id
                ORDER BY p.id ASC;
            """)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(plato_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.nombre, p.precio, p.idCategoria, c.nombre AS categoria_nombre
                FROM Plato p
                LEFT JOIN Categoria c ON p.idCategoria = c.id
                WHERE p.id = ?;
            """, (plato_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def create(nombre, precio, id_categoria, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO Plato (nombre, precio, idCategoria) VALUES (?, ?, ?);",
                (nombre, float(precio), int(id_categoria))
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "nombre": nombre,
                "precio": float(precio),
                "idCategoria": int(id_categoria)
            }
        finally:
            conn.close()

    @staticmethod
    def update(plato_id, nombre, precio, id_categoria, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Plato WHERE id = ?;", (plato_id,))
            if not cursor.fetchone():
                return None
            cursor.execute(
                "UPDATE Plato SET nombre = ?, precio = ?, idCategoria = ? WHERE id = ?;",
                (nombre, float(precio), int(id_categoria), plato_id)
            )
            conn.commit()
            return {
                "id": plato_id,
                "nombre": nombre,
                "precio": float(precio),
                "idCategoria": int(id_categoria)
            }
        finally:
            conn.close()

    @staticmethod
    def delete(plato_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Plato WHERE id = ?;", (plato_id,))
            if not cursor.fetchone():
                return False
            cursor.execute("DELETE FROM Plato WHERE id = ?;", (plato_id,))
            conn.commit()
            return True
        finally:
            conn.close()
