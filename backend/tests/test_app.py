import unittest
import os
import tempfile
from backend.config import Config
from backend.db import init_db
from backend.app import create_app

class TestAppIntegration(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path
        init_db(self.db_path)

        self.app = create_app()
        self.client = self.app.test_client()

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("endpoints", data["datos"])
        self.assertIn("categorias", data["datos"]["endpoints"])
        self.assertIn("platos", data["datos"]["endpoints"])
        self.assertIn("pedidos", data["datos"]["endpoints"])

    def test_cors_headers_present(self):
        res = self.client.get("/", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("Access-Control-Allow-Origin", res.headers)

    def test_global_404_json(self):
        res = self.client.get("/ruta-inexistente")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertIn("error", data)
        self.assertEqual(data["codigo"], 404)

if __name__ == "__main__":
    unittest.main()
