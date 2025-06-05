// api/client.js - Add this new file to your Vue.js project

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ImageSearchClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('auth_token'); // Optional: for authentication
    }

    // Set authentication token
    setAuthToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Search for images
    async searchImages(query, page = 1, perPage = 12) {
        try {
            const params = new URLSearchParams({
                query: query,
                page: page.toString(),
                per_page: perPage.toString()
            });

            const response = await fetch(`${this.baseURL}/search/images?${params}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching images:', error);
            throw error;
        }
    }

    // Get search history
    async getSearchHistory(limit = 30) {
        try {
            const response = await fetch(`${this.baseURL}/search/history?limit=${limit}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting search history:', error);
            throw error;
        }
    }

    // Get popular searches
    async getPopularSearches(limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/search/popular?limit=${limit}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting popular searches:', error);
            throw error;
        }
    }

    // Clear search history
    async clearSearchHistory() {
        try {
            const response = await fetch(`${this.baseURL}/search/history`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error clearing search history:', error);
            throw error;
        }
    }

    // Get API health status
    async getHealthStatus() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Error checking API health:', error);
            throw error;
        }
    }

    // Optional: Login for authentication
    async login(permissions = ['READ', 'WRITE']) {
        try {
            const response = await fetch(`${this.baseURL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ permissions })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.setAuthToken(data.access_token);
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
export const imageSearchClient = new ImageSearchClient();
export default ImageSearchClient;

// Updated search function for your Vue component
// Replace the searchImages function in your App.vue with this:

export async function searchImagesUpdated(query, page = 1) {
    try {
        const result = await imageSearchClient.searchImages(query, page, 12);

        return {
            results: result.results.map(image => ({
                id: image.id,
                title: image.title,
                thumbnail: image.thumbnail,
                fullSize: image.fullSize,
                source: image.source
            })),
            total: result.total
        };
    } catch (error) {
        console.error('Error searching images:', error);
        throw error;
    }
}