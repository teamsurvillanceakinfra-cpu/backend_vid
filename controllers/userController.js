import Download from '../models/Download.js';

// @desc    Get logged in user history
// @route   GET /api/user/history
// @access  Private
export const getHistory = async (req, res, next) => {
  try {
    const history = await Download.find({ user: req.user.id })
                                 .sort({ createdAt: -1 })
                                 .limit(50); // Optional safeguard limit
    res.status(200).json({ status: 'success', count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a successful download to history ledger
// @route   POST /api/user/save-download
// @access  Private
export const saveDownload = async (req, res, next) => {
  try {
    const { originalUrl, platform, title, thumbnail, qualitySelected } = req.body;

    if (!originalUrl || !platform) {
      res.status(400);
      throw new Error('Missing URL or Platform attributes');
    }

    const download = await Download.create({
      user: req.user.id,
      originalUrl,
      platform,
      title,
      thumbnail,
      qualitySelected,
    });

    res.status(201).json({ status: 'success', data: download });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences (language, theme)
// @route   PATCH /api/user/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { language, theme } = req.body;
    
    req.user.preferences.language = language || req.user.preferences.language;
    req.user.preferences.theme = theme || req.user.preferences.theme;
    
    await req.user.save();
    
    res.status(200).json({ status: 'success', data: req.user.preferences });
  } catch (error) {
    next(error);
  }
};
