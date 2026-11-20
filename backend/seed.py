"""
seed.py — Carga los platos iniciales del restaurante en la base de datos.
Idempotente: si se ejecuta dos veces no duplica registros.

Uso (desde la raíz del proyecto):
    python -m backend.seed
o bien (si backend/ está en el PYTHONPATH):
    python backend/seed.py
"""

import sys
import os
import json

# Permite ejecutar como script directo
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import init_db, get_db_connection
from backend.config import Config


# ---------------------------------------------------------------------------
# Datos de seed (extraídos de restaurante-gestion-v2/src/data/seedData.js)
# ---------------------------------------------------------------------------
CATEGORIAS = ["Platos fuertes", "Sopas"]

PLATOS = [
    {
        "nombre": "Pique macho",
        "precio": 55.0,
        "categoria": "Platos fuertes",
        "imagen": "pique-macho.jpg",
        "ingredientes": [["Carne de res", 0.3], ["Papa", 0.3], ["Ají amarillo", 0.02]]
    },
    {
        "nombre": "Sopa de maní",
        "precio": 30.0,
        "categoria": "Sopas",
        "imagen": "sopa-de-mani.jpg",
        "ingredientes": [["Maní", 0.08], ["Papa", 0.2], ["Arroz", 0.05]]
    },
    {
        "nombre": "Silpancho",
        "precio": 35.0,
        "categoria": "Platos fuertes",
        "imagen": "silpancho.jpg",
        "ingredientes": [["Carne de res", 0.2], ["Papa", 0.3], ["Arroz", 0.15]]
    },
    {
        "nombre": "Fricasé",
        "precio": 40.0,
        "categoria": "Platos fuertes",
        "imagen": "fricase.jpg",
        "ingredientes": [["Pollo", 0.3], ["Maíz mote", 0.1], ["Ají amarillo", 0.03]]
    },
    {
        "nombre": "Charquekan",
        "precio": 50.0,
        "categoria": "Platos fuertes",
        "imagen": "charquekan.jpg",
        "ingredientes": [["Charque", 0.2], ["Maíz mote", 0.15], ["Papa", 0.2]]
    },
]


def seed(db_path=None):
    """Ejecuta el seed. Retorna un dict con estadísticas."""
    if db_path is None:
        db_path = Config.DATABASE_PATH

    # Asegurar que el esquema existe
    init_db(db_path)

    conn = get_db_connection(db_path)
    stats = {"categorias_creadas": 0, "platos_creados": 0, "platos_omitidos": 0}

    try:
        cursor = conn.cursor()

        # 1. Insertar categorías si no existen
        cat_ids = {}
        for nombre_cat in CATEGORIAS:
            cursor.execute("SELECT id FROM Categoria WHERE nombre = ?;", (nombre_cat,))
            row = cursor.fetchone()
            if row:
                cat_ids[nombre_cat] = row["id"]
            else:
                cursor.execute("INSERT INTO Categoria (nombre) VALUES (?);", (nombre_cat,))
                cat_ids[nombre_cat] = cursor.lastrowid
                stats["categorias_creadas"] += 1
                print(f"  [+] Categoría creada: {nombre_cat}")

        conn.commit()

        # 2. Insertar platos si no existen (verificar por nombre)
        for plato in PLATOS:
            cursor.execute("SELECT id FROM Plato WHERE nombre = ?;", (plato["nombre"],))
            if cursor.fetchone():
                stats["platos_omitidos"] += 1
                print(f"  [·] Plato ya existe (omitido): {plato['nombre']}")
                continue

            id_categoria = cat_ids[plato["categoria"]]
            ingredientes_json = json.dumps(plato["ingredientes"], ensure_ascii=False)

            cursor.execute(
                """INSERT INTO Plato (nombre, precio, idCategoria, imagen, ingredientes)
                   VALUES (?, ?, ?, ?, ?);""",
                (plato["nombre"], plato["precio"], id_categoria, plato["imagen"], ingredientes_json)
            )
            stats["platos_creados"] += 1
            print(f"  [+] Plato creado: {plato['nombre']} (Bs {plato['precio']:.2f})")

        conn.commit()
    finally:
        conn.close()

    return stats


if __name__ == "__main__":
    print("=== Seed: Restaurante Sabores Bolivianos ===")
    result = seed()
    print()
    print(f"Categorías creadas : {result['categorias_creadas']}")
    print(f"Platos creados     : {result['platos_creados']}")
    print(f"Platos omitidos    : {result['platos_omitidos']}")
    print("===========================================")
