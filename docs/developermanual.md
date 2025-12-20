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
git clone https://github.com/KatherineDelaney/Currency_Converter_FinalKD.git
cd Currency_Converter_FinalKD 

### Step 2: Install Dependencies
Install dependencies from the root directory: npm install

### Step 3: Environment Variables
Create a .env file in the root directory and add your Supabase credentials. These are used by index.js to connect to your database:
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000

#### Running the Application

##### Running the Backend Server
This runs the application on a local development server.
From the server directory, start the Express server using: 
npm start (or node index.js)
The server will run on:
http://localhost:3000

##### Running the Frontend
The frontend is served automatically by the backend. Once the server is running, simply open http://localhost:3000 in your browser. The server uses express.static to serve the public folder containing your HTML, CSS, and main.js.

##### Running Tests
This project does not currently include automated tests.
Future developers are encouraged to add unit tests for API endpoints and frontend logic using tools such as Jest or Mocha.

#### API Documentation
The backend server exposes the following API endpoints.

##### POST /api/save-conversion
Description: Fetches live rates from Frankfurter API and saves the record to Supabase.

Body: { "from": "USD", "to": "EUR", "amount": 100 }

##### Description:
Converts a currency amount and saves the result to the database.

##### Request Body:
{
  "from": "USD",
  "to": "EUR",
  "amount": 100
}

##### Response:
{
  "result": 92.5,
  "message": "Saved to database"
}

#### GET /api/history

##### Description:
Retrieves all saved currency conversion history from the database, ordered by most recent.
   
##### Response:
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

## Known Issues
The chart will not display until at least one conversion has been saved
There is no user authentication, so all conversions are shared
Error handling for network failures is minimal
The backend must be running for conversions to work
Current known bug: Database connection requires specific environment variables. If the chart does not populate, please verify the .env configuration.

## Future Development Roadmap
Planned improvements for future versions of the application include:
User authentication and per-user conversion history
Support for additional currencies
Improved error handling and user feedback
Automated testing for backend endpoints
Deployment to a production hosting environment

## Documentation Location
All documentation for this project is included in the main project directory under the docs.md in the docs folder. 
