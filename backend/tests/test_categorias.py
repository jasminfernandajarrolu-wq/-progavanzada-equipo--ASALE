import unittest
import os
import tempfile
from flask import Flask
from backend.config import Config
from backend.db import init_db, get_db_connection
from backend.controllers.categoria_controller import categoria_bp

class TestCategorias(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        self.app = Flask(__name__)
        self.app.register_blueprint(categoria_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_create_categoria_success(self):
        res = self.client.post("/categorias", json={"nombre": "Platos Fuertes"})
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["datos"]["nombre"], "Platos Fuertes")
        self.assertIn("id", data["datos"])

    def test_create_categoria_missing_nombre_returns_400(self):
        res = self.client.post("/categorias", json={})
        self.assertEqual(res.status_code, 400)

        res2 = self.client.post("/categorias", json={"nombre": "   "})
        self.assertEqual(res2.status_code, 400)

    def test_get_categorias_list(self):
        self.client.post("/categorias", json={"nombre": "Sopas"})
        self.client.post("/categorias", json={"nombre": "Bebidas"})
        res = self.client.get("/categorias")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()["datos"]), 2)

    def test_get_categoria_by_id(self):
        post_res = self.client.post("/categorias", json={"nombre": "Postres"})
        cat_id = post_res.get_json()["datos"]["id"]

        res = self.client.get(f"/categorias/{cat_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["nombre"], "Postres")

    def test_get_categoria_not_found_returns_404(self):
        res = self.client.get("/categorias/9999")
        self.assertEqual(res.status_code, 404)

    def test_update_categoria_success(self):
        post_res = self.client.post("/categorias", json={"nombre": "Entradas"})
        cat_id = post_res.get_json()["datos"]["id"]

        res = self.client.put(f"/categorias/{cat_id}", json={"nombre": "Entradas Típicas"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["nombre"], "Entradas Típicas")

    def test_update_categoria_not_found_returns_404(self):
        res = self.client.put("/categorias/9999", json={"nombre": "No Existe"})
        self.assertEqual(res.status_code, 404)

    def test_delete_categoria_success(self):
        post_res = self.client.post("/categorias", json={"nombre": "Temporal"})
        cat_id = post_res.get_json()["datos"]["id"]

        res = self.client.delete(f"/categorias/{cat_id}")
        self.assertEqual(res.status_code, 200)

        get_res = self.client.get(f"/categorias/{cat_id}")
        self.assertEqual(get_res.status_code, 404)

    def test_delete_categoria_with_platos_returns_409(self):
        # Create category
        post_res = self.client.post("/categorias", json={"nombre": "Platos Tradicionales"})
        cat_id = post_res.get_json()["datos"]["id"]

        # Insert a dish (plato) referencing this category
        conn = get_db_connection(self.db_path)
        conn.execute("INSERT INTO Plato (nombre, precio, idCategoria) VALUES (?, ?, ?);", ("Silpancho", 35.0, cat_id))
        conn.commit()
        conn.close()

        # Delete category -> must return 409
        res = self.client.delete(f"/categorias/{cat_id}")
        self.assertEqual(res.status_code, 409)
        self.assertIn("error", res.get_json())

if __name__ == "__main__":
    unittest.main()
