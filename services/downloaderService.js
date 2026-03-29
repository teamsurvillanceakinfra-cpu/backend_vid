import youtubedl from 'youtube-dl-exec';

/**
 * Extracts video metadata and download links securely using yt-dlp wrapper.
 * @param {string} url - The video URL to parse.
 * @returns {Promise<Object>} Metadata payload format
 */
export const extractVideoInfo = async (rawUrl) => {
  try {
    let url = rawUrl;
    try {
      const parsed = new URL(url);
      // Strip tracking parameters which cause Windows CMD injection errors
      parsed.searchParams.delete('igsh');
      parsed.searchParams.delete('igshid');
      if (parsed.hostname.includes('instagram.com')) {
        parsed.search = '';
      }
      url = parsed.toString();
      
      // Fallback: Drop any remaining ampersands to avoid shell crashes unconditionally
      if (url.includes('&')) {
        url = url.split('&')[0];
      }
    } catch (e) {}

    // Run youtube-dl-exec to fetch info as JSON without downloading the file
    // Assumes target machine can fetch/access standard yt-dlp binaries
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      noPlaylist: true, // changes new
      forceIpv4: true, // Prevents extremely slow IPv6 fallback timeouts on servers new
    });

    // Extract core metadata
    const platform = info.extractor_key || 'Unknown';
    
    // Normalize and filter valid qualities
    const qualityOptions = (info.formats || [])
      .filter(f => f.url && f.vcodec !== 'none' && f.acodec !== 'none') // Ensure video + audio
      .map(f => ({
        formatId: f.format_id,
        resolution: f.resolution || (f.height ? `${f.height}p` : 'Video'),
        ext: f.ext,
        url: f.url,
        videoOnly: false,
        audioOnly: false,
        height: f.height || 0
      }))
      // Sort: Better resolution first, prefer MP4 if resolutions are equal
      .sort((a, b) => {
        if (b.height !== a.height) return (b.height || 0) - (a.height || 0);
        if (a.ext === 'mp4' && b.ext !== 'mp4') return -1;
        if (a.ext !== 'mp4' && b.ext === 'mp4') return 1;
        return 0;
      })
      .slice(0, 3); // Limit to top 3


    return {
      platform,
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      qualityOptions,
      originalUrl: url
    };
  } catch (error) {
    console.error('YT-DLP Error Output:', error.message || error);
    throw new Error('Extraction failed: ' + (error.message || 'Unknown error'));
  }
};
