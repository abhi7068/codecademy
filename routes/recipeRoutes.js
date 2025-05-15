const express = require('express');
const router=express.Router();
const recipeController=require('../controllers/recipeController');

router.post('/', recipeController.createRecipe);
router.delete('/:id', recipeController.deleteRecipe);
router.patch('/:id', recipeController.updateRecipe);
router.get('/:id', recipeController.getRecipeByIdRecipe);
router.get('/', recipeController.listRecipe);
router.post('/:id/like', recipeController.likeRecipe);
router.post('/:id/comment', recipeController.addComment);
router.post('/:id/rate', recipeController.addRating);
router.get('/trending', recipeController.getTrendingRecipes)
router.post('/:id/images', upload.array('images'), recipeController.uploadImages);
router.delete('/:id/images/:imageName', recipeController.deleteImage);

module.exports=router;