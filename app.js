const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');               // Middleware for Cross-Origin Resource Sharing
const morgan = require('morgan');           // Middleware for HTTP request logging
// const { check, validationResult } = require('express-validator'); // Middleware for request validation
const path = require('path');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const compression = require("compression");
require('dotenv').config();                 // Middleware for environment variable management

// import routes
const postsRoutes = require("./Routes/posts.routes");
const commentsRoutes = require("./Routes/comments.routes");
const usersRoutes = require("./Routes/users.routes");
const centralAuthRoutes = require("./Routes/centraAuth.routes");

const app = express();

// Middleware section
app.use(express.json());                    // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads >>> allow using req.body
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));          // Serve static files from the 'Public' directory
app.use(cors());                            // Enable CORS, this one for deployment reasons to access the api from any ware.
app.use(morgan('dev'));                     // Log HTTP requests, for debugging and logging
app.use(helmet());
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per window
// });
// app.use(limiter);
app.use(xss());
app.use(compression());

// Routes section
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", centralAuthRoutes);


const port = process.env.PORT || 1234;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb://127.0.0.1:27017/Socialmedia"

// Connect to MongoDB on Socialmedia database
mongoose.connect(MONGODB_CONNECTION_STRING)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Start the server

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 
