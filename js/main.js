import { clearToken, getToken } from "./auth.js";
import { renderChartPlaceholders } from "./charts/svgCharts.js"
import { appState, setAuthStatus, setView } from "./state.js";
import { bindLoginForm, setLoginMessage } from "./views/loginView.js";
import { bindLogout } from "./views/profileView.js"


function render() {
    const loginView = document.getElementById("login-view");
    const profileView = document.getElementById("profile-view");

    if (appState.view === "login") {
        loginView.classList.remove("hidden");
        profileView.classList.add("hidden");
    } else {
        profileView.classList.remove("hidden");
        loginView.classList.add("hidden");
    }
}

function handleLoginAttempt ({ identifier, password }) {
    if (!identifier || !password) {
        setLoginMessage("Enter both identifier and password.");
        return
    }

    setLoginMessage("");
    setAuthStatus("authenticated", "step1-local-token", null);
    setView("profile");
    render();
}

function handleLogout() {
    clearToken();
    setAuthStatus("unauthenticated", null, null);
    setView("login");
    setLoginMessage("");
    render();
}

function bootstrap() {
    const existingToken = getToken();
    if (existingToken) {
        setAuthStatus("authenticated", existingToken, null);
        setView("profile");
    }

    bindLoginForm(handleLoginAttempt);
    bindLogout(handleLogout);
    renderChartPlaceholders();
    render();
}

bootstrap();