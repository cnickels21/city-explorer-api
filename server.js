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

// Add / routes
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.get('/yelp', yelpHandler);

// Has to happen after everything else
app.use(notFoundHandler);
app.use(errorHandler); // Error Middleware

function yelpHandler(request, response) {
  console.log(request.query);
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  // const type = request.query.restaurants;
  const url = 'https://api.yelp.com/v3/businesses/search';

  superagent.get(url)
    .set('Authorization', 'Bearer ' + process.env.YELP_KEY)
    .query({
      latitude: lat,
      longitude: lon,
      term: restaurants
    })
    .then(yelpResponse => {
      let yelpData = yelpResponse.body;
      let yelpResults = yelpData.businesses.map(allRestaurants => {
        return new Restaurant(allRestaurants);
      })
      response.send(yelpResults);
    })
    .catch(error => {
      console.log(error);
      errorHandler(error, request, response);
  })
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

  function Restaurant(yelpData) {
    this.name = yelpData.name;
    this.image_url = yelpData.image_url;
    this.price = yelpData.price;
    this.rating = yelpData.rating;
    this.url = yelpData.url;
  }