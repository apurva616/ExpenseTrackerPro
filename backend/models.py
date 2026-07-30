from database import get_connection

def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id SERIAL PRIMARY KEY,

            name VARCHAR(255) NOT NULL,

            email VARCHAR(255) UNIQUE NOT NULL,

            password TEXT NOT NULL

        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (

            id SERIAL PRIMARY KEY,

            user_id INTEGER REFERENCES users(id),

            title VARCHAR(255) NOT NULL,

            amount DECIMAL(10,2) NOT NULL,

            category VARCHAR(100) NOT NULL,

            expense_date DATE NOT NULL

        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS budgets (

            id SERIAL PRIMARY KEY,

            user_id INTEGER UNIQUE REFERENCES users(id),

            monthly_budget DECIMAL(10,2) NOT NULL

        )
    """)

    connection.commit()
    connection.close()