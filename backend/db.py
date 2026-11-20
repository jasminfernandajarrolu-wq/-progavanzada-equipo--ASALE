import sqlite3
import os
from backend.config import Config

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL CHECK(rol IN ('administrador', 'mesero', 'cajero'))
);

CREATE TABLE IF NOT EXISTS Categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Plato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    idCategoria INTEGER NOT NULL,
    imagen TEXT NOT NULL DEFAULT '',
    ingredientes TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (idCategoria) REFERENCES Categoria(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idUsuario INTEGER NOT NULL,
    idPlato INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (idUsuario) REFERENCES Usuario(id) ON DELETE RESTRICT,
    FOREIGN KEY (idPlato) REFERENCES Plato(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Ingrediente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    unidad TEXT NOT NULL,
    stock REAL NOT NULL DEFAULT 0,
    stockMinimo REAL NOT NULL DEFAULT 0,
    precioUnitario REAL NOT NULL DEFAULT 0
);
"""

def get_db_connection(db_path=None):
    if db_path is None:
        db_path = Config.DATABASE_PATH
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path=None, conn=None):
    close_after = False
    if conn is None:
        conn = get_db_connection(db_path)
        close_after = True
    try:
        conn.executescript(SCHEMA_SQL)
        conn.commit()
    finally:
        if close_after:
            conn.close()
