export default async function apiRequest(url, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.error || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.details = data.details || null;
            error.response = data;
            throw error;
        }

        return data;
    } catch (error) {
        if (!error.status) {
            error.status = 0;
            error.message = error.message || 'Network error or invalid response';
        }
        throw error;
    }
}
