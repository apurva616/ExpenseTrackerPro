const form = document.getElementById("editExpenseForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();
    const id = document.getElementById("expenseId").value;
    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const expense_date = document.getElementById("expense_date").value;

    if (!title || !amount || !category || !expense_date) {
        showToast("Please fill all fields.", "warning");
        return;
    }

    try {
        const response = await fetch(`/update-expense/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                amount,
                category,
                expense_date
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, "success");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
        } else {
            showToast(data.message, "error");
        }

    } catch (error) {
        console.error(error);
        showToast("Something went wrong while updating the expense.", "error");
    }
});