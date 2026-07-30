from flask import (
    Flask,
    jsonify,
    request,
    render_template,
    session,
    redirect,
    url_for
)

import csv
from io import StringIO
from flask import make_response

from datetime import datetime

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
        "SELECT id FROM users WHERE email=%s",
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
        VALUES(%s,%s,%s)
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
        "SELECT * FROM users WHERE email=%s",
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
        VALUES(%s,%s,%s,%s,%s)
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
        WHERE user_id=%s
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
        WHERE id=%s
        AND user_id=%s
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
        WHERE id=%s
        AND user_id=%s
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
            title=%s,
            amount=%s,
            category=%s,
            expense_date=%s
        WHERE
            id=%s
        AND
            user_id=%s
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

@app.route("/budgets")
def budgets():

    if "user_id" not in session:
        return redirect(url_for("home"))

    return render_template(
        "budgets.html",
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

@app.errorhandler(404)
def page_not_found(error):

    return render_template("404.html"), 404

@app.errorhandler(500)
def internal_server_error(error):

    return render_template("500.html"), 500

@app.route("/save-budget", methods=["POST"])
def save_budget():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    budget = data["budget"]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM budgets
        WHERE user_id=%s
        """,
        (session["user_id"],)
    )

    existing = cursor.fetchone()

    if existing:

        cursor.execute(
            """
            UPDATE budgets
            SET monthly_budget=%s
            WHERE user_id=%s
            """,
            (
                budget,
                session["user_id"]
            )
        )

    else:

        cursor.execute(
            """
            INSERT INTO budgets(user_id, monthly_budget)
            VALUES(%s, %s)
            """,
            (
                session["user_id"],
                budget
            )
        )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Budget saved successfully!"
    })

@app.route("/budget")
def get_budget():

    if "user_id" not in session:
        return jsonify({
            "budget": 0,
            "spent": 0
        })

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT monthly_budget
        FROM budgets
        WHERE user_id=%s
        """,
        (session["user_id"],)
    )

    budget = cursor.fetchone()

    cursor.execute(
        """
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE user_id=%s
        AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        """,
        (session["user_id"],)
    )

    spent = cursor.fetchone()["total"]

    connection.close()

    return jsonify({
        "budget": budget["monthly_budget"] if budget else 0,
        "spent": float(spent)
    })

@app.route("/export-expenses")
def export_expenses():

    if "user_id" not in session:
        return redirect(url_for("home"))

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            title,
            amount,
            category,
            expense_date
        FROM expenses
        WHERE user_id=%s
        ORDER BY expense_date DESC
    """, (session["user_id"],))

    expenses = cursor.fetchall()

    connection.close()

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Title",
        "Amount",
        "Category",
        "Date"
    ])

    for expense in expenses:

        writer.writerow([
            expense["title"],
            expense["amount"],
            expense["category"],
            expense["expense_date"]
        ])

    response = make_response(output.getvalue())

    filename = f"ExpenseTracker_{datetime.now().strftime('%Y-%m-%d')}.csv"
    response.headers["Content-Disposition"] = \
        f"attachment; filename={filename}"

    response.headers["Content-Type"] = "text/csv"

    return response

@app.route("/settings")
def settings():

    if "user_id" not in session:
        return redirect(url_for("home"))

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            name,
            email
        FROM users
        WHERE id=%s
        """,
        (session["user_id"],)
    )

    user = cursor.fetchone()

    connection.close()

    return render_template(
        "settings.html",
        user_name=user["name"],
        user_email=user["email"]
    )

@app.route("/update-profile", methods=["PUT"])
def update_profile():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    name = data["name"]
    email = data["email"]

    connection = get_connection()
    cursor = connection.cursor()

    # Check if another user already uses this email
    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email=%s
        AND id!=%s
        """,
        (
            email,
            session["user_id"]
        )
    )

    existing = cursor.fetchone()

    if existing:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Email already in use."
        })

    cursor.execute(
        """
        UPDATE users
        SET
            name=%s,
            email=%s
        WHERE id=%s
        """,
        (
            name,
            email,
            session["user_id"]
        )
    )

    connection.commit()

    connection.close()

    session["user_name"] = name

    return jsonify({
        "success": True,
        "message": "Profile updated successfully!"
    })

@app.route("/change-password", methods=["PUT"])
def change_password():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    current_password = data["currentPassword"]
    new_password = data["newPassword"]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT password
        FROM users
        WHERE id=%s
        """,
        (session["user_id"],)
    )

    user = cursor.fetchone()

    if not check_password_hash(
        user["password"],
        current_password
    ):

        connection.close()

        return jsonify({
            "success": False,
            "message": "Current password is incorrect."
        })

    hashed_password = generate_password_hash(new_password)

    cursor.execute(
        """
        UPDATE users
        SET password=%s
        WHERE id=%s
        """,
        (
            hashed_password,
            session["user_id"]
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Password updated successfully!"
    })

if __name__ == "__main__":
    app.run(debug=True) 