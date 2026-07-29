from flask import (
    Flask,
    jsonify,
    request,
    render_template,
    session,
    redirect,
    url_for
)

import os
from werkzeug.security import generate_password_hash, check_password_hash

from database import get_connection
from models import create_tables

app = Flask(__name__)
app.secret_key = os.getenv(
    "SECRET_KEY",
    "expense_tracker_secret_key"
)

create_tables()


# ---------------- HOME ---------------- #

@app.route("/")
def home():
    return render_template("login.html")


@app.route("/register-page")
def register_page():
    return render_template("register.html")


# ---------------- REGISTER ---------------- #

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    name = data["name"].strip()
    email = data["email"].strip()
    password = data["password"]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE email=?",
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Email already registered."
        })

    hashed_password = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users(name,email,password)
        VALUES(?,?,?)
        """,
        (name, email, hashed_password)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "User registered successfully!"
    })


# ---------------- LOGIN ---------------- #

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    email = data["email"]
    password = data["password"]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=?",
        (email,)
    )

    user = cursor.fetchone()

    connection.close()

    if user is None:
        return jsonify({
            "success": False,
            "message": "User not found."
        })

    if not check_password_hash(user["password"], password):
        return jsonify({
            "success": False,
            "message": "Incorrect password."
        })

    session["user_id"] = user["id"]
    session["user_name"] = user["name"]

    return jsonify({
        "success": True,
        "message": "Login Successful!"
    })


# ---------------- DASHBOARD ---------------- #

@app.route("/dashboard")
def dashboard():

    if "user_id" not in session:
        return redirect(url_for("home"))

    return render_template(
        "dashboard.html",
        user_name=session["user_name"]
    )


# ---------------- ADD EXPENSE ---------------- #

@app.route("/add-expense")
def add_expense_page():

    if "user_id" not in session:
        return redirect(url_for("home"))

    return render_template("add_expense.html")


@app.route("/add-expense", methods=["POST"])
def add_expense():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO expenses
        (user_id,title,amount,category,expense_date)
        VALUES(?,?,?,?,?)
        """,
        (
            session["user_id"],
            data["title"],
            data["amount"],
            data["category"],
            data["expense_date"]
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Expense Added Successfully!"
    })


# ---------------- GET EXPENSES ---------------- #

@app.route("/expenses")
def get_expenses():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            title,
            amount,
            category,
            expense_date
        FROM expenses
        WHERE user_id=?
        ORDER BY expense_date DESC
        """,
        (session["user_id"],)
    )

    expenses = cursor.fetchall()

    connection.close()

    return jsonify([dict(expense) for expense in expenses])


# ---------------- DELETE ---------------- #

@app.route("/delete-expense/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM expenses
        WHERE id=?
        AND user_id=?
        """,
        (
            expense_id,
            session["user_id"]
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Expense deleted successfully!"
    })


# ---------------- EDIT ---------------- #

@app.route("/edit-expense/<int:expense_id>")
def edit_expense_page(expense_id):

    if "user_id" not in session:
        return redirect(url_for("home"))

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM expenses
        WHERE id=?
        AND user_id=?
        """,
        (
            expense_id,
            session["user_id"]
        )
    )

    expense = cursor.fetchone()

    connection.close()

    if expense is None:
        return "Expense not found", 404

    return render_template(
        "edit_expense.html",
        expense=expense
    )


@app.route("/update-expense/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE expenses
        SET
            title=?,
            amount=?,
            category=?,
            expense_date=?
        WHERE
            id=?
        AND
            user_id=?
        """,
        (
            data["title"],
            data["amount"],
            data["category"],
            data["expense_date"],
            expense_id,
            session["user_id"]
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Expense Updated Successfully!"
    })


# ---------------- ANALYTICS ---------------- #

@app.route("/analytics")
def analytics():

    if "user_id" not in session:
        return redirect(url_for("home"))

    return render_template(
        "analytics.html",
        user_name=session["user_name"]
    )


# ---------------- EXPENSE PAGE ---------------- #

@app.route("/expenses-page")
def expenses_page():

    if "user_id" not in session:
        return redirect(url_for("home"))

    return render_template(
        "expenses.html",
        user_name=session["user_name"]
    )


# ---------------- LOGOUT ---------------- #

@app.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully!"
    })


# ---------------- USERS ---------------- #

@app.route("/users")
def users():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM users")

    users = cursor.fetchall()

    connection.close()

    return jsonify([dict(user) for user in users])


if __name__ == "__main__":
    app.run(debug=True) 