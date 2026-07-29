const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    const response = await fetch("/logout", {
        method: "POST"
    });

    const data = await response.json();

    alert(data.message);

    window.location.href = "/";
});

async function loadAnalytics() {

    const response = await fetch("/expenses");
    const expenses = await response.json();

    let total = 0;
    let monthly = 0;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const categoryTotals = {};
    const monthlyTotals = {};

    expenses.forEach(expense => {

        const amount = Number(expense.amount);

        total += amount;

        const expenseDate = new Date(expense.expense_date);

        if (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
        ) {
            monthly += amount;
        }

        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += amount;

        const month = expenseDate.toLocaleString("default", {
            month: "short"
        });

        if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
        }

        monthlyTotals[month] += amount;

    });

    document.getElementById("analyticsTotal").textContent =
        `₹${total.toFixed(2)}`;

    document.getElementById("analyticsMonth").textContent =
        `₹${monthly.toFixed(2)}`;

    let topCategory = "-";

    if (Object.keys(categoryTotals).length > 0) {

        topCategory = Object.keys(categoryTotals).reduce((a, b) =>
            categoryTotals[a] > categoryTotals[b] ? a : b
        );

    }

    document.getElementById("topCategory").textContent = topCategory;

    new Chart(document.getElementById("categoryChart"), {

        type: "pie",

        data: {

            labels: Object.keys(categoryTotals),

            datasets: [{

                data: Object.values(categoryTotals),

                backgroundColor: [
                    "#60A5FA",
                    "#34D399",
                    "#FBBF24",
                    "#F87171",
                    "#A78BFA",
                    "#FB7185",
                    "#22D3EE",
                    "#F97316"
                ]

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

    new Chart(document.getElementById("monthlyChart"), {

        type: "bar",

        data: {

            labels: Object.keys(monthlyTotals),

            datasets: [{

                label: "Monthly Spending",

                data: Object.values(monthlyTotals),

                backgroundColor: "#7C8CF8",

                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

loadAnalytics();