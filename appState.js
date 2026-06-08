export const appState = {
    auth: {
        status: "unauthenticated",
        token: null,
        error: null
    },
    view: "login",
    data: {
        status: "idle",
        profile: null,
        error: null
    }
};

export function setView(view) {
    appState.view = view;
}

export function setAuthStatus(status, token = null, error = null) {
    appState.auth.status = status;
    appState.auth.token = token;
    appState.auth.error = error;
}