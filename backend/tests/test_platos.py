import unittest
import os
import tempfile
from flask import Flask
from backend.config import Config
from backend.db import init_db, get_db_connection
from backend.controllers.plato_controller import plato_bp

class TestPlatos(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        # Seed categoria
        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Categoria (nombre) VALUES ('Platos Típicos');")
        self.categoria_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.app = Flask(__name__)
        self.app.register_blueprint(plato_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_create_plato_success(self):
        res = self.client.post("/platos", json={
            "nombre": "Silpancho Cochabambino",
            "precio": 35.50,
            "idCategoria": self.categoria_id
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()["datos"]
        self.assertEqual(data["nombre"], "Silpancho Cochabambino")
        self.assertEqual(data["precio"], 35.50)
        self.assertEqual(data["idCategoria"], self.categoria_id)

    def test_create_plato_invalid_price_returns_400(self):
        res = self.client.post("/platos", json={
            "nombre": "Sopa de Maní",
            "precio": -5.0,
            "idCategoria": self.categoria_id
        })
        self.assertEqual(res.status_code, 400)

        res2 = self.client.post("/platos", json={
            "nombre": "Sopa de Maní",
            "precio": "gratis",
            "idCategoria": self.categoria_id
        })
        self.assertEqual(res2.status_code, 400)

    def test_create_plato_missing_fields_returns_400(self):
        res = self.client.post("/platos", json={"nombre": "Solo Nombre"})
        self.assertEqual(res.status_code, 400)

    def test_create_plato_categoria_not_found_returns_404(self):
        res = self.client.post("/platos", json={
            "nombre": "Pique Macho",
            "precio": 50.0,
            "idCategoria": 9999
        })
        self.assertEqual(res.status_code, 404)

    def test_get_platos_list(self):
        self.client.post("/platos", json={"nombre": "P1", "precio": 20.0, "idCategoria": self.categoria_id})
        self.client.post("/platos", json={"nombre": "P2", "precio": 25.0, "idCategoria": self.categoria_id})
        res = self.client.get("/platos")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()["datos"]), 2)

    def test_get_plato_by_id(self):
        post_res = self.client.post("/platos", json={"nombre": "Majadito", "precio": 30.0, "idCategoria": self.categoria_id})
        plato_id = post_res.get_json()["datos"]["id"]

        res = self.client.get(f"/platos/{plato_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["nombre"], "Majadito")

    def test_get_plato_not_found_returns_404(self):
        res = self.client.get("/platos/9999")
        self.assertEqual(res.status_code, 404)

    def test_update_plato_success(self):
        post_res = self.client.post("/platos", json={"nombre": "Saice", "precio": 25.0, "idCategoria": self.categoria_id})
        plato_id = post_res.get_json()["datos"]["id"]

        res = self.client.put(f"/platos/{plato_id}", json={"nombre": "Saice Tarijeño", "precio": 28.0, "idCategoria": self.categoria_id})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["nombre"], "Saice Tarijeño")
        self.assertEqual(res.get_json()["datos"]["precio"], 28.0)

    def test_update_plato_not_found_returns_404(self):
        res = self.client.put("/platos/9999", json={"nombre": "X", "precio": 10.0, "idCategoria": self.categoria_id})
        self.assertEqual(res.status_code, 404)

    def test_delete_plato_success(self):
        post_res = self.client.post("/platos", json={"nombre": "Borrar", "precio": 15.0, "idCategoria": self.categoria_id})
        plato_id = post_res.get_json()["datos"]["id"]

        res = self.client.delete(f"/platos/{plato_id}")
        self.assertEqual(res.status_code, 200)

        get_res = self.client.get(f"/platos/{plato_id}")
        self.assertEqual(get_res.status_code, 404)

    def test_delete_plato_with_pedidos_returns_409(self):
        # Create plato
        post_res = self.client.post("/platos", json={"nombre": "Chicharrón", "precio": 45.0, "idCategoria": self.categoria_id})
        plato_id = post_res.get_json()["datos"]["id"]

        # Insert user and pedido in DB
        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Usuario (nombre, correo, rol) VALUES ('Comensal', 'comensal@test.com', 'mesero');")
        user_id = cursor.lastrowid
        cursor.execute("INSERT INTO Pedido (idUsuario, idPlato, cantidad) VALUES (?, ?, 2);", (user_id, plato_id))
        conn.commit()
        conn.close()

        # Delete plato -> 409
        res = self.client.delete(f"/platos/{plato_id}")
        self.assertEqual(res.status_code, 409)
        self.assertIn("error", res.get_json())

if __name__ == "__main__":
    unittest.main()
