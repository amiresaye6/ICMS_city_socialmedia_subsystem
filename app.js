const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');               // Middleware for Cross-Origin Resource Sharing
const morgan = require('morgan');           // Middleware for HTTP request logging
// const { check, validationResult } = require('express-validator'); // Middleware for request validation
require('dotenv').config();                 // Middleware for environment variable management

// import routes
const postsRoutes = require("./Routes/posts.routes")

const app = express();

// Middleware section
app.use(express.json());                    // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads >>> allow using req.body
app.use(express.static('Public'));          // Serve static files from the 'Public' directory
app.use(cors());                            // Enable CORS, this one for deployment reasons to access the api from any ware.
app.use(morgan('dev'));                     // Log HTTP requests, for debugging and logging

// Routes section
app.use("/api/posts", postsRoutes)


const port = process.env.PORT || 5555;

// Connect to MongoDB on Socialmedia database
mongoose.connect('mongodb://127.0.0.1:27017/Socialmedia')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
