from flask import Flask, jsonify, request, render_template

from database import get_connection
from models import create_tables

app = Flask(__name__)

# Create database tables when the application starts
create_tables()


@app.route("/")
def home():
    return render_template("login.html")


@app.route("/register-page")
def register_page():
    return render_template("register.html")


@app.route("/login")
def login():
    return jsonify({
        "message": "Login API Working!"
    })


@app.route("/users")
def users():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()

    connection.close()

    return jsonify([dict(user) for user in users])


@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO users(name, email, password)
        VALUES (?, ?, ?)
        """,
        (name, email, password)
    )

    connection.commit()

    connection.close()

    return jsonify({
        "message": "User registered successfully!"
    })

if __name__ == "__main__":
    app.run(debug=True)