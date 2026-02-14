export const getEmbedUrl = (url?: string, type?: string) => {
    if (!url) return null;

    if (type === 'YOUTUBE') {
        // Extract ID (simple regex for v= parameter)
        const match = url.match(/[?&]v=([^&]+)/);
        const videoId = match ? match[1] : null;
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?playsinline=1`;
        }
    }

    if (type === 'TWITCH') {
        // Twitch embed mostly for web, simpler to just use generic URL or specific embed construction
        // For now, return URL as is, WebView handles it
        return url;
    }

    return url;
};
