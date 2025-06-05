const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, clearAllFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: User's favorite images management
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get all favorites for the logged-in user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getFavorites);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add a new image to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageId:
 *                 type: string
 *               title:
 *                 type: string
 *               url_s:
 *                 type: string
 *               url_m:
 *                 type: string
 *               source:
 *                 type: string
 *             example:
 *               imageId: \"flickr_67890\"
 *               title: \"Mountain View\"
 *               url_s: \"http://example.com/view_s.jpg\"
 *               url_m: \"http://example.com/view_m.jpg\"
 *               source: \"Pexels\"
 *     responses:
 *       201:
 *         description: Favorite added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Image already in favorites
 */
router.post('/', protect, addFavorite);

/**
 * @swagger
 * /favorites/all:
 *   delete:
 *     summary: Clear all favorites for the logged-in user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All favorites cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/all', protect, clearAllFavorites);

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     summary: Remove an image from favorites by its database ID
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the favorite to delete
 *     responses:
 *       204:
 *         description: Favorite removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.delete('/:id', protect, removeFavorite);

module.exports = router;