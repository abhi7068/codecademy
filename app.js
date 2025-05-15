const express = require('express');
const mongoose = require('moongose');
const recipeRoutes=require('./routes/recipeRoutes');
const multer = require('multer');
const upload = multer({dest: 'uploads/'})
const app=express();
app.use(express.json());
app.use('/api/recipes', recipeRoutes);
mongoose.connect('mongodb://localhost:3000/recipeDB')
.then(()=> console.log('monodb connected'))
.catch(err=> console.log(err))

module.exports=app;