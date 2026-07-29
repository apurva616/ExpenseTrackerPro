const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function(event){

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const expense_date = document.getElementById("expense_date").value;

    if (!title || !amount || !category || !expense_date) {
        showToast("Please fill all fields.", "warning");
        return;
    }

    const submitButton = expenseForm.querySelector("button");

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try{

        const response = await fetch("/add-expense",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
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
            }, 1200);

        } else {
            submitButton.disabled = false;
            submitButton.textContent = "Add Expense";
            showToast(data.message, "error");
        }

    }catch(error){

        console.error(error);
        submitButton.disabled = false;
        submitButton.textContent = "Add Expense";
        showToast("Something went wrong.", "error");

    }

});