function showToast(message, type = "success") {

    let background;

    switch (type) {

        case "success":
            background = "#22C55E";
            break;

        case "error":
            background = "#EF4444";
            break;

        case "warning":
            background = "#F59E0B";
            break;

        default:
            background = "#3B82F6";

    }

    Toastify({

        text: message,

        duration: 3000,

        gravity: "top",

        position: "right",

        close: true,

        stopOnFocus: true,

        style: {
            background: background,
            borderRadius: "12px"
        }

    }).showToast();

}