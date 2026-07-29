const saveBudgetBtn = document.getElementById("saveBudgetBtn");

saveBudgetBtn.addEventListener("click", async () => {

    const budget = Number(document.getElementById("budget").value);

    if (!budget || budget <= 0) {

        showToast("Enter a valid budget.", "warning");
        return;

    }

    try {

        const response = await fetch("/save-budget", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                budget
            })

        });

        const data = await response.json();

        if (data.success) {

            showToast(data.message, "success");

            loadBudget();

        } else {

            showToast(data.message, "error");

        }

    } catch (error) {

        console.error(error);

        showToast("Something went wrong.", "error");

    }

});

async function loadBudget() {

    const response = await fetch("/budget");

    const data = await response.json();

    document.getElementById("budgetAmount").textContent =
        `₹${Number(data.budget).toFixed(2)}`;

    document.getElementById("spentAmount").textContent =
        `₹${Number(data.spent).toFixed(2)}`;

    const remaining = data.budget - data.spent;

    const remainingElement = document.getElementById("remainingAmount");

    remainingElement.textContent = `₹${remaining.toFixed(2)}`;

    if (remaining < 0) {

        remainingElement.style.color = "#dc2626";

    } else {

        remainingElement.style.color = "#16a34a";

    }

    const progressBar = document.getElementById("budgetProgress");
    const progressText = document.getElementById("progressText");

    let percentage = 0;

    if (data.budget > 0) {
        percentage = (data.spent / data.budget) * 100;
    }

    if (percentage > 100) {
        percentage = 100;
    }

    progressBar.style.width = percentage + "%";

    if (percentage < 70) {

        progressBar.style.background = "#4CAF50";

    } else if (percentage < 90) {

        progressBar.style.background = "#FFC107";

    } else {

        progressBar.style.background = "#F44336";

    }

    progressText.textContent = `${percentage.toFixed(1)}% of your budget used`;

    const warning = document.getElementById("budgetWarning");

    if (remaining < 0) {

        warning.textContent = "⚠️ You have exceeded your monthly budget!";
        warning.style.color = "#dc2626";
        warning.style.fontWeight = "600";

    } else {

        warning.textContent = "";

    }

}

loadBudget();