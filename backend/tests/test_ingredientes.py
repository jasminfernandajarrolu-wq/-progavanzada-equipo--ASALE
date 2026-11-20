import unittest
import os
import tempfile
from flask import Flask
from backend.config import Config
from backend.db import init_db, get_db_connection
from backend.controllers.ingrediente_controller import ingrediente_bp
from backend.controllers.plato_controller import plato_bp


class TestIngredientes(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        self.app = Flask(__name__)
        self.app.register_blueprint(ingrediente_bp)
        self.app.register_blueprint(plato_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_get_ingredientes_empty(self):
        res = self.client.get("/ingredientes")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"], [])

    def test_create_ingrediente_success(self):
        res = self.client.post("/ingredientes", json={
            "nombre": "Carne de res",
            "unidad": "kg",
            "stock": 20.0,
            "stockMinimo": 8.0,
            "precioUnitario": 55.0
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()["datos"]
        self.assertEqual(data["nombre"], "Carne de res")
        self.assertEqual(data["unidad"], "kg")
        self.assertEqual(data["stock"], 20.0)
        self.assertEqual(data["stockMinimo"], 8.0)
        self.assertEqual(data["precioUnitario"], 55.0)

    def test_create_ingrediente_missing_nombre_returns_400(self):
        res = self.client.post("/ingredientes", json={
            "unidad": "kg",
            "stock": 10.0
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_create_ingrediente_missing_unidad_returns_400(self):
        res = self.client.post("/ingredientes", json={
            "nombre": "Papa",
            "stock": 10.0
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_create_ingrediente_negative_stock_returns_400(self):
        res = self.client.post("/ingredientes", json={
            "nombre": "Arroz",
            "unidad": "kg",
            "stock": -5.0
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("error", res.get_json())

    def test_create_ingrediente_duplicate_nombre_returns_409(self):
        self.client.post("/ingredientes", json={
            "nombre": "Pollo",
            "unidad": "kg",
            "stock": 10.0
        })
        res = self.client.post("/ingredientes", json={
            "nombre": "pollo",
            "unidad": "kg",
            "stock": 15.0
        })
        self.assertEqual(res.status_code, 409)
        self.assertIn("error", res.get_json())

    def test_get_ingrediente_by_id_success(self):
        create_res = self.client.post("/ingredientes", json={
            "nombre": "Maní",
            "unidad": "kg",
            "stock": 6.0,
            "stockMinimo": 3.0,
            "precioUnitario": 25.0
        })
        ing_id = create_res.get_json()["datos"]["id"]

        res = self.client.get(f"/ingredientes/{ing_id}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["datos"]
        self.assertEqual(data["nombre"], "Maní")

    def test_get_ingrediente_by_id_not_found_returns_404(self):
        res = self.client.get("/ingredientes/9999")
        self.assertEqual(res.status_code, 404)

    def test_update_ingrediente_success(self):
        create_res = self.client.post("/ingredientes", json={
            "nombre": "Queso",
            "unidad": "kg",
            "stock": 5.0,
            "stockMinimo": 2.0,
            "precioUnitario": 35.0
        })
        ing_id = create_res.get_json()["datos"]["id"]

        res = self.client.put(f"/ingredientes/{ing_id}", json={
            "nombre": "Queso Chaqueño",
            "unidad": "kg",
            "stock": 8.0,
            "stockMinimo": 3.0,
            "precioUnitario": 38.0
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["datos"]
        self.assertEqual(data["nombre"], "Queso Chaqueño")
        self.assertEqual(data["stock"], 8.0)

    def test_update_ingrediente_not_found_returns_404(self):
        res = self.client.put("/ingredientes/9999", json={
            "nombre": "Inexistente",
            "unidad": "kg",
            "stock": 1.0
        })
        self.assertEqual(res.status_code, 404)

    def test_update_ingrediente_duplicate_nombre_returns_409(self):
        self.client.post("/ingredientes", json={"nombre": "Sal", "unidad": "kg"})
        res2 = self.client.post("/ingredientes", json={"nombre": "Pimienta", "unidad": "kg"})
        p_id = res2.get_json()["datos"]["id"]

        res = self.client.put(f"/ingredientes/{p_id}", json={"nombre": "Sal", "unidad": "kg"})
        self.assertEqual(res.status_code, 409)

    def test_delete_ingrediente_success(self):
        create_res = self.client.post("/ingredientes", json={
            "nombre": "Comino",
            "unidad": "kg",
            "stock": 1.0
        })
        ing_id = create_res.get_json()["datos"]["id"]

        res = self.client.delete(f"/ingredientes/{ing_id}")
        self.assertEqual(res.status_code, 200)

        get_res = self.client.get(f"/ingredientes/{ing_id}")
        self.assertEqual(get_res.status_code, 404)

    def test_delete_ingrediente_not_found_returns_404(self):
        res = self.client.delete("/ingredientes/9999")
        self.assertEqual(res.status_code, 404)

    def test_delete_ingrediente_in_use_by_plato_returns_409(self):
        # 1. Crear ingrediente
        ing_res = self.client.post("/ingredientes", json={
            "nombre": "Carne de res",
            "unidad": "kg",
            "stock": 10.0
        })
        ing_id = ing_res.get_json()["datos"]["id"]

        # 2. Crear categoría y plato que usa "Carne de res"
        conn = get_db_connection(self.db_path)
        cur = conn.cursor()
        cur.execute("INSERT INTO Categoria (nombre) VALUES ('Platos Fuertes');")
        cat_id = cur.lastrowid
        conn.commit()
        conn.close()

        self.client.post("/platos", json={
            "nombre": "Silpancho",
            "precio": 35.0,
            "idCategoria": cat_id,
            "ingredientes": [["Carne de res", 0.2], ["Papa", 0.3]]
        })

        # 3. Intentar borrar "Carne de res" -> debe fallar con 409
        del_res = self.client.delete(f"/ingredientes/{ing_id}")
        self.assertEqual(del_res.status_code, 409)
        self.assertIn("error", del_res.get_json())
        self.assertIn("Silpancho", del_res.get_json()["error"])


if __name__ == "__main__":
    unittest.main()
