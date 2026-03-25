import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';


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
      cookies: './cookies.txt', // ✅ IMPORTANT

        // 🔥 KEY PART
  extractorArgs: [
    'youtube:player_client=android'
  ],

  addHeader: [
    'user-agent:com.google.android.youtube/17.31.35 (Linux; U; Android 11)'
  ],
    });

    // Extract core metadata
    const platform = info.extractor_key || 'Unknown';
    
    // Normalize and filter valid qualities
    const qualityOptions = (info.formats || [])
      .filter(f => f.url && (f.vcodec !== 'none' || f.acodec !== 'none'))
      .map(f => ({
        formatId: f.format_id,
        resolution: f.resolution || (f.height ? `${f.height}p` : 'Audio/Unknown'),
        ext: f.ext,
        url: f.url,
        videoOnly: f.acodec === 'none',
        audioOnly: f.vcodec === 'none'
      }))
      // Sort roughly: multiplexed formats first
      .sort((a, b) => {
        if (!a.videoOnly && !a.audioOnly && (b.videoOnly || b.audioOnly)) return -1;
        if ((a.videoOnly || a.audioOnly) && !b.videoOnly && !b.audioOnly) return 1;
        return 0;
      });

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
