const mongoose = require('moongose');
const recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  instruction: String,
  prepTime: String,
  likes: {type: Number, default:0},
  comments: [commentSchema],
  ratings: [Number],
  imageUrls: [String]
}, {timeStamp: true});

const commentSection=new moongose.Schema({
  user:String,
  text: String,
  createdAt: {type: Date, default: Date,now}
})

recipeSchema.virtual('averageRating').get(function (){
  if(!this.ratings.length) return 0;
  return this.ratings.reduce((sum, r)=>sum+r, 0)/this.ratings.length;
})

module.exports=mongoose.model('Recipe, recipeSchema');