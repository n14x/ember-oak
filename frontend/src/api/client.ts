function authHeaders(): {[key: string]: string} {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`  // Ensure getToken() returns a valid token
    };
}

const headers = authHeaders();

// Example usage
fetch(url, { headers });