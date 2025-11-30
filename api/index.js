// api/index.js - Vercel Serverless Function Entry Point
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');

// Cache the database connection
let isConnected = false;

async function connectDB() {
    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
    }
}

// Wrap the Express app for serverless
module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
};

