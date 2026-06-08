export function bindLoginForm(onSubmit) {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const identifier = String(formData.get("identifier") || "").trim();
        const password = String(formData.get("password") || "");

        onSubmit({ identifier, password });
    });
}

export function setLoginMessage(message) {
    const messageEl = document.getElementById("login-message");
    messageEl.textContent = message;
}

export function setLoginBusy(isBusy) {
    const form = document.getElementById("login-form");
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy? "Signing in..." : "Sign in";
}