"""
seed.py — Carga los datos iniciales del restaurante en la base de datos (Categorías, Ingredientes, Platos, Usuarios y Pedidos de prueba).
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
# Datos de seed
# ---------------------------------------------------------------------------
CATEGORIAS = ["Platos fuertes", "Sopas"]

INGREDIENTES = [
    {"nombre": "Charque", "unidad": "kg", "stock": 8.0, "stockMinimo": 3.0, "precioUnitario": 70.0},
    {"nombre": "Papa", "unidad": "kg", "stock": 40.0, "stockMinimo": 15.0, "precioUnitario": 5.0},
    {"nombre": "Maíz mote", "unidad": "kg", "stock": 12.0, "stockMinimo": 5.0, "precioUnitario": 12.0},
    {"nombre": "Carne de res", "unidad": "kg", "stock": 20.0, "stockMinimo": 8.0, "precioUnitario": 55.0},
    {"nombre": "Pollo", "unidad": "kg", "stock": 15.0, "stockMinimo": 6.0, "precioUnitario": 22.0},
    {"nombre": "Arroz", "unidad": "kg", "stock": 25.0, "stockMinimo": 10.0, "precioUnitario": 9.0},
    {"nombre": "Ají amarillo", "unidad": "kg", "stock": 2.0, "stockMinimo": 2.0, "precioUnitario": 30.0},
    {"nombre": "Maní", "unidad": "kg", "stock": 6.0, "stockMinimo": 3.0, "precioUnitario": 25.0},
]

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

USUARIOS = [
    {"nombre": "Carlos Morales", "correo": "carlos.morales@sabores.bo", "rol": "administrador"},
    {"nombre": "Lucía Mamani", "correo": "lucia.mamani@sabores.bo", "rol": "mesero"},
    {"nombre": "Mateo Quispe", "correo": "mateo.quispe@sabores.bo", "rol": "cajero"},
]

PEDIDOS_EJEMPLO = [
    {"usuario_correo": "carlos.morales@sabores.bo", "plato_nombre": "Pique macho", "cantidad": 2},
    {"usuario_correo": "lucia.mamani@sabores.bo", "plato_nombre": "Sopa de maní", "cantidad": 1},
    {"usuario_correo": "mateo.quispe@sabores.bo", "plato_nombre": "Silpancho", "cantidad": 3},
]


def seed(db_path=None):
    """Ejecuta el seed. Retorna un dict con estadísticas."""
    if db_path is None:
        db_path = Config.DATABASE_PATH

    # Asegurar que el esquema existe
    init_db(db_path)

    conn = get_db_connection(db_path)
    stats = {
        "categorias_creadas": 0,
        "ingredientes_creados": 0,
        "ingredientes_omitidos": 0,
        "platos_creados": 0,
        "platos_omitidos": 0,
        "usuarios_creados": 0,
        "usuarios_omitidos": 0,
        "pedidos_creados": 0,
        "pedidos_omitidos": 0
    }

    try:
        cursor = conn.cursor()

        # 1. Categorías
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

        # 2. Ingredientes
        for ing in INGREDIENTES:
            cursor.execute("SELECT id FROM Ingrediente WHERE LOWER(nombre) = LOWER(?);", (ing["nombre"],))
            if cursor.fetchone():
                stats["ingredientes_omitidos"] += 1
                print(f"  [·] Ingrediente ya existe (omitido): {ing['nombre']}")
                continue

            cursor.execute(
                """INSERT INTO Ingrediente (nombre, unidad, stock, stockMinimo, precioUnitario)
                   VALUES (?, ?, ?, ?, ?);""",
                (ing["nombre"], ing["unidad"], ing["stock"], ing["stockMinimo"], ing["precioUnitario"])
            )
            stats["ingredientes_creados"] += 1
            print(f"  [+] Ingrediente creado: {ing['nombre']} ({ing['stock']} {ing['unidad']})")

        conn.commit()

        # 3. Platos
        plato_ids = {}
        for plato in PLATOS:
            cursor.execute("SELECT id FROM Plato WHERE nombre = ?;", (plato["nombre"],))
            row = cursor.fetchone()
            if row:
                plato_ids[plato["nombre"]] = row["id"]
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
            plato_ids[plato["nombre"]] = cursor.lastrowid
            stats["platos_creados"] += 1
            print(f"  [+] Plato creado: {plato['nombre']} (Bs {plato['precio']:.2f})")

        conn.commit()

        # 4. Usuarios
        user_ids = {}
        for u in USUARIOS:
            cursor.execute("SELECT id FROM Usuario WHERE LOWER(correo) = LOWER(?);", (u["correo"],))
            row = cursor.fetchone()
            if row:
                user_ids[u["correo"]] = row["id"]
                stats["usuarios_omitidos"] += 1
                print(f"  [·] Usuario ya existe (omitido): {u['nombre']} ({u['rol']})")
                continue

            cursor.execute(
                "INSERT INTO Usuario (nombre, correo, rol) VALUES (?, ?, ?);",
                (u["nombre"], u["correo"], u["rol"])
            )
            user_ids[u["correo"]] = cursor.lastrowid
            stats["usuarios_creados"] += 1
            print(f"  [+] Usuario creado: {u['nombre']} ({u['rol']})")

        conn.commit()

        # 5. Pedidos de ejemplo
        for ped in PEDIDOS_EJEMPLO:
            u_id = user_ids.get(ped["usuario_correo"])
            p_id = plato_ids.get(ped["plato_nombre"])

            if not u_id or not p_id:
                continue

            # Verificar si ya existe un pedido idéntico para no duplicar
            cursor.execute(
                "SELECT id FROM Pedido WHERE idUsuario = ? AND idPlato = ? AND cantidad = ?;",
                (u_id, p_id, ped["cantidad"])
            )
            if cursor.fetchone():
                stats["pedidos_omitidos"] += 1
                print(f"  [·] Pedido ya existe (omitido): {ped['plato_nombre']} x{ped['cantidad']}")
                continue

            cursor.execute(
                "INSERT INTO Pedido (idUsuario, idPlato, cantidad) VALUES (?, ?, ?);",
                (u_id, p_id, ped["cantidad"])
            )
            stats["pedidos_creados"] += 1
            print(f"  [+] Pedido creado: {ped['plato_nombre']} x{ped['cantidad']}")

        conn.commit()
    finally:
        conn.close()

    return stats


if __name__ == "__main__":
    print("=== Seed: Restaurante Sabores Bolivianos ===")
    result = seed()
    print()
    print(f"Categorías creadas   : {result['categorias_creadas']}")
    print(f"Ingredientes creados : {result['ingredientes_creados']}")
    print(f"Ingredientes omitidos: {result['ingredientes_omitidos']}")
    print(f"Platos creados       : {result['platos_creados']}")
    print(f"Platos omitidos      : {result['platos_omitidos']}")
    print(f"Usuarios creados     : {result['usuarios_creados']}")
    print(f"Usuarios omitidos    : {result['usuarios_omitidos']}")
    print(f"Pedidos creados      : {result['pedidos_creados']}")
    print(f"Pedidos omitidos     : {result['pedidos_omitidos']}")
    print("===========================================")
