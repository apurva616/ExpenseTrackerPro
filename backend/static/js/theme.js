if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) return;

    themeToggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {

            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️";

        } else {

            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙";

        }

    });

});