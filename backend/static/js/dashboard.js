const addExpenseBtn = document.getElementById("addExpenseBtn");

addExpenseBtn.addEventListener("click", () => {
    window.location.href = "/add-expense";
});

async function loadExpenses() {

    try {

        const response = await fetch("/expenses");

        console.log("Status:", response.status);

        const expenses = await response.json();

        console.log(expenses);

        const expenseList = document.getElementById("expenseList");

        expenseList.innerHTML = "";

        let total = 0;
        let monthly = 0;

        const categories = new Set();

        const today = new Date();

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (expenses.length === 0) {

            expenseList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">👋</div>

                <h2>Welcome to ExpenseTracker Pro</h2>

                <p>

                    You haven't added any expenses yet.

                    Start by adding your first expense and begin tracking your spending.

                </p>

                <button onclick="window.location.href='/add-expense'">

                    + Add First Expense

                </button>

            </div>
            `;

            document.getElementById("totalExpense").textContent = "₹0.00";
            document.getElementById("monthlyExpense").textContent = "₹0.00";
            document.getElementById("categoryCount").textContent = "0";

            return;
        }

        expenses.forEach(expense => {

            total += Number(expense.amount);

            categories.add(expense.category);

            const expenseDate = new Date(expense.expense_date);

            if (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            ) {
                monthly += Number(expense.amount);
            }

            expenseList.innerHTML += `

            <div class="expense-card">

                <div class="expense-left">

                    <h3>${expense.title}</h3>

                    <p>
                        <span class="category-badge ${expense.category.toLowerCase()}">
                            ${expense.category}
                        </span>
                    </p>

                </div>

                <div class="expense-right">

                    <h2>₹${Number(expense.amount).toFixed(2)}</h2>

                    <p>
                    📅 ${new Date(expense.expense_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })}
                    </p>

                    <div class="expense-actions">

                        <button onclick="editExpense(${expense.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})">

                            🗑 Delete

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

        document.getElementById("totalExpense").textContent =
            `₹${total.toFixed(2)}`;

        document.getElementById("monthlyExpense").textContent =
            `₹${monthly.toFixed(2)}`;

        document.getElementById("categoryCount").textContent =
            categories.size;

    } catch (error) {

        console.error(error);
        alert("Failed to load expenses.");

    }

}

loadExpenses();

async function deleteExpense(id) {

    const result = await Swal.fire({
        title: "Delete Expense?",
        text: "This expense will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#64748B",
        confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) {
        return;
    }

    try {

        const response = await fetch(`/delete-expense/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        alert(data.message);

        loadExpenses();

    } catch (error) {

        console.error(error);
        alert("Failed to delete expense.");

    }

}

function editExpense(id) {

    window.location.href = `/edit-expense/${id}`;

}

// ==========================
// THEME
// ==========================

const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeToggle.textContent = "☀️";

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeToggle.textContent = "☀️";

    } else {

        localStorage.setItem("theme", "light");

        themeToggle.textContent = "🌙";

    }

});

// ==========================
// LOGOUT
// ==========================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    const result = await Swal.fire({
        title: "Logout?",
        text: "You will need to login again.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#7C8CF8",
        cancelButtonColor: "#64748B",
        confirmButtonText: "Logout"
    });

    if (!result.isConfirmed) {
        return;
    }

    try {

        const response = await fetch("/logout", {method: "POST"});

        const data = await response.json();

        alert(data.message);

        window.location.href = "/";

    } catch (error) {

        console.error(error);
        alert("Logout failed.");

    }

});