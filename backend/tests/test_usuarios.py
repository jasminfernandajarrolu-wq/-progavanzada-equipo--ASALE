import unittest
import os
import tempfile
from flask import Flask
from backend.config import Config
from backend.db import init_db
from backend.controllers.usuario_controller import usuario_bp

class TestUsuarios(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        self.app = Flask(__name__)
        self.app.register_blueprint(usuario_bp)
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_create_usuario_success(self):
        res = self.client.post("/usuarios", json={
            "nombre": "Ana Gómez",
            "correo": "ana@example.com",
            "rol": "administrador"
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()["datos"]
        self.assertEqual(data["nombre"], "Ana Gómez")
        self.assertEqual(data["correo"], "ana@example.com")
        self.assertEqual(data["rol"], "administrador")
        self.assertIn("id", data)

    def test_create_usuario_invalid_or_missing_rol_returns_400(self):
        # Missing rol
        res = self.client.post("/usuarios", json={
            "nombre": "Pedro",
            "correo": "pedro@test.com"
        })
        self.assertEqual(res.status_code, 400)

        # Invalid rol
        res2 = self.client.post("/usuarios", json={
            "nombre": "Pedro",
            "correo": "pedro@test.com",
            "rol": "gerente"
        })
        self.assertEqual(res2.status_code, 400)
        self.assertIn("error", res2.get_json())

    def test_create_usuario_missing_fields_returns_400(self):
        res = self.client.post("/usuarios", json={"nombre": "Solo Nombre"})
        self.assertEqual(res.status_code, 400)

        res2 = self.client.post("/usuarios", json={"correo": "solo@correo.com", "rol": "mesero"})
        self.assertEqual(res2.status_code, 400)

    def test_create_usuario_duplicate_correo_returns_409(self):
        self.client.post("/usuarios", json={"nombre": "U1", "correo": "duplicado@test.com", "rol": "mesero"})
        res = self.client.post("/usuarios", json={"nombre": "U2", "correo": "duplicado@test.com", "rol": "cajero"})
        self.assertEqual(res.status_code, 409)
        self.assertIn("error", res.get_json())

    def test_get_usuarios_list(self):
        self.client.post("/usuarios", json={"nombre": "U1", "correo": "u1@test.com", "rol": "mesero"})
        self.client.post("/usuarios", json={"nombre": "U2", "correo": "u2@test.com", "rol": "cajero"})
        res = self.client.get("/usuarios")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(len(data["datos"]), 2)
        self.assertEqual(data["datos"][0]["rol"], "mesero")

    def test_get_usuario_by_id(self):
        post_res = self.client.post("/usuarios", json={"nombre": "Buscar", "correo": "buscar@test.com", "rol": "cajero"})
        user_id = post_res.get_json()["datos"]["id"]

        res = self.client.get(f"/usuarios/{user_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["nombre"], "Buscar")
        self.assertEqual(res.get_json()["datos"]["rol"], "cajero")

    def test_get_usuario_not_found_returns_404(self):
        res = self.client.get("/usuarios/9999")
        self.assertEqual(res.status_code, 404)

    def test_update_usuario_success(self):
        post_res = self.client.post("/usuarios", json={"nombre": "Original", "correo": "original@test.com", "rol": "mesero"})
        user_id = post_res.get_json()["datos"]["id"]

        res = self.client.put(f"/usuarios/{user_id}", json={
            "nombre": "Modificado",
            "correo": "modificado@test.com",
            "rol": "administrador"
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["datos"]["nombre"], "Modificado")
        self.assertEqual(res.get_json()["datos"]["rol"], "administrador")

    def test_update_usuario_duplicate_correo_returns_409(self):
        self.client.post("/usuarios", json={"nombre": "U1", "correo": "u1@test.com", "rol": "mesero"})
        post2 = self.client.post("/usuarios", json={"nombre": "U2", "correo": "u2@test.com", "rol": "cajero"})
        user2_id = post2.get_json()["datos"]["id"]

        res = self.client.put(f"/usuarios/{user2_id}", json={
            "nombre": "U2 Mod",
            "correo": "u1@test.com",
            "rol": "cajero"
        })
        self.assertEqual(res.status_code, 409)

    def test_delete_usuario_success(self):
        post_res = self.client.post("/usuarios", json={"nombre": "Eliminar", "correo": "eliminar@test.com", "rol": "mesero"})
        user_id = post_res.get_json()["datos"]["id"]

        res = self.client.delete(f"/usuarios/{user_id}")
        self.assertEqual(res.status_code, 200)

        get_res = self.client.get(f"/usuarios/{user_id}")
        self.assertEqual(get_res.status_code, 404)

    def test_delete_usuario_not_found_returns_404(self):
        res = self.client.delete("/usuarios/9999")
        self.assertEqual(res.status_code, 404)

if __name__ == "__main__":
    unittest.main()
