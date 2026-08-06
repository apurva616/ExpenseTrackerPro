const saveProfileBtn = document.getElementById("saveProfile");

saveProfileBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !email) {
        showToast("Please fill in all fields.", "warning");
        return;
    }

    const profileButton = document.getElementById("saveProfile");

    profileButton.disabled = true;
    profileButton.textContent = "Saving...";

    try {
        const response = await fetch("/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, "success");
            profileButton.disabled = false;
            profileButton.textContent = "Save Changes";
        } else {
            profileButton.disabled = false;
            profileButton.textContent = "Save Changes";
            showToast(data.message, "error");
        }

    } catch (error) {
        console.error(error);
        profileButton.disabled = false;
        profileButton.textContent = "Save Changes";
        showToast("Something went wrong.", "error");
    }
});

const changePasswordBtn = document.getElementById("changePassword");

changePasswordBtn.addEventListener("click", async () => {

    const currentPassword =
        document.getElementById("currentPassword").value.trim();

    const newPassword =
        document.getElementById("newPassword").value.trim();

    const confirmPassword =
        document.getElementById("confirmPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("Please fill in all password fields.", "warning");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    changePasswordBtn.disabled = true;
    changePasswordBtn.textContent = "Updating...";

    try {
        const response = await fetch("/change-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(data.message, "success");
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Update Password";

            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        } else {
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = "Update Password";
            showToast(data.message, "error");
        }

    } catch (error) {
        console.error(error);
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = "Update Password";
        showToast("Something went wrong.", "error");
    }
});
