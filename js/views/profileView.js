export function bindLogout(onLogout) {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", onLogout)
}