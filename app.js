// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment or default

// SWAGGER CONFIGURATION
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🎬 ITelekinesis Movie Review API',
            version: '1.1.0',
            contact: {
                name: 'IT ELEC 3 - Sean, Raven, Noreen'
            }
        },
        servers: process.env.VERCEL_URL 
            ? [
                {
                    url: `https://${process.env.VERCEL_URL}`,
                    description: 'Production server'
                }
            ]
            : [
                {
                    url: `http://localhost:${PORT}`,
                    description: 'Development server'
                }
            ],
        tags: [
            { name: 'Movies', description: 'CRUD operations for movies' },
            { name: 'Reviews', description: 'Operations for movie reviews' }
        ],
        components: {
            schemas: {
                Review: {
                    type: 'object',
                    required: ['rating', 'comment'],
                    properties: {
                        _id: { type: 'string', description: 'Auto-generated Review ID', example: '66a1b873f4e2c0e8d0a3d4f1' }, 
                        rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating from 1 to 5', example: 4 },
                        comment: { type: 'string', description: 'Review comment', example: 'Great movie! Highly recommended.' }
                    }
                },
                Movie: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        _id: { type: 'string', description: 'Auto-generated MongoDB ID', example: '507f1f77bcf86cd799439011' },
                        title: { type: 'string', description: 'Movie title (must be unique)', example: 'Inception' },
                        reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' }, description: 'Array of reviews' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
                    }
                },
                MovieInput: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string', description: 'Movie title', example: 'The Dark Knight' }
                    }
                },
                ReviewInput: {
                    type: 'object',
                    required: ['rating', 'comment'],
                    properties: {
                        rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating from 1 to 5', example: 5 },
                        comment: { type: 'string', description: 'Your review comment', example: 'One of the best movies ever made!' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', description: 'Error message', example: 'MOVIE NOT FOUND!' }
                    }
                },
                ReviewsResponse: {
                    type: 'object',
                    properties: {
                        movieId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        title: { type: 'string', example: 'Inception' },
                        reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } }
                    }
                }
            }
        }
    },
    // The path here should point to the file(s) that contain the JSDoc comments for routes
    apis: [path.join(__dirname, 'routes', 'movieRoutes.js')] 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Swagger JSON spec
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Serve Swagger UI with CDN assets (works on Vercel serverless)
app.get('/api-docs', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ITelekinesis API Documentation</title>
    <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/3418/3418886.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css">
    <style>
        body { margin: 0; background: #1a1a1a; }
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #d4af37; font-size: 2.5rem; }
        .swagger-ui .info { margin: 30px 0; }
        .swagger-ui .info .title small { display: none !important; }
        .swagger-ui .info .title .version-stamp { display: none !important; }
        .swagger-ui .info hgroup.main a { display: none !important; }
        .swagger-ui .info .base-url { display: none !important; }
        .swagger-ui .info .description { display: none !important; }
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2a9d8f; }
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #e76f51; }
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #f4a261; }
        .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #264653; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #e63946; }
        .swagger-ui .btn.execute { background: #d4af37; border-color: #d4af37; }
        .swagger-ui .btn.execute:hover { background: #b8973a; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: '/api-docs/swagger.json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: 'StandaloneLayout'
            });
        };
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mount Movie Routes
app.use('/api/v1', movieRoutes); 

module.exports = app;