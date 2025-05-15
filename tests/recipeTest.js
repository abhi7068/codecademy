const request= require('supertest');
const app=require('../app');
const mongoose= require('mongoose');

beforeAll(async ()=>{
  await mongoose.connect('mongodb://localhost:3000/recipeDB-test')
})

afterAll(async ()=>{
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
})

describe('Recipe API', ()=>{
  it('should create a recipe', async ()=>{
    const res= await request(app).post('/api/recipes').send({
      name: 'test dish',
      ingredients: ['salt'],
      instructions: 'cook well',
      prepTime: '15 min'
    })
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('test dish')
  })
  
    it('should fetch a list of recipes', async ()=>{
    const res= await request(app).get('/api/recipes')
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true)
  })
  
})