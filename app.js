const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const recipeRoutes = require('./routes/recipeRoutes');
// const multer = require('multer');
// const upload = multer({dest: 'uploads/'})
const app = express();

// Middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/recipes', recipeRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = app;