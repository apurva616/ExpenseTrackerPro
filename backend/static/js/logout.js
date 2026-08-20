const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const rootStyles = getComputedStyle(document.documentElement);

        const result = await Swal.fire({
            title: "Logout?",
            text: "You will need to login again.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: rootStyles.getPropertyValue("--primary").trim(),
            cancelButtonColor: rootStyles.getPropertyValue("--text-secondary").trim(),
            confirmButtonText: "Logout"
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch("/logout", {
                method: "POST"
            });
            const data = await response.json();
            showToast(data.message, "success");
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (error) {
            console.error(error);
            showToast("Logout failed.", "error");
        }
    });
}