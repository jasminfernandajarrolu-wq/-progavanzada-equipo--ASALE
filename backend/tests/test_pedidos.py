import unittest
import os
import tempfile
from flask import Flask
from backend.config import Config
from backend.db import init_db, get_db_connection
from backend.controllers.pedido_controller import pedido_bp
from backend.controllers.usuario_controller import usuario_bp
from backend.controllers.plato_controller import plato_bp

class TestPedidos(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        # Seed Categoria, Usuario, Plato
        conn = get_db_connection(self.db_path)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Categoria (nombre) VALUES ('Platos Típicos');")
        self.categoria_id = cursor.lastrowid
        cursor.execute("INSERT INTO Usuario (nombre, correo, rol) VALUES ('Mesero Juan', 'juan@test.com', 'mesero');")
        self.user_id = cursor.lastrowid
        cursor.execute("INSERT INTO Plato (nombre, precio, idCategoria) VALUES ('Silpancho', 35.0, ?);", (self.categoria_id,))
        self.plato_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.app = Flask(__name__)
        self.app.register_blueprint(pedido_bp)
        self.app.register_blueprint(usuario_bp)
        self.app.register_blueprint(plato_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_create_pedido_success(self):
        res = self.client.post("/pedidos", json={
            "idUsuario": self.user_id,
            "idPlato": self.plato_id,
            "cantidad": 3
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()["datos"]
        self.assertEqual(data["idUsuario"], self.user_id)
        self.assertEqual(data["idPlato"], self.plato_id)
        self.assertEqual(data["cantidad"], 3)
        self.assertIn("id", data)

    def test_create_pedido_invalid_cantidad_returns_400(self):
        res = self.client.post("/pedidos", json={
            "idUsuario": self.user_id,
            "idPlato": self.plato_id,
            "cantidad": 0
        })
        self.assertEqual(res.status_code, 400)

        res2 = self.client.post("/pedidos", json={
            "idUsuario": self.user_id,
            "idPlato": self.plato_id,
            "cantidad": -2
        })
        self.assertEqual(res2.status_code, 400)

    def test_create_pedido_missing_fields_returns_400(self):
        res = self.client.post("/pedidos", json={"idUsuario": self.user_id})
        self.assertEqual(res.status_code, 400)

    def test_create_pedido_user_not_found_returns_404(self):
        res = self.client.post("/pedidos", json={
            "idUsuario": 9999,
            "idPlato": self.plato_id,
            "cantidad": 1
        })
        self.assertEqual(res.status_code, 404)

    def test_create_pedido_plato_not_found_returns_404(self):
        res = self.client.post("/pedidos", json={
            "idUsuario": self.user_id,
            "idPlato": 9999,
            "cantidad": 1
        })
        self.assertEqual(res.status_code, 404)

    def test_get_pedidos_list(self):
        self.client.post("/pedidos", json={"idUsuario": self.user_id, "idPlato": self.plato_id, "cantidad": 2})
        res = self.client.get("/pedidos")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["datos"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["usuario_nombre"], "Mesero Juan")
        self.assertEqual(data[0]["plato_nombre"], "Silpancho")
        self.assertEqual(data[0]["cantidad"], 2)
        self.assertEqual(data[0]["subtotal"], 70.0)

    def test_get_pedido_by_id(self):
        post_res = self.client.post("/pedidos", json={"idUsuario": self.user_id, "idPlato": self.plato_id, "cantidad": 1})
        pedido_id = post_res.get_json()["datos"]["id"]

        res = self.client.get(f"/pedidos/{pedido_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["id"], pedido_id)

    def test_get_pedido_not_found_returns_404(self):
        res = self.client.get("/pedidos/9999")
        self.assertEqual(res.status_code, 404)

    def test_update_pedido_success(self):
        post_res = self.client.post("/pedidos", json={"idUsuario": self.user_id, "idPlato": self.plato_id, "cantidad": 1})
        pedido_id = post_res.get_json()["datos"]["id"]

        res = self.client.put(f"/pedidos/{pedido_id}", json={
            "idUsuario": self.user_id,
            "idPlato": self.plato_id,
            "cantidad": 5
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["cantidad"], 5)

    def test_update_pedido_not_found_returns_404(self):
        res = self.client.put("/pedidos/9999", json={
            "idUsuario": self.user_id,
            "idPlato": self.plato_id,
            "cantidad": 1
        })
        self.assertEqual(res.status_code, 404)

    def test_delete_pedido_success(self):
        post_res = self.client.post("/pedidos", json={"idUsuario": self.user_id, "idPlato": self.plato_id, "cantidad": 1})
        pedido_id = post_res.get_json()["datos"]["id"]

        res = self.client.delete(f"/pedidos/{pedido_id}")
        self.assertEqual(res.status_code, 200)

        get_res = self.client.get(f"/pedidos/{pedido_id}")
        self.assertEqual(get_res.status_code, 404)

    def test_delete_user_with_pedidos_returns_409(self):
        self.client.post("/pedidos", json={"idUsuario": self.user_id, "idPlato": self.plato_id, "cantidad": 1})

        res = self.client.delete(f"/usuarios/{self.user_id}")
        self.assertEqual(res.status_code, 409)
        self.assertIn("error", res.get_json())

if __name__ == "__main__":
    unittest.main()
