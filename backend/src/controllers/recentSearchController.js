const RecentSearch = require('../models/RecentSearch');

// GET /api/recent-searches
// Get all recent searches for the logged-in user with pagination
exports.getRecentSearches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10, or whatever makes sense
    const skip = (page - 1) * limit;

    const recentSearches = await RecentSearch.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);
    
    const totalSearches = await RecentSearch.countDocuments({ userId: req.user._id });

    res.status(200).json({
      data: recentSearches,
      page,
      limit,
      totalPages: Math.ceil(totalSearches / limit),
      totalResults: totalSearches
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent searches', error: error.message });
  }
};

// POST /api/recent-searches
// Add a new search term
exports.addRecentSearch = async (req, res) => {
  const { term } = req.body;
  if (!term || term.trim() === '') {
    return res.status(400).json({ message: 'Search term cannot be empty' });
  }

  try {
    // Optional: Prevent duplicate consecutive searches or limit total recent searches stored
    // For simplicity, just add the new search term
    const newSearch = new RecentSearch({
      userId: req.user._id,
      term: term.trim()
    });
    await newSearch.save();
    res.status(201).json(newSearch);
  } catch (error) {
    res.status(500).json({ message: 'Error adding recent search', error: error.message });
  }
};

// DELETE /api/recent-searches/all
// Clear all recent searches for the logged-in user
exports.clearAllRecentSearches = async (req, res) => {
  try {
    await RecentSearch.deleteMany({ userId: req.user._id });
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: 'Error clearing recent searches', error: error.message });
  }
};