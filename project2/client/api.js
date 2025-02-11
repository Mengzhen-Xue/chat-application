export const login = (username) => {
    return fetch('/api/v1/users/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
    });
};

export const getUsers = () => {
    return fetch('/api/v1/users')
    .then(response => {
        if (!response.ok) {
            throw new Error('Unauthorized');
        }
        return response.json();
    });
};

export const getMessages = () => {
    return fetch('/api/v1/messages')
    .then(response => {
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
    });
};


  export const postMessage = (content) => {
    return fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(`${response.status}: ${err.error}`);
            });
        }
        return response.json();
    })
    .catch(error => {
        console.error("Error posting message:", error);
        throw error;
    });
};

export const logout = () => {
    return fetch('/api/v1/users/session', {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Logout failed');
        }
        return response.status === 204 ? Promise.resolve() : response.json();
    })
    .catch(error => {
        console.error("Error during logout:", error);
        throw error;
    });
};

