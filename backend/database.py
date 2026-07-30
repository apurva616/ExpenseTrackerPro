import os
import sqlite3
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )


def get_connection():

    # Production (Render + Neon)
    if DATABASE_URL:
        return psycopg.connect(
            DATABASE_URL,
            row_factory=dict_row
        )

    # Local development (SQLite)
    connection = sqlite3.connect("expense_tracker.db")
    connection.row_factory = sqlite3.Row
    return connection