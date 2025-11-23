//================================
//IT ELEC 3 - Sean, Raven, Noreen
//================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());


// REVIEW
const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
}, { _id: false });

// SCHEMA FOR MOVIES
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    reviews: [reviewSchema]
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

// ENDPOINTS

// ROOT
app.get('/', (req, res) => {
    res.send('WELCOME TO MOVIE REVIEW API!');
});

// GET

// Read all movies
app.get('/api/v1/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ title: 1 });
        res.json(movies);
    } catch (err) {
        // 500 Internal Server Error
        res.status(500).json({ message: err.message });
    }
});

// Read one movie
app.get('/api/v1/movies/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            // 404 Not Found
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        res.json(movie);
    } catch (err) {
        // Handle invalid MongoDB ID format errors
        res.status(500).json({ message: err.message });
    }
});

// POST

// Create a new movie
app.post('/api/v1/movies', async (req, res) => {
    const { title } = req.body;

    if (!title) {
        // 400 Bad Request
        return res.status(400).json({ message: 'TITLE REQUIRED!' });
    }

    try {
        const newMovie = new Movie({ title });
        await newMovie.save();
        // 201 Created status
        res.status(201).json(newMovie);
    } catch (err) {
        // Handle duplicate title or other Mongoose validation errors
        res.status(400).json({ message: err.message });
    }
});

// Add a review to a movie
app.post('/api/v1/movies/:id/reviews', async (req, res) => {
    const { rating, comment } = req.body;
    const movieId = req.params.id;

    if (rating === undefined || comment === undefined || rating < 1 || rating > 5) {
        // 400 Bad Request
        return res.status(400).json({ message: 'INVALID COMMENT AND/OR RATING!' });
    }

    try {
        const newReview = { rating, comment };
        
        // Find the movie and push the new review into the reviews array
        const movie = await Movie.findByIdAndUpdate(
            movieId,
            { $push: { reviews: newReview } },
            { new: true } // Return the updated document
        );

        if (!movie) {
            // 404 Not Found
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }
        
        res.json(movie);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT

// Update a movie's title
app.put('/api/v1/movies/:id', async (req, res) => {
    const movieId = req.params.id;
    const { title: newTitle } = req.body; // Destructure and rename 'title' to 'newTitle'

    if (!newTitle) {
        // 400 Bad Request
        return res.status(400).json({ message: 'NEW TITLE REQUIRED!' });
    }

    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            movieId,
            { title: newTitle },
            { new: true, runValidators: true } // 'new: true' returns the updated doc, 'runValidators: true' checks for uniqueness, etc.
        );

        if (!updatedMovie) {
            // 404 Not Found
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }

        res.json(updatedMovie);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE

// Delete a movie
app.delete('/api/v1/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        const deletedMovie = await Movie.findByIdAndDelete(movieId);

        if (!deletedMovie) {
            // 404 Not Found
            return res.status(404).json({ message: 'MOVIE NOT FOUND!' });
        }

        // Return the deleted document as confirmation
        res.json(deletedMovie);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// MONGODB ATLAS
async function startServer() {
    try {
        // Ensure you have MONGODB_URI set in your .env file
        await mongoose.connect(process.env.MONGODB_URI); 
        console.log('✅ Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`🚀 Movie Review API running on http://localhost:${PORT}`));
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
    }
}

//server starter
startServer();
//this is a comment