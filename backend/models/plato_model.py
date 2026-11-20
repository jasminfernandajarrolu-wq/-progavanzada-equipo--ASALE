import sqlite3
import json
from backend.db import get_db_connection


class PlatoModel:
    @staticmethod
    def get_all(db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.nombre, p.precio, p.idCategoria,
                       c.nombre AS categoria_nombre,
                       p.imagen, p.ingredientes
                FROM Plato p
                LEFT JOIN Categoria c ON p.idCategoria = c.id
                ORDER BY p.id ASC;
            """)
            rows = cursor.fetchall()
            result = []
            for row in rows:
                d = dict(row)
                try:
                    d['ingredientes'] = json.loads(d['ingredientes'])
                except (json.JSONDecodeError, TypeError):
                    d['ingredientes'] = []
                result.append(d)
            return result
        finally:
            conn.close()

    @staticmethod
    def get_by_id(plato_id, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.id, p.nombre, p.precio, p.idCategoria,
                       c.nombre AS categoria_nombre,
                       p.imagen, p.ingredientes
                FROM Plato p
                LEFT JOIN Categoria c ON p.idCategoria = c.id
                WHERE p.id = ?;
            """, (plato_id,))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            try:
                d['ingredientes'] = json.loads(d['ingredientes'])
            except (json.JSONDecodeError, TypeError):
                d['ingredientes'] = []
            return d
        finally:
            conn.close()

    @staticmethod
    def create(nombre, precio, id_categoria, imagen='', ingredientes=None, db_path=None):
        if ingredientes is None:
            ingredientes = []
        if not isinstance(ingredientes, str):
            ingredientes = json.dumps(ingredientes, ensure_ascii=False)
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO Plato (nombre, precio, idCategoria, imagen, ingredientes) VALUES (?, ?, ?, ?, ?);",
                (nombre, float(precio), int(id_categoria), imagen, ingredientes)
            )
            conn.commit()
            return {
                "id": cursor.lastrowid,
                "nombre": nombre,
                "precio": float(precio),
                "idCategoria": int(id_categoria),
                "imagen": imagen,
                "ingredientes": json.loads(ingredientes)
            }
        finally:
            conn.close()

    @staticmethod
    def update(plato_id, nombre, precio, id_categoria, imagen=None, ingredientes=None, db_path=None):
        conn = get_db_connection(db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, imagen, ingredientes FROM Plato WHERE id = ?;", (plato_id,))
            existing = cursor.fetchone()
            if not existing:
                return None

            # Keep existing values when not provided
            new_imagen = imagen if imagen is not None else existing['imagen']
            if ingredientes is None:
                new_ingredientes = existing['ingredientes']
            elif isinstance(ingredientes, str):
                new_ingredientes = ingredientes
            else:
                new_ingredientes = json.dumps(ingredientes, ensure_ascii=False)

            cursor.execute(
                "UPDATE Plato SET nombre = ?, precio = ?, idCategoria = ?, imagen = ?, ingredientes = ? WHERE id = ?;",
                (nombre, float(precio), int(id_categoria), new_imagen, new_ingredientes, plato_id)
            )
            conn.commit()
            return {
                "id": plato_id,
                "nombre": nombre,
                "precio": float(precio),
                "idCategoria": int(id_categoria),
                "imagen": new_imagen,
                "ingredientes": json.loads(new_ingredientes) if isinstance(new_ingredientes, str) else new_ingredientes
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
