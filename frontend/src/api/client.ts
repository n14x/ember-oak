// Correctly typed headers object and authHeaders function

interface HeadersObject {
    [key: string]: string;
}

const headers: HeadersObject = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

function authHeaders(token: string): HeadersObject {
    return {
        ...headers,
        "Authorization": `Bearer ${token}`,
    };
}

export { headers, authHeaders };