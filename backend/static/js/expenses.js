const expenseList = document.getElementById("expenseList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

async function loadExpenses() {

    try {

        const response = await fetch("/expenses");
        const expenses = await response.json();

        expenseList.innerHTML = "";

        if (expenses.length === 0) {

            expenseList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">💸</div>

                <h2>No Expenses Yet</h2>

                <p>
                    Start tracking your spending by adding your first expense.
                </p>

                <button
                    onclick="window.location.href='/add-expense'">

                    + Add Expense

                </button>

            </div>
            `;

            return;
        }

        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredExpenses = expenses.filter(expense => {

            const matchesSearch =
                expense.title.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "" ||
                expense.category === selectedCategory;

            return matchesSearch && matchesCategory;

        });

        // ==========================
        // SORTING
        // ==========================

        const sortValue = sortFilter.value;

        filteredExpenses.sort((a, b) => {

            switch (sortValue) {

                case "oldest":
                    return new Date(a.expense_date) - new Date(b.expense_date);

                case "highest":
                    return Number(b.amount) - Number(a.amount);

                case "lowest":
                    return Number(a.amount) - Number(b.amount);

                default:
                    return new Date(b.expense_date) - new Date(a.expense_date);

            }

        });

        filteredExpenses.forEach(expense => {

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
                        📅 ${new Date(expense.expense_date).toLocaleDateString(
                            "en-GB",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )}
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

searchInput.addEventListener("input", loadExpenses);
categoryFilter.addEventListener("change", loadExpenses);
sortFilter.addEventListener("change", loadExpenses);