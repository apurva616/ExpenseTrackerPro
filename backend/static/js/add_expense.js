const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", async function(event){

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const expense_date = document.getElementById("expense_date").value;

    if (!title || !amount || !category || !expense_date) {
        alert("Please fill all fields.");
        return;
    }

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
            alert(data.message);
            window.location.href = "/dashboard";
        } else {
            alert(data.message);
        }

    }catch(error){

        console.error(error);

        alert("Something went wrong.");

    }

});