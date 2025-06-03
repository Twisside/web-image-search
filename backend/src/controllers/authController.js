const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, roles) => {
  return jwt.sign({ id, roles }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '3m' // Default to 1 minute if not set
  });
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               roles: 
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional roles for the user (e.g., [\"USER\", \"ADMIN\"])
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input or user already exists
 */
exports.register = async (req, res) => {
  const { username, password, roles } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, password, roles }); // roles can be undefined, model has default
    await user.save();

    const token = generateToken(user._id, user.roles);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      roles: user.roles,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
    console.log(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user and get a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials or missing fields
 *       401:
 *         description: Invalid credentials
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.roles);
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Generate a JWT token (alternative to login, can be specialized)
 *     tags: [Auth]
 *     description: This endpoint is specified to generate a token. It can accept role/permissions in the JSON. For this implementation, it reuses the login logic. If specific roles are passed, they should be validated against the user's actual permissions stored in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role: 
 *                 type: string
 *                 description: Optional role to request. If provided, backend should verify if user is eligible.
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Requested role not permitted for user
 */
// The /api/token route in app.js already points to exports.login.
// If distinct logic is needed for /api/token (e.g., handling `role` from request body to customize token permissions):
/*
exports.generateCustomToken = async (req, res) => {
  const { username, password, role: requestedRole } = req.body;
  // ... (authentication logic similar to login) ...
  // After successful authentication:
  // let rolesForToken = user.roles;
  // if (requestedRole) {
  //   if (user.roles.includes(requestedRole) || user.roles.includes('ADMIN')) { // Example validation
  //     rolesForToken = [requestedRole];
  //   } else {
  //     return res.status(403).json({ message: 'Requested role not permitted for this user' });
  //   }
  // }
  // const token = generateToken(user._id, rolesForToken);
  // res.status(200).json({ token, user: { ... } });
};
*/
    