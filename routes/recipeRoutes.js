const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const upload = require('../middleware/uploadMiddleware');

// Basic CRUD operations
router.post('/', upload.array('images', 5), recipeController.createRecipe);
router.get('/', recipeController.listRecipe);
router.get('/:id', recipeController.getRecipeById);
router.patch('/:id', upload.array('images', 5), recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

// Additional features
router.post('/:id/like', recipeController.likeRecipe);
router.post('/:id/comment', recipeController.addComment);
router.post('/:id/rate', recipeController.addRating);
router.get('/trending', recipeController.getTrendingRecipes);

module.exports = router;