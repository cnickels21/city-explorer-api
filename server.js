'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv')
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT;
const app = express();

app.use(cors()); // Middleware

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

// Add /location route
app.get('/location', locationHandler);

// Route Handler
function locationHandler(request, response) {

  const city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';

  superagent.get(url)
    .query({
      key: process.env.GEO_KEY,
      q: city,
      format: 'json'
    })
    .then(locationResponse => {
      let geoData = locationResponse.body;
      const location = new Location(city, geoData);
      response.send(location);
    })

}

app.get('/weather', weatherHandler);

function weatherHandler(request, response) {
  const weatherData = require('./data/darksky.json');
  const weatherResults = [];
  weatherData.daily.data.forEach(dailyWeather => {
    weatherResults.push(new Weather(dailyWeather))
  });
  response.send(weatherResults);
  // const weather = request.query;  TODO: get lat/lon
}

// Has to happen after everything else
app.use(notFoundHandler);
// Has to happen after the error might have occurred
app.use(errorHandler); // Error Middleware

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

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}

function Weather(weatherData) {
  this.forecast = weatherData.summary;
  this.time = new Date(weatherData.time * 1000);
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));