const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const result = await Swal.fire({
            title: "Logout?",
            text: "You will need to login again.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#7C8CF8",
            cancelButtonColor: "#64748B",
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
