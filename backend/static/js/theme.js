if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) return;

    function setIcon(isDark) {
        themeToggle.innerHTML = isDark
            ? '<i data-lucide="sun"></i>'
            : '<i data-lucide="moon"></i>';
        lucide.createIcons();
    }

    setIcon(document.body.classList.contains("dark"));

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const isDark = document.body.classList.contains("dark");

        localStorage.setItem("theme", isDark ? "dark" : "light");

        setIcon(isDark);
    });
});