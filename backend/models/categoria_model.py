import sqlite3
from backend.db import get_db_connection

class CategoriaModel:
    @staticmethod
    def get_all(db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre FROM Categoria ORDER BY id ASC;")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(categoria_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre FROM Categoria WHERE id = ?;", (categoria_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def create(nombre, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO Categoria (nombre) VALUES (?);", (nombre,))
            conn.commit()
            return {"id": cursor.lastrowid, "nombre": nombre}
        finally:
            conn.close()

    @staticmethod
    def update(categoria_id, nombre, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Categoria WHERE id = ?;", (categoria_id,))
            if not cursor.fetchone():
                return None
            cursor.execute("UPDATE Categoria SET nombre = ? WHERE id = ?;", (nombre, categoria_id))
            conn.commit()
            return {"id": categoria_id, "nombre": nombre}
        finally:
            conn.close()

    @staticmethod
    def delete(categoria_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Categoria WHERE id = ?;", (categoria_id,))
            if not cursor.fetchone():
                return False
            cursor.execute("DELETE FROM Categoria WHERE id = ?;", (categoria_id,))
            conn.commit()
            return True
        finally:
            conn.close()
