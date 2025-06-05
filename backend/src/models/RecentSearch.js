const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     RecentSearch:
 *       type: object
 *       required:
 *         - userId
 *         - term
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the recent search
 *         userId:
 *           type: string
 *           description: ID of the user who made the search
 *         term:
 *           type: string
 *           description: The search term used
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the search was made
 *       example:
 *         _id: \"60d0fe4f5311236168a109cc\"
 *         userId: \"60d0fe4f5311236168a109ca\"
 *         term: \"landscapes\"
 *         createdAt: \"2023-01-01T12:00:00.000Z\"
 */
const RecentSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  term: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Optional: Index for faster querying and sorting by user and creation date
RecentSearchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RecentSearch', RecentSearchSchema);