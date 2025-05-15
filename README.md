 # Recipe API

A RESTful API for managing recipes, built with Node.js, Express, and MongoDB.

## Features

- CRUD operations for recipes
- Image upload support
- Pagination and filtering
- Search functionality
- Rating and commenting system
- Like/unlike recipes
- Trending recipes

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recipe-api
```

2. Install dependencies:
```bash
npm install
```

3. Create uploads directory:
```bash
mkdir uploads
```

4. Set up environment variables (create .env file):
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
Currently, the API doesn't require authentication.

### Endpoints

#### 1. Recipes

##### Create Recipe
- **POST** `/recipes`
- **Content-Type**: `multipart/form-data`
```json
{
  "name": "Recipe Name",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Step by step instructions",
  "prepTime": "30 minutes",
  "images": [file1, file2]  // Optional
}
```

##### List Recipes
- **GET** `/recipes`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10, max: 100)
  - `sortBy`: Sort field (name, createdAt, prepTime, likes)
  - `order`: Sort order (asc, desc)
  - `search`: Search term
  - `category`: Filter by category
  - `minPrepTime`: Minimum preparation time
  - `maxPrepTime`: Maximum preparation time

##### Get Recipe by ID
- **GET** `/recipes/:id`

##### Update Recipe
- **PATCH** `/recipes/:id`
```json
{
  "name": "Updated Name",
  "ingredients": ["updated ingredient"],
  "instructions": "Updated instructions",
  "prepTime": "45 minutes"
}
```

##### Delete Recipe
- **DELETE** `/recipes/:id`

#### 2. Recipe Interactions

##### Like Recipe
- **POST** `/recipes/:id/like`

##### Add Comment
- **POST** `/recipes/:id/comment`
```json
{
  "user": "User Name",
  "text": "Comment text"
}
```

##### Add Rating
- **POST** `/recipes/:id/rate`
```json
{
  "rating": 5  // Number between 1-5
}
```

##### Get Trending Recipes
- **GET** `/recipes/trending`

### Response Formats

#### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

#### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

#### Pagination Response
```json
{
  "status": "success",
  "data": {
    "recipes": [],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "search": "",
      "category": "",
      "minPrepTime": null,
      "maxPrepTime": null
    },
    "sort": {
      "field": "createdAt",
      "order": "desc"
    }
  }
}
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Development

### Directory Structure
```
recipe-api/
├── controllers/
│   └── recipeController.js
├── middleware/
│   └── uploadMiddleware.js
├── models/
│   └── recipe.js
├── routes/
│   └── recipeRoutes.js
├── uploads/
├── app.js
├── server.js
└── package.json
```

## Testing

Run tests using:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License