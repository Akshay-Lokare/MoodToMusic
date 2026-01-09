/**
 * Spotify API Endpoints Configuration
 * Centralized API endpoint management
 */

export const SPOTIFY_API = {
    // Base URLs
    BASE_URL: 'https://api.spotify.com/v1',
    AUTH_URL: 'https://accounts.spotify.com/api/token',

    // Authentication
    getToken: () => ({
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    }),

    // Search
    searchPlaylists: (query, limit = 20) => ({
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`,
        method: 'GET',
    }),

    searchTracks: (query, limit = 20) => ({
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        method: 'GET',
    }),

    searchAll: (query, limit = 20) => ({
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist,track,artist&limit=${limit}`,
        method: 'GET',
    }),

    // Playlists
    getPlaylist: (playlistId) => ({
        url: `https://api.spotify.com/v1/playlists/${playlistId}`,
        method: 'GET',
    }),

    getPlaylistTracks: (playlistId, limit = 50) => ({
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`,
        method: 'GET',
    }),

    // Recommendations
    getRecommendations: (params) => {
        const queryParams = new URLSearchParams(params).toString();
        return {
            url: `https://api.spotify.com/v1/recommendations?${queryParams}`,
            method: 'GET',
        };
    },

    // Browse
    getFeaturedPlaylists: (limit = 20) => ({
        url: `https://api.spotify.com/v1/browse/featured-playlists?limit=${limit}`,
        method: 'GET',
    }),

    getCategories: (limit = 20) => ({
        url: `https://api.spotify.com/v1/browse/categories?limit=${limit}`,
        method: 'GET',
    }),

    getCategoryPlaylists: (categoryId, limit = 20) => ({
        url: `https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=${limit}`,
        method: 'GET',
    }),
};

/**
 * Helper to log API request details for Postman testing
 */
export const logAPIRequest = (endpoint, token = null) => {
    console.log('\n========================================');
    console.log('📡 SPOTIFY API REQUEST');
    console.log('========================================');
    console.log('Method:', endpoint.method);
    console.log('URL:', endpoint.url);

    if (endpoint.headers) {
        console.log('\nHeaders:');
        Object.entries(endpoint.headers).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });
    }

    if (token) {
        console.log('\nAuthorization:');
        console.log(`  Bearer ${token}`);
    }

    if (endpoint.body) {
        console.log('\nBody:');
        console.log(`  ${endpoint.body}`);
    }

    console.log('\n🔧 POSTMAN SETUP:');
    console.log('1. Method:', endpoint.method);
    console.log('2. URL:', endpoint.url);
    if (token) {
        console.log('3. Headers:');
        console.log('   Authorization: Bearer', token);
    }
    console.log('========================================\n');
};
