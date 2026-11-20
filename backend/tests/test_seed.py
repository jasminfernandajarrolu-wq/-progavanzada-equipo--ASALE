import unittest
import os
import tempfile
from backend.db import init_db, get_db_connection
from backend.config import Config
from backend.seed import seed, PLATOS, CATEGORIAS, INGREDIENTES


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

    def test_seed_crea_categorias_ingredientes_y_platos(self):
        stats = seed(self.db_path)
        self.assertEqual(stats["categorias_creadas"], len(CATEGORIAS))
        self.assertEqual(stats["ingredientes_creados"], len(INGREDIENTES))
        self.assertEqual(stats["ingredientes_omitidos"], 0)
        self.assertEqual(stats["platos_creados"], len(PLATOS))
        self.assertEqual(stats["platos_omitidos"], 0)
        self.assertEqual(self._count("Categoria"), len(CATEGORIAS))
        self.assertEqual(self._count("Ingrediente"), len(INGREDIENTES))
        self.assertEqual(self._count("Plato"), len(PLATOS))

    def test_seed_idempotente_no_duplica(self):
        # Primera ejecución
        seed(self.db_path)
        # Segunda ejecución
        stats2 = seed(self.db_path)
        self.assertEqual(stats2["categorias_creadas"], 0)
        self.assertEqual(stats2["ingredientes_creados"], 0)
        self.assertEqual(stats2["ingredientes_omitidos"], len(INGREDIENTES))
        self.assertEqual(stats2["platos_creados"], 0)
        self.assertEqual(stats2["platos_omitidos"], len(PLATOS))
        # Conteo sigue igual
        self.assertEqual(self._count("Categoria"), len(CATEGORIAS))
        self.assertEqual(self._count("Ingrediente"), len(INGREDIENTES))
        self.assertEqual(self._count("Plato"), len(PLATOS))

    def test_seed_ingredientes_datos_correctos(self):
        seed(self.db_path)
        conn = get_db_connection(self.db_path)
        try:
            cur = conn.cursor()
            cur.execute("SELECT nombre, unidad, stock, stockMinimo, precioUnitario FROM Ingrediente ORDER BY id;")
            rows = {r["nombre"]: dict(r) for r in cur.fetchall()}
        finally:
            conn.close()

        self.assertEqual(len(rows), len(INGREDIENTES))
        for expected in INGREDIENTES:
            self.assertIn(expected["nombre"], rows)
            actual = rows[expected["nombre"]]
            self.assertEqual(actual["unidad"], expected["unidad"])
            self.assertEqual(actual["stock"], expected["stock"])
            self.assertEqual(actual["stockMinimo"], expected["stockMinimo"])
            self.assertEqual(actual["precioUnitario"], expected["precioUnitario"])

    def test_seed_platos_tienen_imagen_e_ingredientes(self):
        seed(self.db_path)
        conn = get_db_connection(self.db_path)
        try:
            cur = conn.cursor()
            cur.execute("SELECT nombre, imagen, ingredientes FROM Plato ORDER BY id;")
            rows = cur.fetchall()
        finally:
            conn.close()

        self.assertEqual(len(rows), len(PLATOS))
        for row, expected in zip(rows, PLATOS):
            self.assertEqual(row["nombre"], expected["nombre"])
            self.assertEqual(row["imagen"], expected["imagen"])
            self.assertNotEqual(row["ingredientes"], "[]")
            self.assertNotEqual(row["ingredientes"], "")

    def test_seed_platos_vinculados_a_categorias_correctas(self):
        seed(self.db_path)
        conn = get_db_connection(self.db_path)
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT p.nombre AS plato, c.nombre AS categoria
                FROM Plato p
                JOIN Categoria c ON p.idCategoria = c.id
                ORDER BY p.id;
            """)
            rows = {r["plato"]: r["categoria"] for r in cur.fetchall()}
        finally:
            conn.close()

        for plato in PLATOS:
            self.assertIn(plato["nombre"], rows)
            self.assertEqual(rows[plato["nombre"]], plato["categoria"])

    def test_seed_crea_db_si_no_existe(self):
        nuevo_path = self.db_path + "_nuevo.sqlite3"
        try:
            stats = seed(nuevo_path)
            self.assertEqual(stats["ingredientes_creados"], len(INGREDIENTES))
            self.assertEqual(stats["platos_creados"], len(PLATOS))
        finally:
            if os.path.exists(nuevo_path):
                os.remove(nuevo_path)


if __name__ == "__main__":
    unittest.main()
