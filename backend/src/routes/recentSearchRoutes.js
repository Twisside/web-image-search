const express = require('express');
const router = express.Router();
const { getRecentSearches, addRecentSearch, clearAllRecentSearches } = require('../controllers/recentSearchController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: RecentSearches
 *   description: User's recent search terms management
 */

/**
 * @swagger
 * /recent-searches:
 *   get:
 *     summary: Get recent search terms for the logged-in user
 *     tags: [RecentSearches]
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
 *         description: A list of recent searches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RecentSearch'
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
router.get('/', protect, getRecentSearches);

/**
 * @swagger
 * /recent-searches:
 *   post:
 *     summary: Add a new search term to recent searches
 *     tags: [RecentSearches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               term:
 *                 type: string
 *             example:
 *               term: \"nature wallpapers\"
 *     responses:
 *       201:
 *         description: Search term added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecentSearch'
 *       400:
 *         description: Invalid input (e.g., empty term)
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, addRecentSearch);

/**
 * @swagger
 * /recent-searches/all:
 *   delete:
 *     summary: Clear all recent search terms for the logged-in user
 *     tags: [RecentSearches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All recent searches cleared successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/all', protect, clearAllRecentSearches);

module.exports = router;