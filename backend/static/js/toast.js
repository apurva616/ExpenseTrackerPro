function showToast(message, type = "success") {

    const rootStyles = getComputedStyle(document.documentElement);

    let background;

    switch (type) {
        case "success":
            background = rootStyles.getPropertyValue("--success").trim();
            break;
        case "error":
            background = rootStyles.getPropertyValue("--danger").trim();
            break;
        case "warning":
            background = rootStyles.getPropertyValue("--warning").trim();
            break;
        default:
            background = rootStyles.getPropertyValue("--info").trim();
    }

    const radius = rootStyles.getPropertyValue("--radius").trim() || "12px";

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        stopOnFocus: true,
        style: {
            background: background,
            borderRadius: radius
        }
    }).showToast();
}