import { clearToken, getToken, saveToken } from "./auth.js";
import { renderChartPlaceholders } from "./charts/svgCharts.js"
import { signIn, validateToken } from "./api.js";
import { appState, setAuthStatus, setView } from "./state.js";
import { bindLoginForm, setLoginBusy, setLoginMessage } from "./views/loginView.js";
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

async function handleLoginAttempt ({ identifier, password }) {
    if (!identifier || !password) {
        setLoginMessage("Enter both identifier and password.");
        return
    }

    setLoginMessage("");
    setLoginBusy(true);
    setAuthStatus("authenticating", null, null);

    try {
        const token = await signIn(identifier, password);

        saveToken(token);
        setAuthStatus("authenticated", token, null);
        setView("profile");
        render();
    } catch (error) {
        setAuthStatus("auth-error", null, error.message);
        setLoginMessage(error.message || "Login failed.");
    } finally {
        setLoginBusy(false);
    }
}

function handleLogout() {
    clearToken();
    setAuthStatus("unauthenticated", null, null);
    setView("login");
    setLoginMessage("");
    render();
}

async function bootstrap() {
    bindLoginForm(handleLoginAttempt);
    bindLogout(handleLogout);
    renderChartPlaceholders();
   
    const existingToken = getToken();
    
    if (!existingToken) {
        setView("login");
        render();
        return;
    }

    setAuthStatus("authenticating", existingToken, null);
    const stillValid = await validateToken(existingToken);

    if (stillValid) {
        setAuthStatus("authenticated", existingToken, null);
        setView("profile");
    } else {
        clearToken();
        setAuthStatus("unauthenticated", null, null);
        setView("login");
        setLoginMessage("Session expired. Please sign in again.");
    }

    render();
}

bootstrap();