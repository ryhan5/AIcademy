/**
 * YouTube Data API v3 Service
 * Fetches real, playable videos for course content
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Search for YouTube videos by query
 * @param {string} query - Search query (e.g., "React hooks tutorial")
 * @param {number} maxResults - Maximum number of results (default: 2)
 * @returns {Promise<Array>} Array of video objects with id, title, channelTitle, duration
 */
export async function searchYouTubeVideos(query, maxResults = 2) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.error('YouTube API key not found in environment variables');
        return [];
    }

    try {
        // Search for videos
        const searchUrl = `${YOUTUBE_API_BASE}/search?` + new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: maxResults,
            videoEmbeddable: 'true', // Only embeddable videos
            videoSyndicated: 'true',
            order: 'relevance',
            relevanceLanguage: 'en',
            safeSearch: 'strict',
            key: apiKey,
        });

        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            console.error('YouTube API search error:', errorData);
            return [];
        }

        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            console.warn(`No videos found for query: ${query}`);
            return [];
        }

        // Get video IDs
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // Fetch video details (including duration and embedding info)
        const detailsUrl = `${YOUTUBE_API_BASE}/videos?` + new URLSearchParams({
            part: 'snippet,contentDetails,status',
            id: videoIds,
            key: apiKey,
        });

        const detailsResponse = await fetch(detailsUrl);

        if (!detailsResponse.ok) {
            console.error('YouTube API details error');
            return [];
        }

        const detailsData = await detailsResponse.json();

        // Format and filter results
        const videos = detailsData.items
            .filter(video => {
                // Only include embeddable videos
                return video.status.embeddable === true;
            })
            .map(video => ({
                videoId: video.id,
                title: video.snippet.title,
                creator: video.snippet.channelTitle,
                duration: formatDuration(video.contentDetails.duration),
                thumbnail: video.snippet.thumbnails.high.url,
                searchQuery: query, // Keep as fallback
            }));

        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}

/**
 * Convert ISO 8601 duration to readable format
 * @param {string} isoDuration - ISO 8601 duration (e.g., "PT15M33S")
 * @returns {string} Readable duration (e.g., "15min", "1hr 23min")
 */
function formatDuration(isoDuration) {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return '';

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    if (hours > 0) {
        return `${hours}hr${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else if (minutes > 0) {
        return `${minutes}min`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Get video details by video ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object|null>} Video object or null if not found
 */
export async function getVideoDetails(videoId) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.error('YouTube API key not found');
        return null;
    }

    try {
        const url = `${YOUTUBE_API_BASE}/videos?` + new URLSearchParams({
            part: 'snippet,contentDetails,status',
            id: videoId,
            key: apiKey,
        });

        const response = await fetch(url);

        if (!response.ok) {
            console.error('YouTube API error fetching video details');
            return null;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return null;
        }

        const video = data.items[0];

        return {
            videoId: video.id,
            title: video.snippet.title,
            creator: video.snippet.channelTitle,
            duration: formatDuration(video.contentDetails.duration),
            thumbnail: video.snippet.thumbnails.high.url,
            embeddable: video.status.embeddable,
        };
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
}
