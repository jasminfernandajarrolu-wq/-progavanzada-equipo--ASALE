import unittest
import sqlite3
from backend.db import get_db_connection, init_db

class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.conn = get_db_connection(":memory:")
        init_db(conn=self.conn)

    def tearDown(self):
        self.conn.close()

    def test_tables_created(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row["name"] for row in cursor.fetchall()]
        self.assertIn("Usuario", tables)
        self.assertIn("Categoria", tables)
        self.assertIn("Plato", tables)
        self.assertIn("Pedido", tables)

    def test_foreign_keys_pragma_enabled(self):
        cursor = self.conn.cursor()
        cursor.execute("PRAGMA foreign_keys;")
        row = cursor.fetchone()
        self.assertEqual(row[0], 1)

    def test_foreign_key_constraint_enforced(self):
        cursor = self.conn.cursor()
        with self.assertRaises(sqlite3.IntegrityError):
            cursor.execute(
                "INSERT INTO Plato (nombre, precio, idCategoria) VALUES (?, ?, ?);",
                ("Plato Inválido", 25.0, 999)
            )

    def test_rol_check_constraint(self):
        cursor = self.conn.cursor()
        # Invalid role should fail
        with self.assertRaises(sqlite3.IntegrityError):
            cursor.execute(
                "INSERT INTO Usuario (nombre, correo, rol) VALUES (?, ?, ?);",
                ("Invalido", "inv@test.com", "cliente")
            )

        # Valid role should pass
        cursor.execute(
            "INSERT INTO Usuario (nombre, correo, rol) VALUES (?, ?, ?);",
            ("Valido", "val@test.com", "mesero")
        )
        self.conn.commit()

if __name__ == "__main__":
    unittest.main()
