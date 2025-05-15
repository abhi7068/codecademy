const Recipe = require('../models/recipe');

// Validation helper
const validateRecipeInput = (body) => {
  const errors = {};
  
  // Required fields validation
  if (!body.name || body.name.trim() === '') {
    errors.name = 'Recipe name is required';
  }
  
  if (!body.ingredients || !Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    errors.ingredients = 'At least one ingredient is required';
  }
  
  if (!body.instructions || body.instructions.trim() === '') {
    errors.instructions = 'Instructions are required';
  }
  
  if (!body.prepTime || body.prepTime.trim() === '') {
    errors.prepTime = 'Preparation time is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

exports.createRecipe = async (req, res) => {
  try {
    // Parse JSON data if it's sent as form-data
    let recipeData = req.body;
    if (typeof req.body.ingredients === 'string') {
      try {
        recipeData = {
          ...req.body,
          ingredients: JSON.parse(req.body.ingredients)
        };
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid ingredients format',
          details: 'Ingredients should be a valid JSON array'
        });
      }
    }

    // Validate input
    const { isValid, errors } = validateRecipeInput(recipeData);
    if (!isValid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }

    // Process uploaded files
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Prepare recipe data
    const recipe = {
      name: recipeData.name.trim(),
      ingredients: recipeData.ingredients.map(ing => ing.trim()),
      instructions: recipeData.instructions.trim(),
      prepTime: recipeData.prepTime.trim(),
      imageUrls: imageUrls,
      likes: 0,
      comments: [],
      ratings: []
    };

    // Create recipe
    const createdRecipe = await Recipe.create(recipe);
    
    // Send response
    res.status(201).json({
      message: 'Recipe created successfully',
      data: createdRecipe
    });
  } catch (err) {
    res.status(400).json({ 
      error: 'Failed to create recipe',
      details: err.message 
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        error: 'Invalid recipe ID format'
      });
    }

    // Find and delete the recipe
    const recipe = await Recipe.findById(id);
    
    // Check if recipe exists
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found'
      });
    }

    // Delete the recipe
    await recipe.deleteOne();

    // Send success response
    res.status(200).json({ 
      message: 'Recipe deleted successfully',
      data: recipe
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to delete recipe',
      details: err.message 
    });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        error: 'Invalid recipe ID format'
      });
    }

    // Check if recipe exists
    const existingRecipe = await Recipe.findById(id);
    if (!existingRecipe) {
      return res.status(404).json({ 
        error: 'Recipe not found'
      });
    }

    // Prepare update data with only provided fields
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.ingredients) updateData.ingredients = req.body.ingredients.map(ing => ing.trim());
    if (req.body.instructions) updateData.instructions = req.body.instructions.trim();
    if (req.body.prepTime) updateData.prepTime = req.body.prepTime.trim();
    if (req.body.imageUrls) updateData.imageUrls = req.body.imageUrls;

    // Update the recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    );

    // Send response
    res.status(200).json({
      message: 'Recipe updated successfully',
      data: updatedRecipe
    });
  } catch (err) {
    res.status(400).json({ 
      error: 'Failed to update recipe',
      details: err.message 
    });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listRecipe = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      search = '',
      category = '',
      minPrepTime,
      maxPrepTime
    } = req.query;

    // Build query object
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { instructions: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add prep time range filter if provided
    if (minPrepTime || maxPrepTime) {
      query.prepTime = {};
      if (minPrepTime) query.prepTime.$gte = minPrepTime;
      if (maxPrepTime) query.prepTime.$lte = maxPrepTime;
    }

    // Validate page and limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ 
        error: 'Invalid page number. Page must be a positive integer.' 
      });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        error: 'Invalid limit. Limit must be between 1 and 100.' 
      });
    }

    // Validate sort parameters
    const allowedSortFields = ['name', 'createdAt', 'prepTime', 'likes'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ 
        error: `Invalid sort field. Allowed fields are: ${allowedSortFields.join(', ')}` 
      });
    }

    if (!['asc', 'desc'].includes(order.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid sort order. Must be either "asc" or "desc"' 
      });
    }

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const recipes = await Recipe.find(query)
      .sort({ [sortBy]: order.toLowerCase() === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v'); // Exclude version key

    // Get total count for pagination
    const totalRecipes = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(totalRecipes / limitNum);

    // Send response
    res.status(200).json({
      status: 'success',
      data: {
        recipes,
        pagination: {
          total: totalRecipes,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filters: {
          search,
          category,
          minPrepTime,
          maxPrepTime
        },
        sort: {
          field: sortBy,
          order
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching recipes',
      error: err.message
    });
  }
};

exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          comments: {
            user: req.body.user,
            text: req.body.text,
            createdAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $push: { ratings: rating } },
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ 
      averageRating: recipe.averageRating,
      ratings: recipe.ratings
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTrendingRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ likes: -1 })
      .limit(5);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $push: { imageUrls: { $each: req.files.map(f => f.path) } } },
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { 
        $set: { 
          imageUrls: { 
            $filter: {
              input: "$imageUrls",
              cond: { $not: { $regexMatch: { input: "$$this", regex: imageName } } }
            }
          }
        }
      },
      { new: true, runValidators: true }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};