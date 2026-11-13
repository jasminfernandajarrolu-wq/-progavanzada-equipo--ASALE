import unittest
import os
import tempfile
from flask import Flask
from backend.config import Config
from backend.db import init_db, get_db_connection
from backend.controllers.reporte_controller import reporte_bp

class TestReportes(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        # Seed data
        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()

        # Categorias
        cursor.execute("INSERT INTO Categoria (nombre) VALUES ('Platos Fuertes');")
        self.cat_1 = cursor.lastrowid
        cursor.execute("INSERT INTO Categoria (nombre) VALUES ('Bebidas');")
        self.cat_2 = cursor.lastrowid

        # Usuarios con roles
        cursor.execute("INSERT INTO Usuario (nombre, correo, rol) VALUES ('Mesero Mario', 'mario@test.com', 'mesero');")
        self.user_1 = cursor.lastrowid
        cursor.execute("INSERT INTO Usuario (nombre, correo, rol) VALUES ('Cajero Luis', 'luis@test.com', 'cajero');")
        self.user_2 = cursor.lastrowid

        # Platos
        cursor.execute("INSERT INTO Plato (nombre, precio, idCategoria) VALUES ('Silpancho', 35.0, ?);", (self.cat_1,))
        self.plato_1 = cursor.lastrowid
        cursor.execute("INSERT INTO Plato (nombre, precio, idCategoria) VALUES ('Pique Macho', 50.0, ?);", (self.cat_1,))
        self.plato_2 = cursor.lastrowid

        # Pedidos: Usuario 1 registra:
        # - 2 x Silpancho (2 * 35 = 70)
        # - 1 x Pique Macho (1 * 50 = 50)
        # Total monto = 120.0, cantidad_pedidos = 2
        cursor.execute("INSERT INTO Pedido (idUsuario, idPlato, cantidad) VALUES (?, ?, 2);", (self.user_1, self.plato_1))
        cursor.execute("INSERT INTO Pedido (idUsuario, idPlato, cantidad) VALUES (?, ?, 1);", (self.user_1, self.plato_2))

        conn.commit()
        conn.close()

        self.app = Flask(__name__)
        self.app.register_blueprint(reporte_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_reporte_pedidos_por_usuario(self):
        res = self.client.get("/reportes/pedidos-por-usuario")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["datos"]
        self.assertEqual(len(data), 2)

        # Usuario 1: 2 pedidos, total 120.0
        u1 = next(item for item in data if item["idUsuario"] == self.user_1)
        self.assertEqual(u1["cantidad_pedidos"], 2)
        self.assertEqual(u1["monto_total"], 120.0)
        self.assertEqual(u1["rol"], "mesero")

        # Usuario 2: 0 pedidos, total 0.0
        u2 = next(item for item in data if item["idUsuario"] == self.user_2)
        self.assertEqual(u2["cantidad_pedidos"], 0)
        self.assertEqual(u2["monto_total"], 0.0)
        self.assertEqual(u2["rol"], "cajero")

    def test_reporte_platos_por_categoria(self):
        res = self.client.get("/reportes/platos-por-categoria")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["datos"]
        self.assertEqual(len(data), 2)

        # Categoria 1: 2 platos
        c1 = next(item for item in data if item["idCategoria"] == self.cat_1)
        self.assertEqual(c1["cantidad_platos"], 2)
        self.assertEqual(len(c1["platos"]), 2)
        nombres = [p["nombre"] for p in c1["platos"]]
        self.assertIn("Silpancho", nombres)
        self.assertIn("Pique Macho", nombres)

        # Categoria 2: 0 platos
        c2 = next(item for item in data if item["idCategoria"] == self.cat_2)
        self.assertEqual(c2["cantidad_platos"], 0)
        self.assertEqual(len(c2["platos"]), 0)

if __name__ == "__main__":
    unittest.main()
