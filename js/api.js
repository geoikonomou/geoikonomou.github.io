const DOMAIN = "https://((DOMAIN))";
const SIGNIN_URL = DOMAIN + "/api/auth/signin";
const GRAPHQL_URL = DOMAIN + "/api/graphql-engine/v1/graphql";

function toBase64(value) {
    return btoa(value);
}

function parseTokenResponse(rawText) {
    const text = rawText.trim();

    try {
        const parsed = JSON.parse(text);
        if (typeof parsed === "string" && parsed) return parsed;
        if (parsed && typeof parsed.token === "string" && parsed.token) return parsed.token;
    } catch (_) {
        // Not JSON, continue.
    }

    return text;
}

export async function signIn(identifier, password) {
    const credentials = toBase64(identifier + ":" + password);

    const response = await fetch(SIGNIN_URL, {
        method: "POST",
        headers: {
            Authorization: "Basic " + credentials
        }
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid credentials");
    }

    if (!response.ok) {
        throw new Error("Signin failed. Please try again.");
    }

    const raw = await response.text();
    const token =parseTokenResponse(raw);

    if (!token) {
        throw new Error("Signin succeded but token was empty");
    }

    return token
}

export async function graphqlRequest(token, query, variables = {}) {
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ query, variables })
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized")
    }

    if (!response.ok) {
        throw new Error("GraphQL request failed.");
    }

    const payload = await response.json();

    if (payload.errors && payload.errors.lenght > 0) {
        throw new Error(payload.errors[0].message || "GraphQL error");
    }

    return payload.data;
}

export async function validateToken(token) {
    const query = `
        query {
            user {
                id
            }
        }
    `;

    try {
        await graphqlRequest(token, query);
        return true;
    } catch (_) {
        return false;
    }
}