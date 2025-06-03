const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const recentSearchRoutes = require('./routes/recentSearchRoutes');

const app = express();

// Middleware
app.use(cors()); // Consider configuring CORS properly for production
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger Options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Search API with Auth',
      version: '1.0.0',
      description: 'API for managing user favorites and recent searches with JWT authentication.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // Path to the API docs (e.g. JSDoc comments)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recent-searches', recentSearchRoutes);

// Basic /api/token endpoint as per prompt, could be part of authRoutes or standalone
// This implementation assumes it is similar to login but perhaps for specific token types or refresh in future.
// For now, it can be an alias or a more specialized version of login.
app.post('/api/token', require('./controllers/authController').login); // Re-using login for /api/token

// Global error handler (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!', error: err.message });
});

module.exports = app;