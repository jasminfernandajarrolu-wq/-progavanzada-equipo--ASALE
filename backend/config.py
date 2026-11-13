import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "database.sqlite3"))
    TESTING = False
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() in ("true", "1")

class TestConfig(Config):
    DATABASE_PATH = ":memory:"
    TESTING = True
    DEBUG = False
