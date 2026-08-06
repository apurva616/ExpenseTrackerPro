const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        showToast("Please fill in all fields.", "warning");
        return;
    }

    const submitButton = registerForm.querySelector("button");

    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, "success");
            setTimeout(() => {
                window.location.href = "/";
            }, 1200);
        } else {
            submitButton.disabled = false;
            submitButton.textContent = "Create Account";
            showToast(data.message, "error");
        }

    } catch (error) {
        console.error(error);
        submitButton.disabled = false;
        submitButton.textContent = "Create Account";
        showToast("Something went wrong.", "error");
    }
});