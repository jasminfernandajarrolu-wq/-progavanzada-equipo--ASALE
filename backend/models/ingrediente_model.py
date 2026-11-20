import sqlite3
from backend.db import get_db_connection


class IngredienteModel:
    @staticmethod
    def get_all(db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, nombre, unidad, stock, stockMinimo, precioUnitario
                FROM Ingrediente
                ORDER BY id ASC;
            """)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    @staticmethod
    def get_by_id(ingrediente_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, nombre, unidad, stock, stockMinimo, precioUnitario
                FROM Ingrediente
                WHERE id = ?;
            """, (ingrediente_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def get_by_nombre(nombre, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, nombre, unidad, stock, stockMinimo, precioUnitario
                FROM Ingrediente
                WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?));
            """, (nombre,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def create(nombre, unidad, stock=0.0, stock_minimo=0.0, precio_unitario=0.0, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO Ingrediente (nombre, unidad, stock, stockMinimo, precioUnitario)
                   VALUES (?, ?, ?, ?, ?);""",
                (nombre.strip(), unidad.strip(), float(stock), float(stock_minimo), float(precio_unitario))
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "nombre": nombre.strip(),
                "unidad": unidad.strip(),
                "stock": float(stock),
                "stockMinimo": float(stock_minimo),
                "precioUnitario": float(precio_unitario)
            }
        finally:
            conn.close()

    @staticmethod
    def update(ingrediente_id, nombre, unidad, stock, stock_minimo, precio_unitario, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Ingrediente WHERE id = ?;", (ingrediente_id,))
            if not cursor.fetchone():
                return None

            cursor.execute(
                """UPDATE Ingrediente
                   SET nombre = ?, unidad = ?, stock = ?, stockMinimo = ?, precioUnitario = ?
                   WHERE id = ?;""",
                (nombre.strip(), unidad.strip(), float(stock), float(stock_minimo), float(precio_unitario), ingrediente_id)
            )
            conn.commit()
            return {
                "id": ingrediente_id,
                "nombre": nombre.strip(),
                "unidad": unidad.strip(),
                "stock": float(stock),
                "stockMinimo": float(stock_minimo),
                "precioUnitario": float(precio_unitario)
            }
        finally:
            conn.close()

    @staticmethod
    def delete(ingrediente_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM Ingrediente WHERE id = ?;", (ingrediente_id,))
            if not cursor.fetchone():
                return False
            cursor.execute("DELETE FROM Ingrediente WHERE id = ?;", (ingrediente_id,))
            conn.commit()
            return True
        finally:
            conn.close()
