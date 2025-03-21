import { patch } from "aws-amplify/api";

export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || '';
};

export const api = {
    get: async (path: string) => {
        const response = await fetch(`${getApiUrl()}${path}`);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    },
    post: async (path: string, data: any) => {
        const response = await fetch(`${getApiUrl()}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        return response.json();
    },
    put: async (path: string, data: any) => {
        const response = await fetch(`${getApiUrl()}${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    },
    delete: async (path: string) => {
        const response = await fetch(`${getApiUrl()}${path}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    },
    patch: async (path: string, data: any) => {
        const response = await fetch(`${getApiUrl()}${path}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }); if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    },
}; 