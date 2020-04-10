'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv')
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors()); // Middleware

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

// Require modules for routes
const client = require('./util/db');
const locationHandler = require('./modules/locations');
const weatherHandler = require('./modules/weather');
const trailHandler = require('./modules/trails')
const yelpHandler = require('./modules/yelp');

// Add / routes
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.get('/yelp', yelpHandler);
app.get('/movies', movieHandler);

// Has to happen after everything else
app.use(notFoundHandler);
app.use(errorHandler); // Error Middleware

function movieHandler(request, response) {
  let movies = [];
  response.send(movies);
}

// Helper Functions
function errorHandler(error, request, response, next) {
  console.log(error);
  response.status(500).json({
    error: true,
    message: error.message,
  });
}

function notFoundHandler(request, response) {
  response.status(404).json({
    notFound: true,
  });
}

client.connect()
  .then(() => {
    console.log('Database connected.')
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch(error => {
    throw `Something went wrong: ${error}`;
  });
