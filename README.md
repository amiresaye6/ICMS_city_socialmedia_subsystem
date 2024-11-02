# City Social Media Platform - ICMS

## Overview
The **City Social Media Platform** is a key subsystem of the **Integrated City Management System (ICMS)**. This platform is designed to bridge the gap between citizens and city authorities, enabling streamlined communication regarding city events, alerts, and issue reporting. Citizens can post text, images, and videos related to city infrastructure, tag relevant departments, and receive updates on issues they report. City authorities can respond, provide feedback, and manage citywide announcements to keep citizens informed.

## Features
- **Two Streams**:
  - **Citizen Stream**: Allows citizens to create and view posts, tag city authorities, and share updates on local events.
  - **City Alerts Stream**: Displays official alerts, warnings, and announcements for quick citizen access to important updates.
- **Tagging System**: Citizens can tag specific city departments (e.g., Electrical, Plumbing) in posts related to their services.
- **Post Status Updates**: Posts progress through phases such as “Not read,” “Under processing,” “Taking action,” and “Feedback.”
- **Notifications**: City departments receive notifications for tagged posts, and citizens are notified of status updates on their submissions.

## Contributors
- **[Amir Alsayed](https://github.com/amir-alsayed)** ![GitHub Icon](https://img.icons8.com/material-outlined/24/000000/github.png) - Team Leader, Backend Developer
- **[Esraa Elsofy](https://github.com/esraa-elsofy)** ![GitHub Icon](https://img.icons8.com/material-outlined/24/000000/github.png) - Backend Developer
- **[Mahmoud Fathy](https://github.com/mahmoud-fathy)** ![GitHub Icon](https://img.icons8.com/material-outlined/24/000000/github.png) - Frontend Developer

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Middleware**: Redux (for state management)
- **Styling**: CSS, Responsive Design

## Project Structure
```plaintext
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/                # UI Components
│   │   │   ├── Header.component.js     # Header component
│   │   │   ├── Footer.component.js     # Footer component
│   │   │   └── PostCard.component.js   # Post card component
│   │   ├── pages/                     # Application pages (Home, Alerts, etc.)
│   │   │   ├── Home.page.js           # Home page
│   │   │   ├── Alerts.page.js         # Alerts page
│   │   │   └── Profile.page.js        # User profile page
│   │   ├── services/                  # API services
│   │   │   ├── user.service.js         # User API service
│   │   │   ├── post.service.js         # Post API service
│   │   │   └── alert.service.js        # Alert API service
│   │   └── store/                     # Redux store and slices
│   │       ├── store.js                # Store configuration
│   │       ├── userSlice.js            # User slice
│   │       └── postSlice.js            # Post slice
│   ├── .env                            # Environment variables for frontend
│   ├── .gitignore                      # Git ignore file for frontend
│   └── package.json                    # Frontend dependencies and scripts
├── backend/
│   ├── models/                        # MongoDB schema definitions
│   │   ├── User.model.js              # User schema
│   │   ├── Post.model.js              # Post schema
│   │   └── Comment.model.js           # Comment schema
│   ├── routes/                        # API routes
│   │   ├── users.routes.js            # User routes
│   │   ├── posts.routes.js            # Post routes
│   │   └── alerts.routes.js           # Alert routes
│   ├── controllers/                   # Request handlers
│   │   ├── user.controller.js          # User request handlers
│   │   ├── post.controller.js          # Post request handlers
│   │   └── alert.controller.js         # Alert request handlers
│   ├── middleware/                    # Authorization, authentication, etc.
│   │   ├── auth.middleware.js          # Authentication middleware
│   │   └── error.middleware.js         # Error handling middleware
│   ├── .env                            # Environment variables for backend
│   ├── .gitignore                      # Git ignore file for backend
│   └── server.js                       # Main server file
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB
- Recommended: npm or Yarn as the package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amiresaye6/ICMS_city_socialmedia_subsystem.git
   cd ICMS_city_socialmedia_subsystem
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `backend` directory and add your MongoDB connection string and other secrets:
   ```plaintext
   MONGO_URI=<Your MongoDB URI>
   PORT=4000
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

## API Documentation
API endpoints allow CRUD operations for posts, alerts, tagging, and notifications. Refer to the [API Documentation](link-to-documentation) for details on routes and usage.

## Roadmap
- **Phase 1**: Planning and Requirements Gathering
- **Phase 2**: Development (Ongoing)
- **Phase 3**: Testing and Documentation

## Contributing
Contributions are welcome. Please read our [Contribution Guidelines](link-to-guidelines) for more details on our development process.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
Special thanks to our team and mentors at [University/Organization Name] for their guidance and support.
