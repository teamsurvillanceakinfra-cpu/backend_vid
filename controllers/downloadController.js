import { extractVideoInfo } from '../services/downloaderService.js';

// @desc    Process a URL to extract downloadable video links actively
// @route   POST /api/download
// @access  Public
export const processDownload = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400);
      throw new Error('Please provide a strictly valid URL parameter.');
    }

    try {
      new URL(url);
    } catch (e) {
      res.status(400);
      throw new Error('Invalid URL format supplied. Link incorrectly formatted.');
    }

    const videoData = await extractVideoInfo(url);

    res.status(200).json({
      status: 'success',
      message: 'Video metadata successfully aggregated by extraction engine.',
      data: videoData
    });

  } catch (error) {
    next(error);
  }
};
