import { SPOTIFY_API, logAPIRequest } from '../config/spotifyAPI';

// Store the current access token in memory
let cachedAccessToken = null;
let tokenExpiryTime = null;


export const getSpotifyAccessToken = async () => {
    try {
        // Check if we have a valid cached token
        if (cachedAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
            console.log('[Spotify Auth] Using cached token');
            return cachedAccessToken;
        }

        console.log('[Spotify Auth] Fetching new access token...');

        const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
        const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

        const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
        const encodedCredentials = btoa(credentials); // Base64 encode

        console.log('[Spotify Auth] Client ID:', CLIENT_ID);

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${encodedCredentials}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Spotify Auth] Token request failed:', errorData);

            console.log('\n⚠️ Check your credentials in .env file');

            throw new Error(`Failed to get access token: ${response.status}`);
        }

        const data = await response.json();

        // Cache the token
        cachedAccessToken = data.access_token;
        // Set expiry time (token expires in 3600 seconds, we'll refresh 5 minutes early)
        tokenExpiryTime = Date.now() + ((data.expires_in - 300) * 1000);

        console.log('[Spotify Auth] ✅ New token obtained');
        // console.log('🔑 ACCESS TOKEN:');
        console.log(cachedAccessToken);
        console.log('[Spotify Auth] Expires in:', data.expires_in, 'seconds');

        return cachedAccessToken;
    } catch (error) {
        console.error('[Spotify Auth] getSpotifyAccessToken failed:', error);
        throw error;
    }
};


export const clearCachedToken = () => {
    cachedAccessToken = null;
    tokenExpiryTime = null;
    console.log('[Spotify Auth] Cached token cleared');
};

export const searchMoodPlaylists = async (mood, token = null, limit = 20, options = {}) => {
    try {
        console.log(`[Spotify] Searching playlists for mood: ${mood}`);

        if (!mood) {
            throw new Error('Mood is required');
        }

        // If no token provided, try to get one
        if (!token) {
            token = await getSpotifyAccessToken();
        }

        const endpoint = SPOTIFY_API.searchPlaylists(mood, limit, options);

        // for Postman testing
        // logAPIRequest(endpoint, token); --- uncomment stuff from sporifyAPIs page

        const startTime = Date.now();

        const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const duration = Date.now() - startTime;
        console.log(`[Spotify] Request completed in ${duration}ms`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Spotify] API Error:', errorData);

            // If token is invalid, clear the cache
            if (response.status === 401) {
                clearCachedToken();
                console.log('\n⚠️ Token expired or invalid!');
                // console.log('Get a new token from: https://developer.spotify.com/console/get-search-item/');
            }

            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();

        // Filter out null items (Spotify sometimes returns null in the array)
        const validPlaylists = (data.playlists?.items || []).filter(item => item !== null);

        console.log(`[Spotify] ✅ Found ${validPlaylists.length} valid playlists (filtered out nulls)`);

        return validPlaylists;
    } catch (error) {
        console.error('[Spotify] searchMoodPlaylists failed:', error);
        throw error;
    }
};

export const getPlaylistTracks = async (playlistId, token = null, limit = 50) => {
    try {
        console.log(`[Spotify] Getting tracks for playlist: ${playlistId}`);

        // If no token provided, try to get one
        if (!token) {
            token = await getSpotifyAccessToken();
        }

        const endpoint = SPOTIFY_API.getPlaylistTracks(playlistId, limit, options);

        // Log API request for Postman testing
        logAPIRequest(endpoint, token);

        const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Spotify] API Error:', errorData);

            // If token is invalid, clear the cache
            if (response.status === 401) {
                clearCachedToken();
            }

            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[Spotify] ✅ Found ${data.items?.length || 0} tracks`);

        return data.items || [];
    } catch (error) {
        console.error('[Spotify] getPlaylistTracks failed:', error);
        throw error;
    }
};
