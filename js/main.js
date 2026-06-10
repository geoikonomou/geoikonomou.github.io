import { clearToken, getToken, saveToken } from "./auth.js";
import { renderChartPlaceholders, renderCharts } from "./charts/svgCharts.js"
import { fetchProfileData, signIn, validateToken } from "./api.js";
import { appState, setAuthStatus, setDataState, setView } from "./state.js";
import { bindLoginForm, setLoginBusy, setLoginMessage } from "./views/loginView.js";
import { bindLogout } from "./views/profileView.js"
import { formatRatio, formatBytes } from "./format.js";


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

function setProfileMessage(message) {
    const el = document.getElementById("profile-message");
    if (el) el.textContent = message;
}

function renderProfileData(profileData) {
    const identityEl = document.getElementById("identity-content");
    const performanceEl = document.getElementById("performance-content");
    const progressEl = document.getElementById("progress-content");

    const user = profileData.user && profileData.user[0] ? profileData.user[0] : null;
    const xpTotal = profileData.transaction_aggregate?.aggregate?.sum?.amount || 0;
    const xpCount = profileData.transaction_aggregate?.aggregate?.count || 0;
    const passCount = profileData.progress_pass?.aggregate?.count || 0;
    const failCount = profileData.progress_fail?.aggregate?.count || 0;
    const formattedRatio = formatRatio(user?.auditRatio, 1);

    if (identityEl) {
        identityEl.innerHTML = [
            "<p><strong>Login:</strong> " + (user?.login || "N/A") + "</p>",
            "<p><strong>User ID:</strong> " + (user?.id ?? "N/A") + "</p>",
            "<p><strong>Audit Ratio:</strong> " + formattedRatio + "</p>"
        ].join("");
    }

    if (performanceEl) {
        performanceEl.innerHTML = [
            "<p><strong>Total XP:</strong> " + formatBytes(xpTotal) + "</p>",
            "<p><strong>XP Transactions:</strong> " + xpCount + "</p>"
        ].join("");
    }

    if (progressEl) {
        const total = passCount + failCount;
        const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : "0.0";

        progressEl.innerHTML = [
            "<p><strong>Pass Count:</strong> " + passCount + "</p>",
            "<p><strong>Fail Count:</strong> " + failCount + "</p>",
            "<p><strong>Pass Rate:</strong> " + passRate + "%</p>"
        ].join("");
    }

    renderCharts(profileData);
}

async function loadProfile(token) {
    setDataState("loading", null, null);
    setProfileMessage("Loading profile data...")

    try {
        const profileData = await fetchProfileData(token);
        setDataState("loaded", profileData, null);
        renderProfileData(profileData);
        setProfileMessage("");
    } catch (error) {
        setDataState("error", null, error.message || "Failed to load profile data.");
        setProfileMessage(error.message || "Failed to load profile data.");

        if ((error.message || "").toLowerCase().includes("unauthorized")) {
            handleLogout();
        }
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
        await loadProfile(token);
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
    setDataState("idle", null, null);
    setView("login");
    setLoginMessage("");
    setProfileMessage("");
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

   if (!stillValid) {
    clearToken();
    setAuthStatus("unauthenticated", null, null);
    setView("login");
    setLoginMessage("Session expired. Please sign in again");
    render();
    return;
   }

   setAuthStatus("authenticated", existingToken, null);
   setView("profile");
   render();
   await loadProfile(existingToken);
}



bootstrap();