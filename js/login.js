const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    // Prevent page refresh
    event.preventDefault();

    // Get input values
    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    // Check if fields are empty
    if (email === "" || password === "") {

        alert("Please fill in all fields.");

        return;
    }

    // Success message (temporary)
    console.log(email);
    console.log(password);

});