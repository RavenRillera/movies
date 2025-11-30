// server.js
// IT ELEC 3 - Sean, Raven, Noreen
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Frontend: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        process.exit(1); // Exit process with failure
    }
}

startServer();