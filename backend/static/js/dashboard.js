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
        console.log("expenseList element:", expenseList);
        expenseList.innerHTML = "";

        let total = 0;
        let monthly = 0;

        const categories = new Set();
        const categoryTotals = {};

        const today = new Date();

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (expenses.length === 0) {
            expenseList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <h2>No Expenses Yet</h2>
                    <p>
                        Add your first expense to start tracking your spending.
                    </p>
                    <button onclick="window.location.href='/add-expense'">
                        + Add First Expense
                    </button>
                </div>
            `;
            console.log("expenseList cleared");

            document.getElementById("totalExpense").textContent = "₹0.00";
            document.getElementById("monthlyExpense").textContent = "₹0.00";
            document.getElementById("categoryCount").textContent = "0";

            const chartCanvas = document.getElementById("categoryChart");

            chartCanvas.style.display = "none";

            const oldMessage = document.getElementById("emptyChartMessage");

            if (!oldMessage) {
                chartCanvas.insertAdjacentHTML(
                    "afterend",
                    `
                    <div id="emptyChartMessage" class="empty-chart">
                        📊 <br>
                        No expense data yet.<br>
                        Add your first expense to see spending by category.
                    </div>
                    `
                );
            }
            return;
        }
        expenses.forEach(expense => {

            total += Number(expense.amount);

            categories.add(expense.category);
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }

            categoryTotals[expense.category] += Number(expense.amount);

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

        const chartCanvas = document.getElementById("categoryChart");

        chartCanvas.style.display = "block";

        const oldMessage = document.getElementById("emptyChartMessage");

        if (oldMessage) {
            oldMessage.remove();
        }

        if (window.categoryChart instanceof Chart) {
            window.categoryChart.destroy();
        }

        window.categoryChart = new Chart(chartCanvas, {
            type: "pie",
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });

    } catch (error) {
            console.error(error);
            alert(error.message);
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

        showToast(data.message, "success");

        await loadExpenses();

    } catch (error) {
        console.error(error);
        showToast("Failed to delete expense.", "error");
    }
}

function editExpense(id) {
    window.location.href = `/edit-expense/${id}`;
}
