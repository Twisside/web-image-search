const Favorite = require('../models/Favorite');

// GET /api/favorites
// Get all favorites for the logged-in user with pagination
exports.getFavorites = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalFavorites = await Favorite.countDocuments({ userId: req.user._id });

    res.status(200).json({
      data: favorites,
      page,
      limit,
      totalPages: Math.ceil(totalFavorites / limit),
      totalResults: totalFavorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

// POST /api/favorites
// Add a new favorite image
exports.addFavorite = async (req, res) => {
  const { imageId, title, url_s, url_m, source } = req.body;
  if (!imageId || !title) {
    return res.status(400).json({ message: 'imageId and title are required' });
  }

  try {
    const existingFavorite = await Favorite.findOne({ userId: req.user._id, imageId });
    if (existingFavorite) {
      return res.status(409).json({ message: 'Image already in favorites' });
    }

    const newFavorite = new Favorite({
      userId: req.user._id,
      imageId,
      title,
      url_s,
      url_m,
      source
    });
    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (error) {
    res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
};

// DELETE /api/favorites/:id
// Remove a favorite image by its database ID
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ _id: req.params.id, userId: req.user._id });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found or not owned by user' });
    }
    await Favorite.deleteOne({ _id: req.params.id }); // Mongoose 5+, use favorite.remove() for older
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
};

// DELETE /api/favorites/all
// Clear all favorites for the logged-in user
exports.clearAllFavorites = async (req, res) => {
    try {
        await Favorite.deleteMany({ userId: req.user._id });
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Error clearing all favorites', error: error.message });
    }
};