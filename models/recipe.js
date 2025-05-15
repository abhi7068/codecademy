const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    prepTime: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [commentSchema],
    ratings: [Number],
    imageUrls: [String]
}, { timestamps: true });

recipeSchema.virtual('averageRating').get(function () {
    if (!this.ratings.length) return 0;
    return this.ratings.reduce((sum, r) => sum + r, 0) / this.ratings.length;
});

module.exports = mongoose.model('Recipe', recipeSchema);