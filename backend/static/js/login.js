const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showToast("Please enter your email and password.", "warning");
        return;
    }

    const submitButton = loginForm.querySelector("button");

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";
        
    try {

        const response = await fetch("/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            window.location.href = "/dashboard";

        } else {

            submitButton.disabled = false;
            submitButton.textContent = "Login";
            showToast(data.message, "error");

        }

        loginForm.reset();
        document.getElementById("email").focus();

    } catch (error) {

        console.error(error);
        submitButton.disabled = false;
        submitButton.textContent = "Login";
        showToast("Login failed.", "error");

    }

});