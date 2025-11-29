//================================
//IT ELEC 3 - Sean, Raven, Noreen
//================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

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
        servers: [
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
    apis: ['./moby.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
    customCss: `
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
    `,
    customSiteTitle: 'ITelekinesis API Documentation',
    customfavIcon: 'https://cdn-icons-png.flaticon.com/512/3418/3418886.png'
};

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));


// ==================== DATABASE SCHEMAS ====================

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    reviews: [reviewSchema]
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);


// ==================== ENDPOINTS ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ==================== MOVIES (CRUD) ====================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Serves the ITelekinesis frontend application (usually index.html)
 *     responses:
 *       200:
 *         description: Frontend HTML page
 */

/**
 * @swagger
 * /api/v1/movies:
 *   get:
 *     summary: Get all movies
 *     description: Retrieve a list of all movies sorted alphabetically by title
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: A list of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Internal server error
 */
app.get('/api/v1/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ title: 1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     description: Retrieve a single movie by its MongoDB ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
app.get('/api/v1/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/v1/movies:
 *   post:
 *     summary: Create a new movie
 *     description: Add a new movie to the database
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieInput'
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Bad request (title required or duplicate title)
 */
app.post('/api/v1/movies', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'TITLE REQUIRED!' });
    }
    try {
        const newMovie = new Movie({ title });
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/v1/movies/{id}:
 *   put:
 *     summary: Update a movie's title
 *     description: Update the title of an existing movie (Full update)
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieInput'
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Movie not found
 */
app.put('/api/v1/movies/:id', async (req, res) => {
    const { title: newTitle } = req.body;
    if (!newTitle) {
        return res.status(400).json({ message: 'NEW TITLE REQUIRED!' });
    }
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title: newTitle },
            { new: true, runValidators: true }
        );
        if (!updatedMovie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json(updatedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/v1/movies/{id}:
 *   delete:
 *     summary: Delete a movie
 *     description: Remove a movie and all its associated reviews from the database
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/v1/movies/:id', async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json(deletedMovie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ==================== REVIEWS (Nested Resource CRUD) ====================

/**
 * @swagger
 * /api/v1/movies/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a movie
 *     description: Retrieve all reviews posted for a specific movie by its ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewsResponse'
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
app.get('/api/v1/movies/:id/reviews', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id, 'title reviews');
        if (!movie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json({
            movieId: req.params.id,
            title: movie.title,
            reviews: movie.reviews
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/v1/movies/{id}/reviews:
 *   post:
 *     summary: Add a review to a movie
 *     description: Add a new review (rating and comment) to an existing movie
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid rating or comment
 *       404:
 *         description: Movie not found
 */
app.post('/api/v1/movies/:id/reviews', async (req, res) => {
    const { rating, comment } = req.body;
    if (rating === undefined || comment === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'INVALID COMMENT AND/OR RATING!' });
    }
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { $push: { reviews: { rating, comment } } },
            { new: true }
        );
        if (!movie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json(movie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/v1/movies/{movieId}/reviews/{reviewId}:
 *   patch:
 *     summary: Update a specific review
 *     description: Modify the rating and/or comment of an existing review within a movie.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie containing the review
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 3
 *               comment:
 *                 type: string
 *                 example: "It was okay, slightly adjusted."
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Invalid input or rating
 *       404:
 *         description: Movie or Review not found
 */
app.patch('/api/v1/movies/:movieId/reviews/:reviewId', async (req, res) => {
    const { movieId, reviewId } = req.params;
    const { rating, comment } = req.body;

    if ((rating !== undefined && (rating < 1 || rating > 5)) || (!rating && !comment)) {
        return res.status(400).json({ message: 'INVALID RATING (must be 1-5) OR MISSING DATA.' });
    }

    const updateFields = {};
    if (rating !== undefined) updateFields['reviews.$.rating'] = rating;
    if (comment !== undefined) updateFields['reviews.$.comment'] = comment;

    try {
        const updatedMovie = await Movie.findOneAndUpdate(
            { _id: movieId, 'reviews._id': reviewId },
            { $set: updateFields },
            { new: true, runValidators: true } 
        );

        if (!updatedMovie) {
            return res.status(404).json({ message: 'MOVIE or REVIEW NOT FOUND!' });
        }

        res.json(updatedMovie);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/v1/movies/{movieId}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a specific review
 *     description: Remove a review from a movie using its ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/v1/movies/:movieId/reviews/:reviewId', async (req, res) => {
    const { movieId, reviewId } = req.params;

    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            movieId,
            { $pull: { reviews: { _id: reviewId } } },
            { new: true } 
        );

        if (!updatedMovie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' }); 
        }

        res.status(200).json(updatedMovie);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ==================== SERVER STARTUP ====================

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
        console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
    }
}

startServer();
