import sqlite3
from backend.db import get_db_connection

ROLES_PERMITIDOS = ("administrador", "mesero", "cajero")

class UsuarioModel:
    @staticmethod
    def get_all(db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre, correo, rol FROM Usuario ORDER BY id ASC;")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(user_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre, correo, rol FROM Usuario WHERE id = ?;", (user_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def get_by_correo(correo, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, nombre, correo, rol FROM Usuario WHERE correo = ?;", (correo,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def create(nombre, correo, rol, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO Usuario (nombre, correo, rol) VALUES (?, ?, ?);",
                (nombre, correo, rol)
            )
            conn.commit()
            new_id = cursor.lastrowid
            return {"id": new_id, "nombre": nombre, "correo": correo, "rol": rol}
        finally:
            conn.close()

    @staticmethod
    def update(user_id, nombre, correo, rol, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Usuario WHERE id = ?;", (user_id,))
            if not cursor.fetchone():
                return None
            cursor.execute(
                "UPDATE Usuario SET nombre = ?, correo = ?, rol = ? WHERE id = ?;",
                (nombre, correo, rol, user_id)
            )
            conn.commit()
            return {"id": user_id, "nombre": nombre, "correo": correo, "rol": rol}
        finally:
            conn.close()

    @staticmethod
    def delete(user_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Usuario WHERE id = ?;", (user_id,))
            if not cursor.fetchone():
                return False
            cursor.execute("DELETE FROM Usuario WHERE id = ?;", (user_id,))
            conn.commit()
            return True
        finally:
            conn.close()
