import unittest
import os
import tempfile
from backend.db import init_db, get_db_connection
from backend.config import Config
from backend.seed import seed, PLATOS, CATEGORIAS, INGREDIENTES, USUARIOS, PEDIDOS_EJEMPLO


class TestSeed(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db_path = self.temp_db.name
        Config.DATABASE_PATH = self.db_path

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def _count(self, table):
        conn = get_db_connection(self.db_path)
        try:
            cur = conn.cursor()
            cur.execute(f"SELECT COUNT(*) AS cnt FROM {table};")
            return cur.fetchone()["cnt"]
        finally:
            conn.close()

    def test_seed_crea_entidades_completas(self):
        stats = seed(self.db_path)
        self.assertEqual(stats["categorias_creadas"], len(CATEGORIAS))
        self.assertEqual(stats["ingredientes_creados"], len(INGREDIENTES))
        self.assertEqual(stats["platos_creados"], len(PLATOS))
        self.assertEqual(stats["usuarios_creados"], len(USUARIOS))
        self.assertEqual(stats["pedidos_creados"], len(PEDIDOS_EJEMPLO))
        self.assertEqual(self._count("Categoria"), len(CATEGORIAS))
        self.assertEqual(self._count("Ingrediente"), len(INGREDIENTES))
        self.assertEqual(self._count("Plato"), len(PLATOS))
        self.assertEqual(self._count("Usuario"), len(USUARIOS))
        self.assertEqual(self._count("Pedido"), len(PEDIDOS_EJEMPLO))

    def test_seed_idempotente_no_duplica(self):
        # Primera ejecución
        seed(self.db_path)
        # Segunda ejecución
        stats2 = seed(self.db_path)
        self.assertEqual(stats2["categorias_creadas"], 0)
        self.assertEqual(stats2["ingredientes_creados"], 0)
        self.assertEqual(stats2["platos_creados"], 0)
        self.assertEqual(stats2["usuarios_creados"], 0)
        self.assertEqual(stats2["pedidos_creados"], 0)
        self.assertEqual(stats2["categorias_omitidos"] if "categorias_omitidos" in stats2 else 0, 0)
        self.assertEqual(stats2["ingredientes_omitidos"], len(INGREDIENTES))
        self.assertEqual(stats2["platos_omitidos"], len(PLATOS))
        self.assertEqual(stats2["usuarios_omitidos"], len(USUARIOS))
        self.assertEqual(stats2["pedidos_omitidos"], len(PEDIDOS_EJEMPLO))
        # Conteo sigue igual
        self.assertEqual(self._count("Categoria"), len(CATEGORIAS))
        self.assertEqual(self._count("Ingrediente"), len(INGREDIENTES))
        self.assertEqual(self._count("Plato"), len(PLATOS))
        self.assertEqual(self._count("Usuario"), len(USUARIOS))
        self.assertEqual(self._count("Pedido"), len(PEDIDOS_EJEMPLO))

    def test_seed_usuarios_roles_correctos(self):
        seed(self.db_path)
        conn = get_db_connection(self.db_path)
        try:
            cur = conn.cursor()
            cur.execute("SELECT nombre, correo, rol FROM Usuario ORDER BY id;")
            rows = {r["correo"]: dict(r) for r in cur.fetchall()}
        finally:
            conn.close()

        self.assertEqual(len(rows), len(USUARIOS))
        for expected in USUARIOS:
            self.assertIn(expected["correo"], rows)
            self.assertEqual(rows[expected["correo"]]["rol"], expected["rol"])

    def test_seed_crea_db_si_no_existe(self):
        nuevo_path = self.db_path + "_nuevo.sqlite3"
        try:
            stats = seed(nuevo_path)
            self.assertEqual(stats["usuarios_creados"], len(USUARIOS))
            self.assertEqual(stats["pedidos_creados"], len(PEDIDOS_EJEMPLO))
        finally:
            if os.path.exists(nuevo_path):
                os.remove(nuevo_path)


if __name__ == "__main__":
    unittest.main()
