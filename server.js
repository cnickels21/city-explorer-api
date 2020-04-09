'use strict';

// Load Environment Variables from the .env file
const dotenv = require('dotenv')
dotenv.config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

if (!process.env.DATABASE_URL) {
  throw 'Missing DATABASE_URL';
}

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => { throw error; });

// Application Setup
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors()); // Middleware

app.get('/', (request, response) => {
  response.send('City Explorer Goes Here');
});

function setLocationInCache(city, location) {
  locationCache[city] = {
    cacheTime: new Date.now(),
    location,
  }
  console.log('Did the location cache?', locationCache)
}

function getLocationFromCache(city) {
  const cacheEntry = locationCache[city];
  if (cacheEntry) {
    return cacheEntry.location;
  }
  return null;
}

// Add /location route
app.get('/location', locationHandler);

// Route Handler
function locationHandler(request, response) {

  const city = request.query.city;

  const locationFromCache = getLocationFromCache(city);
  if (locationFromCache) {
    response.send(locationFromCache);
  } else {
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
      setLocationInCache(city, location);
      response.send(location);
    })
    .catch( error => {
      console.log(error);
      errorHandler(error, request, response);
    })
  }
}

app.get('/weather', weatherHandler);

function weatherHandler(request, response) {

  // const weatherData = require('./data/darksky.json');

  const weather = request.query.search_query;
  const url = 'http://api.weatherbit.io/v2.0/current';

  superagent.get(url)
    .query({
      key: process.env.WEATHER_KEY,
      city: weather,
      format: 'json'
    })
    .then(weatherResponse => {
      let weatherData = weatherResponse.body;
      let dailyResults = weatherData.data.map(dailyWeather => {
        return new Weather(dailyWeather);
      })
      response.send(dailyResults);
    })
    .catch( error => {
      console.log(error);
      errorHandler(error, request, response);
    })

  // const weather = request.query;  TODO: get lat/lon

}

app.get('/trails', trailHandler);

function trailHandler(request, response) {

  const lat = request.query.latitude;
  const lon =  request.query.longitude;
  const url = 'https://www.hikingproject.com/data/get-trails';

  superagent.get(url)
    .query({
      key: process.env.TRAILS_KEY,
      lat: lat,
      lon: lon,
      format: 'json'
    })
    .then( trailsResponse => {
      let trailsData = trailsResponse.body;
      let trailsResults = trailsData.trails.map( allTrails => {
        return new Trails(allTrails);
      })
      response.send(trailsResults);
    })
    .catch( error => {
      console.log(error);
      errorHandler(error, request, response);
    })
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

client.connect()
  .then(() => {
    console.log('Database connected.')
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch(error => {
    throw `Something went wrong: ${error}`;
  })

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat);
  this.longitude = parseFloat(geoData[0].lon);
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = new Date(weatherData.ob_time).toDateString();
}

function Trails(trailsData) {
  this.name = trailsData.name;
  this.location = trailsData.location;
  this.length = trailsData.length;
  this.stars = trailsData.stars;
  this.starVotes = trailsData.starVotes;
  this.summary = trailsData.summary;
  this.trail_url = trailsData.url;
  this.conditions = trailsData.conditionDetails;
  this.condition_date = new Date(trailsData.conditionDate).toDateString();
}

// app.listen(PORT, () => console.log(`Listening on ${PORT}`));