const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       required:
 *         - userId
 *         - imageId
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the favorite
 *         userId:
 *           type: string
 *           description: ID of the user who favorited the image
 *         imageId:
 *           type: string
 *           description: ID of the favorited image (from external source)
 *         title:
 *           type: string
 *           description: Title of the image
 *         url_s:
 *           type: string
 *           description: URL to a small version of the image
 *         url_m:
 *           type: string
 *           description: URL to a medium version of the image
 *         source:
 *           type: string
 *           description: Source of the image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the favorite was created
 *       example:
 *         _id: \"60d0fe4f5311236168a109cb\"
 *         userId: \"60d0fe4f5311236168a109ca\"
 *         imageId: \"flickr_12345\"
 *         title: \"Beautiful Sunset\"
 *         url_s: \"http://example.com/image_s.jpg\"
 *         url_m: \"http://example.com/image_m.jpg\"
 *         source: \"Flickr\"
 */
const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageId: { // ID from the external image service
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  url_s: String, // URL for small image / thumbnail
  url_m: String, // URL for medium image / preview
  source: String, // e.g., 'flickr', 'unsplash'
  // Store any other relevant image metadata
}, { timestamps: true });

// Ensure a user cannot favorite the same image multiple times
FavoriteSchema.index({ userId: 1, imageId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);