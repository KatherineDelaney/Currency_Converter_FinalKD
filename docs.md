# Developer Manual

## Audience
This document is intended for future developers who will maintain or extend the **Study Abroad Pay** application. Readers are expected to have general knowledge of web development concepts such as HTML, JavaScript, APIs, and client-server architecture, but they do not need prior knowledge of this specific system.

This manual explains how to install, run, and continue developing the application locally.

## System Overview
Study Abroad Pay consists of two main parts:

- A frontend built with HTML, CSS, and vanilla JavaScript
- A backend server built with Node.js and Express

The backend communicates with the Frankfurter Currency API to perform conversions and uses Supabase to store and retrieve conversion history. The frontend communicates with the backend using `fetch` requests.

## Installation and Setup
To run this application locally, you will need the following installed on your machine:

- Node.js version 18 or higher
- npm
- A Supabase account and project

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/study-abroad-pay.git
cd study-abroad-pay

### Step 2: Install Dependencies
Navigate to the server directory and install dependencies:
cd server
npm install

###Step 3: Environment Variables
Create a .env file inside the server directory and add the following variables:
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3001
These values are required for connecting to the Supabase database and running the server.

##Running the Application

##Running the Backend Server
From the server directory, start the Express server using:
node server.js
The server will run on:
http://localhost:3001

##Running the Frontend

You can run the frontend using a local development server such as Live Server in VS Code or any static file server.
Once running, the frontend will communicate with the backend at:
http://localhost:3001

##Running Tests

This project does not currently include automated tests.
Future developers are encouraged to add unit tests for API endpoints and frontend logic using tools such as Jest or Mocha.

##API Documentation

The backend server exposes the following API endpoints.

##POST /api/save-conversion

##Description:

Converts a currency amount and saves the result to the database.
##Request Body:
{
  "from": "USD",
  "to": "EUR",
  "amount": 100
}
##Response:
{
  "result": 92.5,
  "message": "Saved to database"
}
##GET /api/history
##Description:
Retrieves all saved currency conversion history from the database, ordered by most recent.
##Response:
[
  {
    "id": 1,
    "from_currency": "USD",
    "to_currency": "EUR",
    "amount": 100,
    "result": 92.5,
    "created_at": "2025-12-01T14:22:00Z"
  }
]

###Known Issues
The chart will not display until at least one conversion has been saved
There is no user authentication, so all conversions are shared
Error handling for network failures is minimal
The backend must be running for conversions to work

###Future Development Roadmap
Planned improvements for future versions of the application include:
User authentication and per-user conversion history
Support for additional currencies
Improved error handling and user feedback
Automated testing for backend endpoints
Deployment to a production hosting environment

###Documentation Location
All documentation for this project is included in the main project directory under the docs.md
