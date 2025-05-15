const Recipe=require('../models/recipe');


exports.createRecipe=async (req,res)=>{
  try{
    const recipe=await Recipe.create(req.body);
    res.status(201).json(recipe);
  }catch(err){
    res.status(400).json({error: err.message})
  }
}

exports.deleteRecipe=async(req, res)=>{
  try{
   const recipe = await Recipe.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }
  catch(err){
    res.status(404).json({error: 'Recipe not found'})
  }
}


exports.getRecipeById=async(req, res)=>{
  try{
    const recipe=await Recipe.findById(req.params.id);
    if(!recipe) return res.status(404).json({error:'Not found'})
    res.json(recipe)
  }
  catch(err){
    res.status(400).json({error: err.message})
  }
}

exports.listRecipe=async(req, res)=>{
  const {search, sortBy='createdAt', order='desc' , page=1, limit=10}=req.query;
  const query = search ? {name: new RegExp(search, 'i')}:{};
  try{
    const recipe=await Recipe.find(query)
    .sort({[sortBy]: order=='desc' ? -1 : 1})
    .skip((page-1) * limit)
    .limit(Number(limit));
    res.json(recipes);
  } catch(err){
    res.status(500).json({error.err.message})
  }
  
exports.likeRecipe=async (req,res)=>{
  try{
    const recipe=await Recipe.findByIdAndUpdate(req.params.id, {$inc:{likes: 1}}, {new: true});
    res.json(recipe);
  }catch(err){
    res.status(400).json({error: err.message})
  }
}
 
exports.addComment=async (req,res)=>{
  try{
    const {user, text}= req.body;
    const recipe=await Recipe.findById(req.params.id);
    recipe.comments.push({user, text});
    await recipe.save();
    res.json(recipe)
  }catch(err){
    res.status(400).json({error: err.message})
  }
} 

exports.addRating=async (req,res)=>{
  try{
    const {rating}= req.body;
    if(rating < 1 || rating >5) return res.status(400).json({error: "rating must be 1-5"})
    const recipe=await Recipe.findById(req.params.id);
    recipe.ratings.push(rating);
    await recipe.save();
    res.json({averageRating:recipe.averageRating})
  }catch(err){
    res.status(400).json({error: err.message})
  }
} 
  
exports.getTrendingRecipes = async(req, res)=>{
const recipes=await Recipe.find().sort({likes:-1}).limit(5)
res.json(recipes)
}  
  
exports.uploadImages=async (req,res)=>{
    const recipe=await Recipe.findById(req.params.id);
    const paths=req.files.map(f=>f.path);
    recipe.imageUrls.push(...paths);
    await recipe.save();
    res.json(recipe)
} 

exports.deleteImage=async (req,res)=>{
  const {id, imageName}=req.params;
    const recipe=await Recipe.findById(id);
    recipe.imageUrls= recipe.imageUrls.filter(url=> !url.includes(imageName))
    await recipe.save();
    res.json(recipe)
} 
}