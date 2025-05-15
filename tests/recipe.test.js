const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Recipe = require('../models/recipe');

describe('Recipe API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Cleanup the database and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Recipe.deleteMany({});
  });

  describe('POST /api/recipes', () => {
    it('should create a new recipe', async () => {
      const recipeData = {
        name: 'Test Recipe',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: 'Test instructions',
        prepTime: '30 minutes'
      };

      const response = await request(app)
        .post('/api/recipes')
        .send(recipeData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(recipeData.name);
      expect(response.body.data.ingredients).toEqual(recipeData.ingredients);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/recipes', () => {
    beforeEach(async () => {
      // Add test data
      await Recipe.create([
        {
          name: 'Recipe 1',
          ingredients: ['ing1', 'ing2'],
          instructions: 'inst1',
          prepTime: '20 mins'
        },
        {
          name: 'Recipe 2',
          ingredients: ['ing3', 'ing4'],
          instructions: 'inst2',
          prepTime: '30 mins'
        }
      ]);
    });

    it('should return paginated recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.recipes.length).toBe(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should search recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .query({ search: 'Recipe 1' });

      expect(response.status).toBe(200);
      expect(response.body.data.recipes.length).toBe(1);
      expect(response.body.data.recipes[0].name).toBe('Recipe 1');
    });

    it('should sort recipes', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .query({ sortBy: 'name', order: 'asc' });

      expect(response.status).toBe(200);
      expect(response.body.data.recipes[0].name).toBe('Recipe 1');
      expect(response.body.data.recipes[1].name).toBe('Recipe 2');
    });
  });

  describe('GET /api/recipes/:id', () => {
    let testRecipe;

    beforeEach(async () => {
      testRecipe = await Recipe.create({
        name: 'Test Recipe',
        ingredients: ['ing1', 'ing2'],
        instructions: 'test instructions',
        prepTime: '25 mins'
      });
    });

    it('should return a recipe by id', async () => {
      const response = await request(app)
        .get(`/api/recipes/${testRecipe._id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(testRecipe.name);
    });

    it('should return 404 for non-existent recipe', async () => {
      const response = await request(app)
        .get('/api/recipes/123456789012345678901234');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/recipes/:id', () => {
    let testRecipe;

    beforeEach(async () => {
      testRecipe = await Recipe.create({
        name: 'Test Recipe',
        ingredients: ['ing1', 'ing2'],
        instructions: 'test instructions',
        prepTime: '25 mins'
      });
    });

    it('should update a recipe', async () => {
      const updateData = {
        name: 'Updated Recipe',
        prepTime: '35 mins'
      };

      const response = await request(app)
        .patch(`/api/recipes/${testRecipe._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.prepTime).toBe(updateData.prepTime);
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    let testRecipe;

    beforeEach(async () => {
      testRecipe = await Recipe.create({
        name: 'Test Recipe',
        ingredients: ['ing1', 'ing2'],
        instructions: 'test instructions',
        prepTime: '25 mins'
      });
    });

    it('should delete a recipe', async () => {
      const response = await request(app)
        .delete(`/api/recipes/${testRecipe._id}`);

      expect(response.status).toBe(200);
      
      const deletedRecipe = await Recipe.findById(testRecipe._id);
      expect(deletedRecipe).toBeNull();
    });
  });

  describe('POST /api/recipes/:id/like', () => {
    let testRecipe;

    beforeEach(async () => {
      testRecipe = await Recipe.create({
        name: 'Test Recipe',
        ingredients: ['ing1', 'ing2'],
        instructions: 'test instructions',
        prepTime: '25 mins',
        likes: 0
      });
    });

    it('should increment recipe likes', async () => {
      const response = await request(app)
        .post(`/api/recipes/${testRecipe._id}/like`);

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(1);
    });
  });

  describe('POST /api/recipes/:id/rate', () => {
    let testRecipe;

    beforeEach(async () => {
      testRecipe = await Recipe.create({
        name: 'Test Recipe',
        ingredients: ['ing1', 'ing2'],
        instructions: 'test instructions',
        prepTime: '25 mins',
        ratings: []
      });
    });

    it('should add rating to recipe', async () => {
      const response = await request(app)
        .post(`/api/recipes/${testRecipe._id}/rate`)
        .send({ rating: 5 });

      expect(response.status).toBe(200);
      expect(response.body.ratings).toContain(5);
    });

    it('should validate rating value', async () => {
      const response = await request(app)
        .post(`/api/recipes/${testRecipe._id}/rate`)
        .send({ rating: 6 });

      expect(response.status).toBe(400);
    });
  });
}); 