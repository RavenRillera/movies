// models/Movie.js
const mongoose = require('mongoose');

// DATABASE SCHEMAS
const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    reviews: [reviewSchema]
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;