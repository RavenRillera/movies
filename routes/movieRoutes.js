
// routes/movieRoutes.js
const express = require('express');
const Movie = require('../models/Movie'); // Import the Movie model
const router = express.Router();

// ==================== MOVIES (CRUD) ====================

/**
 * @swagger
 * /movies:
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
router.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ title: 1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /movies/{id}:
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
router.get('/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json(movie);
    } catch (err) {
        // This handles invalid ID format (CastError)
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /movies:
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
router.post('/movies', async (req, res) => {
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
 * /movies/{id}:
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
router.put('/movies/:id', async (req, res) => {
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
 * /movies/{id}:
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
router.delete('/movies/:id', async (req, res) => {
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
 * /movies/{id}/reviews:
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
router.get('/movies/:id/reviews', async (req, res) => {
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
 * /movies/{id}/reviews:
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
router.post('/movies/:id/reviews', async (req, res) => {
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
 * /movies/{movieId}/reviews/{reviewId}:
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
router.patch('/movies/:movieId/reviews/:reviewId', async (req, res) => {
    const { movieId, reviewId } = req.params;
    const { rating, comment } = req.body;

    if ((rating !== undefined && (rating < 1 || rating > 5)) || (rating === undefined && comment === undefined)) {
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
 * /movies/{movieId}/reviews/{reviewId}:
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
router.delete('/movies/:movieId/reviews/:reviewId', async (req, res) => {
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

module.exports = router;
