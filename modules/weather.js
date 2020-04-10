'use strict';

const superagent = require('superagent');
const errorHandler = require('./errors');
const notFoundHandler = require('./modules/errors');

function weatherHandler(request, response) {

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
        .catch(error => {
            console.log(error);
            errorHandler(error, request, response);
        })
}

function Weather(weatherData) {
    this.forecast = weatherData.weather.description;
    this.time = new Date(weatherData.ob_time).toDateString();
}

module.exports = weatherHandler;