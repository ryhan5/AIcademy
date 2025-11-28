import { NextResponse } from 'next/server';
import { searchYouTubeVideos } from '@/lib/youtubeService';

/**
 * Test endpoint to verify YouTube API integration
 * Access via: http://localhost:3000/api/test-youtube?q=react+hooks+tutorial
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || 'React hooks tutorial';

        console.log('Testing YouTube API with query:', query);

        // Test the YouTube service
        const videos = await searchYouTubeVideos(query, 2);

        if (!videos || videos.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No videos found. Check YouTube API key and quota.',
                query,
                apiKeyConfigured: !!process.env.YOUTUBE_API_KEY,
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'YouTube API is working!',
            query,
            videosFound: videos.length,
            videos: videos.map(v => ({
                videoId: v.videoId,
                title: v.title,
                creator: v.creator,
                duration: v.duration,
                embedUrl: `https://www.youtube.com/embed/${v.videoId}`,
                watchUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            })),
        });
    } catch (error) {
        console.error('YouTube API test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            apiKeyConfigured: !!process.env.YOUTUBE_API_KEY,
        }, { status: 500 });
    }
}
