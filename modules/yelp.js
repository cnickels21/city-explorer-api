'use strict';

const superagent = require('superagent');
const errorHandler = require('./errors');
const notFoundHandler = require('./modules/errors');

function yelpHandler(request, response) {
    console.log(request.query);
    const lat = request.query.latitude;
    const lon = request.query.longitude;
    const restaurants = request.query.restaurants;
    // const type = request.query.restaurants;
    const url = 'https://api.yelp.com/v3/businesses/search';
  
    superagent.get(url)
      .set('Authorization', 'Bearer ' + process.env.YELP_KEY)
      .query({
        latitude: lat,
        longitude: lon,
        category: restaurants
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

  function Restaurant(yelpData) {
    this.name = yelpData.name;
    this.image_url = yelpData.image_url;
    this.price = yelpData.price;
    this.rating = yelpData.rating;
    this.url = yelpData.url;
  }

  module.exports = yelpHandler;